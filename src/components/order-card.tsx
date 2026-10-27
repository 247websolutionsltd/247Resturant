import { Radius, Spacing } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/hooks/use-theme";
import { dayLabel, formatMoney, plural, timeLabel } from "@/lib/format";
import { go } from "@/lib/nav";
import { effectiveStatus, STATUS_LABEL } from "@/lib/order-status";
import type { Order, OrderStatus } from "@/services/orders";
import { TouchableOpacity, View } from "react-native";
import Button from "./button";
import { ThemedText } from "./themed-text";
import { EmojiTile, Pill } from "./ui";

export function StatusPill({ status }: { status: OrderStatus }) {
  const tone = status === "cancelled" ? "muted" : status === "delivered" || status === "collected" ? "green" : "red";
  return <Pill label={STATUS_LABEL[status].toUpperCase()} tone={tone} />;
}

/** One order in the Orders list. */
export default function OrderCard({ order, now }: { order: Order; now: number }) {
  const theme = useTheme();
  const { reorder } = useCart();
  const status = effectiveStatus(order, now);
  const finished = status === "delivered" || status === "collected" || status === "cancelled";
  const qty = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => go(`/order/${order.id}`)}
      style={{
        backgroundColor: theme.card,
        borderRadius: Radius.lg,
        borderWidth: 1.5,
        borderColor: finished ? theme.line : theme.accent,
        padding: Spacing.three,
        marginBottom: Spacing.three,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <StatusPill status={status} />
        <ThemedText type="caption" themeColor="textSecondary">
          {dayLabel(order.ts, now)} · {timeLabel(order.ts)}
        </ThemedText>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: Spacing.three }}>
        <View style={{ flexDirection: "row" }}>
          {order.items.slice(0, 3).map((i, idx) => (
            <View key={idx} style={{ marginLeft: idx ? -16 : 0, borderRadius: 16, borderWidth: 3, borderColor: theme.card }}>
              <EmojiTile emoji={i.emoji} size={50} radius={14} />
            </View>
          ))}
        </View>
        <View style={{ flex: 1, marginLeft: Spacing.three }}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {order.items.map((i) => i.name).join(", ")}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: 2 }}>
            {plural(qty, "item")} · {order.mode === "delivery" ? "Delivery" : "Pickup"} · {order.reference}
          </ThemedText>
        </View>
        <ThemedText type="price">{formatMoney(order.total)}</ThemedText>
      </View>
      {finished && status !== "cancelled" ? (
        <Button
          title="Order again"
          small
          variant="soft"
          onPress={() => {
            reorder(order.items);
            go("/(tabs)/cart");
          }}
          style={{ marginTop: Spacing.three }}
        />
      ) : null}
    </TouchableOpacity>
  );
}
