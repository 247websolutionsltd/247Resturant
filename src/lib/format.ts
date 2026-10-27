import { Brand } from "@/constants/brand";

const group = (n: number) => Math.floor(Math.abs(n)).toLocaleString("en-NG");

/** ₦5,500 (menu prices are whole naira; pass `decimals` for kobo). */
export function formatMoney(value: number, opts: { decimals?: boolean; sign?: boolean } = {}) {
  const { decimals = false, sign = false } = opts;
  const abs = Math.abs(value);
  const kobo = Math.round((abs - Math.floor(abs)) * 100)
    .toString()
    .padStart(2, "0");
  const body = `${Brand.currency}${group(abs)}${decimals ? "." + kobo : ""}`;
  if (value < 0) return `-${body}`;
  return sign ? `+${body}` : body;
}

/** 1.2M / 45K style shorthand. */
export function compactMoney(value: number) {
  const abs = Math.abs(value);
  const fmt = (n: number, s: string) => `${Brand.currency}${n.toFixed(1).replace(/\.0$/, "")}${s}`;
  if (abs >= 1_000_000) return fmt(value / 1_000_000, "M");
  if (abs >= 1_000) return fmt(value / 1_000, "K");
  return `${Brand.currency}${Math.round(value)}`;
}

export const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;

const DAY = 86_400_000;
const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function dayLabel(ts: number, now = Date.now()) {
  const diff = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(ts).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function fullDate(ts: number) {
  return `${new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${timeLabel(ts)}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function timeAgo(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return "Just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
