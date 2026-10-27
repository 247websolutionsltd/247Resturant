import { auth } from "@/config/firebase";
import { AppNotification } from "@/data/notifications";
import { effectiveStatus, isActive } from "@/lib/order-status";
import * as orders from "@/services/orders";
import type { Address, Order, OrderStatus, PlaceOrderInput, Result } from "@/services/orders";
import { setFavorite, tierFor } from "@/services/users";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "./PageContext";

export type { Address, Order, OrderStatus, PlaceOrderInput, Result };

type OrdersContextType = {
  orders: Order[];
  addresses: Address[];
  notifications: AppNotification[];
  favorites: string[];
  points: number;
  tier: ReturnType<typeof tierFor>;
  /** orders that are still being cooked / delivered, judged by `effectiveStatus` at render time */
  activeOrders: (now?: number) => Order[];
  isFavorite: (itemId: string) => boolean;
  toggleFavorite: (itemId: string) => void;
  placeOrder: (input: PlaceOrderInput) => Promise<Result>;
  cancelOrder: (id: string) => Promise<Result>;
  addAddress: (a: { label: string; line: string }) => Promise<Result>;
  removeAddress: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  getOrder: (id?: string) => Order | undefined;
};

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const NOT_SIGNED_IN: Result = { ok: false, error: "Please sign in again to continue." };

/** Everything the signed-in customer owns, live from Firestore: orders, addresses, favourites, inbox. */
export function OrdersProvider({ children }: { children: ReactNode }) {
  const { uid, user } = useAuth();
  const [list, setList] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  // orders we just placed, so the receipt can show before the listener delivers them
  const recent = useRef(new Map<string, Order>());
  const syncAlerted = useRef(false);

  useEffect(() => {
    setList([]);
    setAddresses([]);
    setNotifications([]);
    recent.current.clear();
    if (!uid) return;

    const onError = (label: string) => (error: unknown) => {
      if (!auth.currentUser) return; // signing out
      console.error(`[orders] ${label} subscription failed`, error);
      if (!syncAlerted.current) {
        syncAlerted.current = true;
        Alert.alert("Sync problem", "We couldn't load some of your data. Check your connection and reopen the app.");
      }
    };

    const unsubs = [
      orders.subscribeOrders(uid, setList, onError("orders")),
      orders.subscribeAddresses(uid, setAddresses, onError("addresses")),
      orders.subscribeNotifications(uid, setNotifications, onError("notifications")),
    ];
    return () => unsubs.forEach((u) => u());
  }, [uid]);

  const favorites = user?.favorites ?? [];
  const points = user?.points ?? 0;
  const tier = useMemo(() => tierFor(points), [points]);

  const activeOrders = useCallback(
    (now = Date.now()) => list.filter((o) => isActive(effectiveStatus(o, now))),
    [list],
  );

  const placeOrder = useCallback(
    async (input: PlaceOrderInput): Promise<Result> => {
      if (!uid) return NOT_SIGNED_IN;
      const res = await orders.placeOrder(uid, input);
      if (res.ok && res.order) recent.current.set(res.id, res.order);
      return res;
    },
    [uid],
  );

  const unreadIds = notifications.filter((n) => n.unread).map((n) => n.id);

  const value: OrdersContextType = {
    orders: list,
    addresses,
    notifications,
    favorites,
    points,
    tier,
    activeOrders,
    isFavorite: (id) => favorites.includes(id),
    toggleFavorite: (id) => {
      if (!uid) return;
      setFavorite(uid, id, !favorites.includes(id)).catch((e) => {
        console.error("[orders] couldn't save favourite", e);
        Alert.alert("Couldn't save", "Your change wasn't saved. Please try again.");
      });
    },
    placeOrder,
    cancelOrder: async (id) => (uid ? orders.cancelOrder(uid, id) : NOT_SIGNED_IN),
    addAddress: async (a) => (uid ? orders.addAddress(uid, a) : NOT_SIGNED_IN),
    removeAddress: async (id) => {
      if (uid) await orders.removeAddress(uid, id);
    },
    markNotificationRead: (id) => {
      if (uid) orders.markNotificationRead(uid, id).catch((e) => console.error("[orders] mark read failed", e));
    },
    markAllRead: () => {
      if (uid) orders.markAllNotificationsRead(uid, unreadIds).catch((e) => console.error("[orders] mark all failed", e));
    },
    getOrder: (id) => (id ? list.find((o) => o.id === id) ?? recent.current.get(id) : undefined),
  };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside an OrdersProvider");
  return ctx;
}
