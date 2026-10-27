import Button from "@/components/button";
import Container from "@/components/custom-container";
import Header from "@/components/header";
import { StatusPill } from "@/components/order-card";
import { ThemedText } from "@/components/themed-text";
import { Card, DashedLine, DetailRow, EmojiTile } from "@/components/ui";
import { Brand } from "@/constants/brand";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useNow } from "@/hooks/use-now";
import { useTheme } from "@/hooks/use-theme";
import { fullDate, formatMoney, timeLabel } from "@/lib/format";
import { go } from "@/lib/nav";
import { canCancel, effectiveStatus, etaTimestamp, isActive, stepIndex, stepsFor } from "@/lib/order-status";
import { paymentLabel } from "@/services/payments";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Text, View } from "react-native";

export default function OrderDetail() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getOrder, cancelOrder } = useOrders();
  const { reorder } = useCart();
  const order = getOrder(id);
  const now = useNow(1000, !!order);
  const [cancelling, setCancelling] = useState(false);

  if (!order) {
    return (
      <Container edges={["top", "bottom"]}>
        <Header title="Order" />
        <ThemedText themeColor="textSecondary" style={{ textAlign: "center", marginTop: Spacing.five }}>
          We can't find that order.
        </ThemedText>
      </Container>
    );
  }

  const status = effectiveStatus(order, now);
  const steps = stepsFor(order.mode);
  const idx = stepIndex(status, order.mode);
  const active = isActive(status);
  const cancelled = status === "cancelled";
  const eta = etaTimestamp(order);
  const secsLeft = Math.max(0, Math.round((eta - now) / 1000));
  const left = secsLeft >= 90 ? `${Math.round(secsLeft / 60)} min` : secsLeft > 0 ? "< 1 min" : "Any moment";

  const askCancel = () =>
    Alert.alert("Cancel this order?", "The kitchen hasn't sent it out yet, so you can still cancel.", [
      { text: "Keep order", style: "cancel" },
      {
        text: "Cancel order",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          const res = await cancelOrder(order.id);
          setCancelling(false);
          if (!res.ok) Alert.alert("Couldn't cancel", res.error);
        },
      },
    ]);

  return (
    <Container edges={["top", "bottom"]}>
      <Header title={order.reference} />
      <View style={{ paddingHorizontal: Spacing.three, gap: Spacing.three }}>
        {/* hero status */}
        <View
          style={{
            backgroundColor: cancelled ? theme.cardAlt : active ? Colors.hero : theme.success,
            borderRadius: Radius.xl,
            padding: Spacing.four - 2,
            overflow: "hidden",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <ThemedText type="label" style={{ color: cancelled ? theme.textSecondary : "rgba(255,255,255,0.8)" }}>
                {cancelled ? "Cancelled" : active ? (order.mode === "delivery" ? "Estimated arrival" : "Ready around") : order.mode === "delivery" ? "Delivered" : "Collected"}
              </ThemedText>
              <ThemedText type="display" style={{ color: cancelled ? theme.text : "#FFF8F0", marginTop: 2 }}>
                {cancelled ? "Order cancelled" : active ? timeLabel(eta) : "Enjoy!"}
              </ThemedText>
              {active ? (
                <ThemedText type="smallBold" style={{ color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
                  {left === "Any moment" ? "Any moment now" : `in about ${left}`}
                </ThemedText>
              ) : null}
            </View>
            <Text style={{ fontSize: 64 }}>{cancelled ? "🚫" : !active ? "😋" : status === "on_the_way" ? "🛵" : status === "ready" ? "🛍️" : "👨‍🍳"}</Text>
          </View>
        </View>

        {/* tracker */}
        {!cancelled ? (
          <Card>
            {steps.map((s, i) => {
              const done = i < idx || (!active && i === idx);
              const current = active && i === idx;
              const last = i === steps.length - 1;
              return (
                <View key={s.key} style={{ flexDirection: "row" }}>
                  <View style={{ alignItems: "center", width: 32 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 10,
                        backgroundColor: done ? theme.success : current ? theme.cta : theme.cardAlt,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: current ? 3 : 0,
                        borderColor: theme.accentSurface,
                      }}
                    >
                      {done ? <Ionicons name="checkmark" size={16} color="#FFF" /> : current ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFF" }} /> : null}
                    </View>
                    {!last && <View style={{ width: 3, flex: 1, minHeight: 26, backgroundColor: i < idx ? theme.success : theme.line, marginVertical: 2, borderRadius: 2 }} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.three, paddingBottom: last ? 0 : Spacing.three }}>
                    <ThemedText type="smallBold" style={{ color: done || current ? theme.text : theme.inkSoft }}>{s.label}</ThemedText>
                    <ThemedText type="caption" themeColor={done || current ? "textSecondary" : "inkSoft"}>
                      {i === 0 ? `${timeLabel(order.ts)} · ${s.desc}` : s.desc}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </Card>
        ) : null}

        {/* delivery info */}
        <Card>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <EmojiTile emoji={order.mode === "delivery" ? "📍" : "🏪"} size={44} radius={14} />
            <View style={{ flex: 1, marginLeft: Spacing.three }}>
              <ThemedText type="label" themeColor="textSecondary">{order.mode === "delivery" ? "Delivering to" : "Pickup from"}</ThemedText>
              <ThemedText type="smallBold" style={{ marginTop: 2 }}>{order.placeLabel}</ThemedText>
              <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: 2 }}>{order.placeLine}</ThemedText>
              {order.note ? <ThemedText type="caption" style={{ marginTop: 6, fontStyle: "italic" }}>“{order.note}”</ThemedText> : null}
            </View>
          </View>
        </Card>

        {/* items + receipt */}
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <ThemedText type="big">Receipt</ThemedText>
            <StatusPill status={status} />
          </View>
          <DashedLine style={{ marginVertical: Spacing.three }} />
          {order.items.map((i, k) => (
            <View key={k} style={{ flexDirection: "row", paddingVertical: 6 }}>
              <ThemedText type="small" style={{ width: 30, fontWeight: "800", color: theme.accent }}>{i.qty}×</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold">{i.name}</ThemedText>
                {i.options ? <ThemedText type="caption" themeColor="textSecondary">{i.options}</ThemedText> : null}
                {i.note ? <ThemedText type="caption" themeColor="textSecondary" style={{ fontStyle: "italic" }}>“{i.note}”</ThemedText> : null}
              </View>
              <ThemedText type="small" themeColor="textSecondary">{formatMoney(i.unitPrice * i.qty)}</ThemedText>
            </View>
          ))}
          <DashedLine style={{ marginVertical: Spacing.three }} />
          <DetailRow label="Subtotal" value={formatMoney(order.subtotal)} />
          {order.mode === "delivery" ? <DetailRow label="Delivery" value={order.delivery ? formatMoney(order.delivery) : "Free"} /> : null}
          {order.discount > 0 ? <DetailRow label={`Promo${order.promo ? ` (${order.promo})` : ""}`} value={`-${formatMoney(order.discount)}`} accent /> : null}
          <DetailRow label="Total" value={formatMoney(order.total)} bold last />
          <DashedLine style={{ marginVertical: Spacing.three }} />
          <DetailRow label="Payment" value={`${paymentLabel(order.payment)}${order.paymentStatus === "paid" ? " · Paid" : " · Due on arrival"}`} />
          <DetailRow label="Placed" value={fullDate(order.ts)} />
          <DetailRow label="Reference" value={order.reference} />
          <DetailRow label="Points earned" value={cancelled ? "0" : `+${order.points}`} last />
        </Card>

        {/* actions */}
        {canCancel(status) ? <Button title="Cancel order" variant="danger" onPress={askCancel} loading={cancelling} /> : null}
        {!active && !cancelled ? (
          <Button
            title="Order again"
            icon="refresh"
            onPress={() => {
              reorder(order.items);
              go("/(tabs)/cart");
            }}
          />
        ) : null}
        <Button title="Need help? Call us" variant="secondary" iconLeft="call-outline" onPress={() => Linking.openURL(`tel:${Brand.supportPhone.replace(/\s/g, "")}`)} />
      </View>
    </Container>
  );
}
