import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  type QueryDocumentSnapshot,
  type Unsubscribe,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { Brand } from "@/constants/brand";
import { branchById } from "@/data/branches";
import { AppNotification, NewNotification } from "@/data/notifications";
import { findPromo, price, promoProblem } from "@/data/promos";
import { CartLine, priceLines, subtotalOf } from "@/lib/cart";
import { canCancel, effectiveStatus } from "@/lib/order-status";
import { formatMoney } from "@/lib/format";
import { db } from "../config/firebase";
import { collectPayment, PaymentMethod, PaymentStatus } from "./payments";
import { userRef } from "./users";

/* --------------------------------- types --------------------------------- */

export type OrderStatus = "placed" | "preparing" | "on_the_way" | "ready" | "delivered" | "collected" | "cancelled";
export type OrderMode = "delivery" | "pickup";

export type OrderItem = {
  itemId: string;
  name: string;
  emoji: string;
  qty: number;
  unitPrice: number;
  /** human-readable summary of the chosen size / add-ons */
  options: string;
  /** raw choices, kept so "order again" rebuilds the exact same line */
  sizeId?: string;
  addOnIds?: string[];
  note?: string;
};

export type Order = {
  id: string;
  reference: string;
  ts: number;
  status: OrderStatus;
  mode: OrderMode;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  promo?: string;
  payment: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** delivery: the saved address label ("Home"); pickup: the branch name */
  placeLabel: string;
  /** delivery: street address; pickup: branch address */
  placeLine: string;
  note?: string;
  etaMins: number;
  points: number;
};

export type Address = { id: string; label: string; line: string };

export type PlaceOrderInput = {
  lines: CartLine[];
  mode: OrderMode;
  address?: { label: string; line: string };
  branchId?: string;
  payment: PaymentMethod;
  promoCode?: string;
  note?: string;
};

export type Result = { ok: true; id: string; order?: Order } | { ok: false; error: string };

/* -------------------------------- helpers -------------------------------- */

/** Business-rule failure with a message that is safe to show to the customer. */
export class OrderError extends Error {}

const makeRef = () => "EMB-" + Math.random().toString(36).slice(2, 8).toUpperCase();
const path = (uid: string, name: string) => collection(db, "users", uid, name);

function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  if (code === "unavailable" || code === "deadline-exceeded")
    return "Can't reach the server. Check your connection and try again.";
  if (code === "permission-denied") return "You don't have permission to do that. Please sign in again.";
  if (code === "failed-precondition" || code === "aborted") return "That took too long to process. Please try again.";
  return "Something went wrong. Please try again.";
}

async function run(fn: () => Promise<{ id: string; order?: Order }>): Promise<Result> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, error: e.message };
    console.error("[orders]", e);
    return { ok: false, error: friendlyError(e) };
  }
}

const notice = (n: NewNotification) => ({ ...n, ts: Date.now(), unread: true });
const num = (v: unknown, fallback = 0) => (typeof v === "number" && Number.isFinite(v) ? v : fallback);

/* ------------------------------ subscriptions ----------------------------- */

const toOrder = (d: QueryDocumentSnapshot): Order => {
  const x = d.data();
  return {
    id: d.id,
    reference: x.reference ?? d.id,
    ts: num(x.ts, Date.now()),
    status: x.status ?? "placed",
    mode: x.mode === "pickup" ? "pickup" : "delivery",
    items: Array.isArray(x.items) ? x.items : [],
    subtotal: num(x.subtotal),
    delivery: num(x.delivery),
    discount: num(x.discount),
    total: num(x.total),
    promo: x.promo,
    payment: x.payment ?? "cash",
    paymentStatus: x.paymentStatus ?? "pending",
    placeLabel: x.placeLabel ?? "",
    placeLine: x.placeLine ?? "",
    note: x.note,
    etaMins: num(x.etaMins, 30),
    points: num(x.points),
  };
};

const toAddress = (d: QueryDocumentSnapshot): Address => {
  const x = d.data();
  return { id: d.id, label: x.label ?? "Address", line: x.line ?? "" };
};

const toNotification = (d: QueryDocumentSnapshot): AppNotification => {
  const x = d.data();
  return {
    id: d.id,
    title: x.title ?? "",
    desc: x.desc ?? "",
    detail: x.detail ?? "",
    icon: x.icon ?? "notifications",
    type: x.type ?? "Offers",
    ts: num(x.ts, Date.now()),
    unread: x.unread === true,
    action: x.action,
  };
};

type Sub<T> = (uid: string, onData: (rows: T[]) => void, onError: (e: unknown) => void) => Unsubscribe;

const makeSub =
  <T>(name: string, order: [string, "asc" | "desc"], max: number, map: (d: QueryDocumentSnapshot) => T): Sub<T> =>
  (uid, onData, onError) =>
    onSnapshot(query(path(uid, name), orderBy(order[0], order[1]), limit(max)), (s) => onData(s.docs.map(map)), onError);

// Capped so a long-lived account doesn't download its whole history on every launch.
export const subscribeOrders = makeSub("orders", ["ts", "desc"], 100, toOrder);
export const subscribeAddresses = makeSub("addresses", ["createdAt", "desc"], 20, toAddress);
export const subscribeNotifications = makeSub("notifications", ["ts", "desc"], 50, toNotification);

/* --------------------------------- ordering ------------------------------- */

/**
 * Validates the cart against the live menu, recomputes every price (the client never sends
 * a total), takes payment, then writes the order, loyalty points and a notification atomically.
 */
