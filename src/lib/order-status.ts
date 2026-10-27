import { Brand } from "@/constants/brand";
import type { Order, OrderStatus } from "@/services/orders";

export const FINISHED: OrderStatus[] = ["delivered", "collected", "cancelled"];

/**
 * The status the customer should see right now.
 * If a kitchen backend has moved the order past "placed" we trust it; otherwise, while
 * `Brand.simulateKitchen` is on, progress is simulated from the time the order was placed.
 */
export function effectiveStatus(order: Pick<Order, "status" | "mode" | "ts">, now = Date.now()): OrderStatus {
  if (order.status !== "placed" || !Brand.simulateKitchen) return order.status;
  const s = (now - order.ts) / 1000;
  const sim = Brand.simulation;
  if (s >= sim.doneAfter) return order.mode === "delivery" ? "delivered" : "collected";
  if (order.mode === "delivery") {
    if (s >= sim.dispatchAfter) return "on_the_way";
  } else if (s >= sim.readyAfter) return "ready";
  if (s >= sim.preparingAfter) return "preparing";
  return "placed";
}

export const isActive = (status: OrderStatus) => !FINISHED.includes(status);
export const canCancel = (status: OrderStatus) => status === "placed" || status === "preparing";

export type Step = { key: OrderStatus; label: string; desc: string };

export function stepsFor(mode: Order["mode"]): Step[] {
  return mode === "delivery"
    ? [
        { key: "placed", label: "Order received", desc: "We've got your order." },
        { key: "preparing", label: "Cooking", desc: "The kitchen is on it." },
        { key: "on_the_way", label: "On the way", desc: "Your rider is heading to you." },
        { key: "delivered", label: "Delivered", desc: "Enjoy your meal!" },
      ]
    : [
        { key: "placed", label: "Order received", desc: "We've got your order." },
        { key: "preparing", label: "Cooking", desc: "The kitchen is on it." },
        { key: "ready", label: "Ready for pickup", desc: "Come and grab it while it's hot." },
        { key: "collected", label: "Collected", desc: "Enjoy your meal!" },
      ];
}

export function stepIndex(status: OrderStatus, mode: Order["mode"]) {
  return Math.max(0, stepsFor(mode).findIndex((s) => s.key === status));
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Order received",
  preparing: "Cooking",
  on_the_way: "On the way",
  ready: "Ready for pickup",
  delivered: "Delivered",
  collected: "Collected",
  cancelled: "Cancelled",
};

/** When the order is expected to arrive / be ready. */
export function etaTimestamp(order: Pick<Order, "status" | "ts" | "etaMins">): number {
  if (Brand.simulateKitchen && order.status === "placed") return order.ts + Brand.simulation.doneAfter * 1000;
  return order.ts + order.etaMins * 60_000;
}
