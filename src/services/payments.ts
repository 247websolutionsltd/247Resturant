import type { IconName } from "@/data/icons";

export type PaymentMethod = "card" | "transfer" | "cash";
export type PaymentStatus = "paid" | "pending";

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; desc: (pickup: boolean) => string; icon: IconName }[] = [
  { id: "card", label: "Pay with card", desc: () => "Debit or credit card", icon: "card-outline" },
  { id: "transfer", label: "Bank transfer", desc: () => "Pay from your banking app", icon: "swap-horizontal-outline" },
  { id: "cash", label: "Pay on arrival", desc: (pickup) => (pickup ? "Pay at the counter" : "Cash or POS to the rider"), icon: "cash-outline" },
];

export const paymentLabel = (m: PaymentMethod) => PAYMENT_METHODS.find((p) => p.id === m)?.label ?? m;

/**
 * Payment hook-up point.
 *
 * IMPORTANT: this is a stand-in. No money moves. Card and bank-transfer orders are marked
 * "paid" immediately so the ordering flow can be exercised end to end. Before launch, replace
 * the body with a real gateway (e.g. Paystack or Flutterwave: open their checkout, verify the
 * transaction on your server, then resolve). "Pay on arrival" is genuinely `pending` until the
 * rider / counter collects it.
 */
export async function collectPayment(method: PaymentMethod, _amount: number, _reference: string): Promise<
  { ok: true; status: PaymentStatus } | { ok: false; error: string }
> {
  if (method === "cash") return { ok: true, status: "pending" };
  await new Promise((r) => setTimeout(r, 700));
  return { ok: true, status: "paid" };
}