export function placeOrder(uid: string, input: PlaceOrderInput): Promise<Result> {
  return run(async () => {
    const lines = priceLines(input.lines);
    if (lines.length === 0) throw new OrderError("Your cart is empty.");
    if (lines.length !== input.lines.length)
      throw new OrderError("An item in your cart is no longer on the menu. Please review your cart.");

    const subtotal = subtotalOf(lines);
    if (subtotal < Brand.minOrder) throw new OrderError(`The minimum order is ${formatMoney(Brand.minOrder)}.`);

    let placeLabel: string;
    let placeLine: string;
    let pickupMins = 0;
    if (input.mode === "delivery") {
      const a = input.address;
      if (!a?.line.trim()) throw new OrderError("Choose a delivery address.");
      placeLabel = a.label.trim() || "Delivery address";
      placeLine = a.line.trim();
    } else {
      const b = input.branchId ? branchById(input.branchId) : undefined;
      if (!b) throw new OrderError("Choose a branch to collect from.");
      placeLabel = b.name;
      placeLine = b.address;
      pickupMins = b.pickupMins;
    }

    let promo = undefined;
    if (input.promoCode) {
      promo = findPromo(input.promoCode);
      if (!promo) throw new OrderError("That promo code isn't valid.");
      const problem = promoProblem(promo, subtotal);
      if (problem) throw new OrderError(problem);
    }

    const { delivery, discount, total } = price(subtotal, input.mode, promo);
    const longestPrep = Math.max(...lines.map((l) => l.item.prep));
    const etaMins = input.mode === "delivery" ? longestPrep + 20 : Math.max(longestPrep, pickupMins);
    const points = Math.floor(total * Brand.pointsPerNaira);
    const reference = makeRef();

    const pay = await collectPayment(input.payment, total, reference);
    if (!pay.ok) throw new OrderError(pay.error);

    const orderRef = doc(path(uid, "orders"));
    const notifRef = doc(path(uid, "notifications"));
    const order: Omit<Order, "id"> = {
      reference,
      ts: Date.now(),
      status: "placed",
      mode: input.mode,
      items: lines.map((l) => ({
        itemId: l.itemId,
        name: l.item.name,
        emoji: l.item.emoji,
        qty: l.qty,
        unitPrice: l.unit,
        options: l.options,
        ...(l.sizeId ? { sizeId: l.sizeId } : {}),
        ...(l.addOnIds.length ? { addOnIds: l.addOnIds } : {}),
        ...(l.note?.trim() ? { note: l.note.trim() } : {}),
      })),
      subtotal,
      delivery,
      discount,
      total,
      ...(promo ? { promo: promo.code } : {}),
      payment: input.payment,
      paymentStatus: pay.status,
      placeLabel,
      placeLine,
      ...(input.note?.trim() ? { note: input.note.trim() } : {}),
      etaMins,
      points,
    };

    await runTransaction(db, async (t) => {
      const user = await t.get(userRef(uid));
      if (!user.exists()) throw new OrderError("Your account isn't set up yet. Please sign out and sign in again.");
      t.update(userRef(uid), { points: num(user.data().points) + points, updatedAt: serverTimestamp() });
      t.set(orderRef, order);
      t.set(
        notifRef,
        notice({
          title: "Order received",
          desc: `${reference} · ${formatMoney(total)}`,
          detail: `Thanks! We're getting your ${lines.reduce((s, l) => s + l.qty, 0)} item order ready. You earned ${points} points.`,
          icon: "receipt",
          type: "Orders",
          action: { label: "Track order", route: `/order/${orderRef.id}` },
        }),
      );
    });

    return { id: orderRef.id, order: { id: orderRef.id, ...order } };
  });
}

/** Cancels an order that hasn't left the kitchen yet and takes back the points it earned. */
export function cancelOrder(uid: string, orderId: string): Promise<Result> {
  return run(async () => {
    const ref = doc(path(uid, "orders"), orderId);
    await runTransaction(db, async (t) => {
      const [snap, user] = await Promise.all([t.get(ref), t.get(userRef(uid))]);
      if (!snap.exists()) throw new OrderError("Order not found.");
      const o = toOrder(snap as QueryDocumentSnapshot);
      if (!canCancel(effectiveStatus(o))) throw new OrderError("This order is already on its way and can't be cancelled.");
      t.update(ref, { status: "cancelled" });
      if (user.exists()) t.update(userRef(uid), { points: Math.max(0, num(user.data().points) - o.points) });
    });
    return { id: orderId };
  });
}

/* ------------------------- addresses & notifications ---------------------- */

export const addAddress = (uid: string, a: { label: string; line: string }) =>
  run(async () => {
    const line = a.line.trim();
    if (line.length < 6) throw new OrderError("Enter a full delivery address.");
    const ref = doc(path(uid, "addresses"));
    await runTransaction(db, async (t) => {
      t.set(ref, { label: a.label.trim() || "Home", line, createdAt: Date.now() });
    });
    return { id: ref.id };
  });

export const removeAddress = (uid: string, id: string) => deleteDoc(doc(path(uid, "addresses"), id));

export const markNotificationRead = (uid: string, id: string) =>
  updateDoc(doc(path(uid, "notifications"), id), { unread: false });

export async function markAllNotificationsRead(uid: string, ids: string[]) {
  if (!ids.length) return;
  const batch = writeBatch(db);
  ids.forEach((id) => batch.update(doc(path(uid, "notifications"), id), { unread: false }));
  await batch.commit();
}
