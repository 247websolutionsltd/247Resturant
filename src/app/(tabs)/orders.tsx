import Button from "@/components/button";
import Container from "@/components/custom-container";
import OrderCard from "@/components/order-card";
import { ThemedText } from "@/components/themed-text";
import { EmptyState } from "@/components/ui";
import { Radius, Spacing, TabBarSpace } from "@/constants/theme";
import { useOrders } from "@/context/OrdersContext";
import { useNow } from "@/hooks/use-now";
import { useTheme } from "@/hooks/use-theme";
import { go } from "@/lib/nav";
import { effectiveStatus, isActive } from "@/lib/order-status";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";

export default function Orders() {
  const theme = useTheme();
  const { orders } = useOrders();
  const now = useNow(1000);
  const [tab, setTab] = useState<"active" | "past">("active");

  const active = orders.filter((o) => isActive(effectiveStatus(o, now)));
  const past = orders.filter((o) => !isActive(effectiveStatus(o, now)));
  const list = tab === "active" ? active : past;

  return (
    <Container edges={["top"]} style={{ paddingBottom: TabBarSpace }}>
      <View style={{ padding: Spacing.three }}>
        <ThemedText type="title">Your orders</ThemedText>
      </View>

      <View style={{ marginHorizontal: Spacing.three, flexDirection: "row", backgroundColor: theme.cardAlt, borderRadius: Radius.md, padding: 4 }}>
        {(
          [
            { id: "active", label: "Active", n: active.length },
            { id: "past", label: "Past orders", n: past.length },
          ] as const
        ).map((t) => {
          const on = tab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={{ flex: 1, height: 42, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: on ? theme.card : "transparent", borderWidth: on ? 1.5 : 0, borderColor: theme.line }}
            >
              <ThemedText type="smallBold" style={{ color: on ? theme.text : theme.textSecondary }}>
                {t.label}
                {t.n ? `  ${t.n}` : ""}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: Spacing.three, marginTop: Spacing.three }}>
        {list.length === 0 ? (
          <EmptyState
            emoji={tab === "active" ? "👨‍🍳" : "🧾"}
            title={tab === "active" ? "Nothing cooking right now" : "No past orders yet"}
            text={tab === "active" ? "When you place an order you can follow it here, from the kitchen to your door." : "Your finished orders will live here so you can order your favourites again."}
          >
            <Button title="Browse the menu" onPress={() => go("/(tabs)/menu")} />
          </EmptyState>
        ) : (
          list.map((o) => <OrderCard key={o.id} order={o} now={now} />)
        )}
      </View>
    </Container>
  );
}
