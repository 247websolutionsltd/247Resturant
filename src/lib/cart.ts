import { itemById, MenuItem } from "@/data/menu";

/** One row in the cart: a menu item plus the options the customer picked. */
export type CartLine = {
  key: string;
  itemId: string;
  qty: number;
  sizeId?: string;
  addOnIds: string[];
  note?: string;
};

export const MAX_QTY = 20;

export const lineKey = (itemId: string, sizeId: string | undefined, addOnIds: string[], note?: string) =>
  [itemId, sizeId ?? "", [...addOnIds].sort().join("+"), (note ?? "").trim().toLowerCase()].join("|");

export function unitPrice(item: MenuItem, sizeId?: string, addOnIds: string[] = []) {
  const size = item.sizes?.find((s) => s.id === sizeId);
  const extras = (item.addOns ?? []).filter((a) => addOnIds.includes(a.id)).reduce((s, a) => s + a.price, 0);
  return item.price + (size?.extra ?? 0) + extras;
}

/** "Large · Extra chicken, Moi moi" */
export function optionsText(item: MenuItem, sizeId?: string, addOnIds: string[] = []) {
  const parts: string[] = [];
  const size = item.sizes?.find((s) => s.id === sizeId);
  if (size && size.extra > 0) parts.push(size.label);
  else if (size && item.sizes && item.sizes.length > 1 && size.id !== item.sizes[0].id) parts.push(size.label);
  const add = (item.addOns ?? []).filter((a) => addOnIds.includes(a.id)).map((a) => a.label);
  if (add.length) parts.push(add.join(", "));
  return parts.join(" · ");
}

export type PricedLine = CartLine & { item: MenuItem; unit: number; total: number; options: string };

/** Resolves lines against the menu, dropping any item that no longer exists. */
export function priceLines(lines: CartLine[]): PricedLine[] {
  return lines.flatMap((l) => {
    const item = itemById(l.itemId);
    if (!item) return [];
    const unit = unitPrice(item, l.sizeId, l.addOnIds);
    return [{ ...l, item, unit, total: unit * l.qty, options: optionsText(item, l.sizeId, l.addOnIds) }];
  });
}

export const subtotalOf = (lines: PricedLine[]) => lines.reduce((s, l) => s + l.total, 0);
export const countOf = (lines: { qty: number }[]) => lines.reduce((s, l) => s + l.qty, 0);
