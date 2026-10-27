import { itemById } from "@/data/menu";
import { Promo, findPromo, promoProblem } from "@/data/promos";
import type { OrderItem } from "@/services/orders";
import { CartLine, countOf, lineKey, MAX_QTY, PricedLine, priceLines, subtotalOf } from "@/lib/cart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "ember.cart.v1";

type AddInput = { itemId: string; qty?: number; sizeId?: string; addOnIds?: string[]; note?: string };

type CartContextType = {
  lines: PricedLine[];
  raw: CartLine[];
  count: number;
  subtotal: number;
  promo: Promo | null;
  /** returns an error message, or null when the code was applied */
  applyPromo: (code: string) => string | null;
  removePromo: () => void;
  add: (input: AddInput) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  qtyOfItem: (itemId: string) => number;
  /** Puts a past order's items back in the basket. Returns how many lines were added. */
  reorder: (items: OrderItem[]) => number;
  /** Adds one of an item with its default options, or removes one if `delta` is -1. */
  bump: (itemId: string, delta: 1 | -1) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

/** The customer's basket. Lives on the device (AsyncStorage) so it survives app restarts. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { lines?: CartLine[]; promo?: string | null };
          if (Array.isArray(parsed.lines)) setRaw(parsed.lines);
          if (parsed.promo) setPromoCode(parsed.promo);
        }
      } catch (e) {
        console.error("[cart] couldn't restore the cart", e);
      } finally {
        hydrated.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ lines: raw, promo: promoCode })).catch(() => {});
  }, [raw, promoCode]);

  const lines = useMemo(() => priceLines(raw), [raw]);
  const subtotal = useMemo(() => subtotalOf(lines), [lines]);
  const count = useMemo(() => countOf(lines), [lines]);
  const promo = useMemo(() => (promoCode ? findPromo(promoCode) ?? null : null), [promoCode]);

  const add = useCallback((input: AddInput) => {
    const addOnIds = input.addOnIds ?? [];
    const key = lineKey(input.itemId, input.sizeId, addOnIds, input.note);
    const qty = Math.max(1, input.qty ?? 1);
    setRaw((cur) => {
      const existing = cur.find((l) => l.key === key);
      if (existing) return cur.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
      return [
        ...cur,
        {
          key,
          itemId: input.itemId,
          qty: Math.min(MAX_QTY, qty),
          sizeId: input.sizeId,
          addOnIds,
          ...(input.note?.trim() ? { note: input.note.trim() } : {}),
        },
      ];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setRaw((cur) =>
      qty <= 0 ? cur.filter((l) => l.key !== key) : cur.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
    );
  }, []);

  const remove = useCallback((key: string) => setRaw((cur) => cur.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => {
    setRaw([]);
    setPromoCode(null);
  }, []);

  const bump = useCallback((itemId: string, delta: 1 | -1) => {
    setRaw((cur) => {
      if (delta === 1) {
        // quick-add uses the first size and no add-ons
        const sizeId = undefined;
        const key = lineKey(itemId, sizeId, []);
        const found = cur.find((l) => l.key === key);
        if (found) return cur.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + 1) } : l));
        return [...cur, { key, itemId, qty: 1, addOnIds: [] }];
      }
      // remove one from the most recently added line of this item
      const idx = [...cur].reverse().findIndex((l) => l.itemId === itemId);
      if (idx === -1) return cur;
      const at = cur.length - 1 - idx;
      const line = cur[at];
      return line.qty <= 1 ? cur.filter((_, i) => i !== at) : cur.map((l, i) => (i === at ? { ...l, qty: l.qty - 1 } : l));
    });
  }, []);

  const reorder = useCallback(
    (items: OrderItem[]) => {
      let added = 0;
      items.forEach((i) => {
        if (!itemById(i.itemId)) return; // dish was taken off the menu
        add({ itemId: i.itemId, qty: i.qty, sizeId: i.sizeId, addOnIds: i.addOnIds, note: i.note });
        added += 1;
      });
      return added;
    },
    [add],
  );

  const qtyOfItem = useCallback((itemId: string) => raw.filter((l) => l.itemId === itemId).reduce((s, l) => s + l.qty, 0), [raw]);

  const applyPromo = useCallback(
    (code: string) => {
      const p = findPromo(code);
      if (!p) return "That promo code isn't valid.";
      const problem = promoProblem(p, subtotal);
      if (problem) return problem;
      setPromoCode(p.code);
      return null;
    },
    [subtotal],
  );

  const value: CartContextType = {
    lines,
    raw,
    count,
    subtotal,
    promo,
    applyPromo,
    removePromo: () => setPromoCode(null),
    add,
    setQty,
    remove,
    clear,
    qtyOfItem,
    reorder,
    bump,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a CartProvider");
  return ctx;
}
