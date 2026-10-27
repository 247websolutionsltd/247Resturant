import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  type DocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { Brand } from "@/constants/brand";
import { welcomeNotifications } from "@/data/notifications";
import type { User } from "firebase/auth";
import { db } from "../config/firebase";

export type UserProfile = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  referralCode: string;
  /** loyalty points (1 per ₦100 spent) */
  points: number;
  /** menu item ids */
  favorites: string[];
};

export const userRef = (uid: string) => doc(db, "users", uid);

/** Loyalty tier for a points total, plus progress to the next one. */
export function tierFor(points: number) {
  const tiers = Brand.tiers;
  let idx = 0;
  tiers.forEach((t, i) => {
    if (points >= t.min) idx = i;
  });
  const next = tiers[idx + 1];
  return {
    name: tiers[idx].name,
    next: next?.name ?? null,
    toNext: next ? next.min - points : 0,
    progress: next ? (points - tiers[idx].min) / (next.min - tiers[idx].min) : 1,
  };
}

/* ------------------------------ generators ------------------------------- */

const digits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");

export function generateReferralCode(name?: string | null) {
  const letters = (name ?? "").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3).padEnd(3, "E");
  return letters + digits(4);
}

/* -------------------------------- mapping -------------------------------- */

export function toProfile(snap: DocumentSnapshot): UserProfile | null {
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid: snap.id,
    email: d.email,
    displayName: d.displayName,
    photoURL: d.photoURL,
    // older docs stored this as `phoneNumber`
    phone: d.phone ?? d.phoneNumber ?? "",
    referralCode: d.referralCode ?? "",
    points: typeof d.points === "number" && Number.isFinite(d.points) ? d.points : 0,
    favorites: Array.isArray(d.favorites) ? d.favorites.filter((x: unknown) => typeof x === "string") : [],
  };
}

/* ------------------------------ operations ------------------------------- */

/**
 * Idempotent: creates the profile document for a new customer (referral code, welcome
 * notifications) and repairs documents from older versions of the app. Safe to call on every sign-in.
 */
export async function ensureUserAccount(
  user: User,
  extra: { displayName?: string; phone?: string } = {},
): Promise<void> {
  const ref = userRef(user.uid);
  const displayName = extra.displayName?.trim() || user.displayName || undefined;

  await runTransaction(db, async (t) => {
    const snap = await t.get(ref);

    if (!snap.exists()) {
      t.set(ref, {
        uid: user.uid,
        ...(user.email ? { email: user.email } : {}),
        ...(displayName ? { displayName } : {}),
        ...(user.photoURL ? { photoURL: user.photoURL } : {}),
        phone: extra.phone?.trim() ?? "",
        referralCode: generateReferralCode(displayName),
        points: 0,
        favorites: [],
        createdAt: Date.now(),
        updatedAt: serverTimestamp(),
      });
      const now = Date.now();
      welcomeNotifications(displayName?.split(" ")[0]).forEach((n, i) => {
        t.set(doc(collection(db, "users", user.uid, "notifications")), { ...n, ts: now - i, unread: true });
      });
      return;
    }

    const d = snap.data();
    const patch: Record<string, unknown> = {};

    if (!d.referralCode) patch.referralCode = generateReferralCode(displayName ?? d.displayName);
    if (typeof d.points !== "number") patch.points = 0;
    if (!Array.isArray(d.favorites)) patch.favorites = [];
    if (!d.phone && d.phoneNumber) patch.phone = d.phoneNumber;
    if (extra.displayName?.trim() && d.displayName !== extra.displayName.trim()) patch.displayName = extra.displayName.trim();
    if (extra.phone?.trim() && d.phone !== extra.phone.trim()) patch.phone = extra.phone.trim();
    if (!d.email && user.email) patch.email = user.email;

    if (Object.keys(patch).length) t.set(ref, { ...patch, updatedAt: serverTimestamp() }, { merge: true });
  });
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  return onSnapshot(userRef(uid), (snap) => onData(toProfile(snap)), onError);
}

/** Only fields a customer may change directly. Points are only ever written by placing an order. */
export async function updateUserProfile(uid: string, patch: Partial<Pick<UserProfile, "displayName" | "phone">>) {
  await setDoc(userRef(uid), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
}

export async function setFavorite(uid: string, itemId: string, on: boolean) {
  await setDoc(
    userRef(uid),
    { favorites: on ? arrayUnion(itemId) : arrayRemove(itemId), updatedAt: serverTimestamp() },
    { merge: true },
  );
}
