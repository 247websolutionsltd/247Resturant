import { Brand } from "@/constants/brand";

export type Promo = {
  code: string;
  title: string;
  description: string;
  /** percentage off the food subtotal, 0..100 */
  percent?: number;
  /** cap on the percentage discount, in naira */
  maxOff?: number;
  freeDelivery?: boolean;
  minSubtotal?: number;
};

export const PROMOS: Promo[] = [
  { code: "WELCOME", title: "20% off your first order", description: "Up to ₦2,000 off.", percent: 20, maxOff: 2000 },
  { code: "FREEDEL", title: "Free delivery", description: "On orders over ₦5,000.", freeDelivery: true, minSubtotal: 5000 },
  { code: "EMBER10", title: "10% off", description: "On orders over ₦8,000. Up to ₦1,500 off.", percent: 10, maxOff: 1500, minSubtotal: 8000 },
];

export const findPromo = (code: string) => PROMOS.find((p) => p.code === code.trim().toUpperCase());

export type Pricing = { subtotal: number; delivery: number; discount: number; total: number };

/** Single place that turns a cart into money. Used by the cart, checkout and the order writer. */
export function price(subtotal: number, mode: "delivery" | "pickup", promo?: Promo | null): Pricing {
  let delivery = mode === "delivery" && subtotal < Brand.freeDeliveryOver && subtotal > 0 ? Brand.deliveryFee : 0;
  let discount = 0;
  if (promo && (!promo.minSubtotal || subtotal >= promo.minSubtotal)) {
    if (promo.percent) discount = Math.min(Math.round((subtotal * promo.percent) / 100), promo.maxOff ?? Infinity);
    if (promo.freeDelivery) delivery = 0;
  }
  return { subtotal, delivery, discount, total: Math.max(0, subtotal + delivery - discount) };
}

/** Why a promo does not apply to this subtotal, or null if it does. */
export function promoProblem(promo: Promo, subtotal: number): string | null {
  if (promo.minSubtotal && subtotal < promo.minSubtotal)
    return `Add ₦${(promo.minSubtotal - subtotal).toLocaleString("en-NG")} more to use ${promo.code}.`;
  return null;
}
