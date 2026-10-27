import Button from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { Card, DashedLine, DetailRow, Sprinkles } from "@/components/ui";
import { Colors, SerifFont, Spacing } from "@/constants/theme";
import { useOrders } from "@/context/OrdersContext";
import { useTheme } from "@/hooks/use-theme";
import { formatMoney, plural, timeLabel } from "@/lib/format";
import { etaTimestamp } from "@/lib/order-status";
import { goReplace } from "@/lib/nav";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderSuccess() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getOrder } = useOrders();
  const order = getOrder(id);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.hero }}>
      <StatusBar barStyle="light-content" />
      <Sprinkles opacity={0.14} />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: Spacing.four, justifyContent: "center" }} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: "center" }}>
            <View style={{ width: 96, height: 96, borderRadius: 32, backgroundColor: "#FFF8F0", alignItems: "center", justifyContent: "center", borderBottomWidth: 5, borderBottomColor: "#E9CDB4" }}>
              <Ionicons name="checkmark" size={56} color={Colors.hero} />
            </View>
            <Text style={{ fontFamily: SerifFont, color: "#FFF8F0", fontSize: 38, lineHeight: 44, fontWeight: "800", letterSpacing: -1, marginTop: Spacing.four, textAlign: "center" }}>
              Order placed!
            </Text>
            <ThemedText style={{ color: Colors.heroMuted, textAlign: "center", marginTop: Spacing.two }}>
              {order ? `The kitchen is already on it. Ready around ${timeLabel(etaTimestamp(order))}.` : "The kitchen is already on it."}
            </ThemedText>
          </View>

          {order ? (
            <Card style={{ marginTop: Spacing.five }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <ThemedText type="label" themeColor="textSecondary">Order</ThemedText>
                  <ThemedText type="large">{order.reference}</ThemedText>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <ThemedText type="label" themeColor="textSecondary">{order.mode === "delivery" ? "Delivering to" : "Pickup at"}</ThemedText>
                  <ThemedText type="smallBold" numberOfLines={1} style={{ maxWidth: 160 }}>{order.placeLabel}</ThemedText>
                </View>
              </View>
              <DashedLine style={{ marginVertical: Spacing.three }} />
              <DetailRow label="Items" value={plural(order.items.reduce((s, i) => s + i.qty, 0), "item")} />
              <DetailRow label="Payment" value={order.paymentStatus === "paid" ? "Paid" : "Pay on arrival"} />
              <DetailRow label="Total" value={formatMoney(order.total)} bold last />
              {order.points > 0 ? (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: Spacing.three, backgroundColor: theme.goldSurface, borderRadius: 12, padding: Spacing.two + 2 }}>
                  <Ionicons name="sparkles" size={16} color={theme.warning} />
                  <ThemedText type="smallBold" style={{ marginLeft: Spacing.two, color: theme.warning }}>+{order.points} points earned</ThemedText>
                </View>
              ) : null}
            </Card>
          ) : null}

          <View style={{ marginTop: Spacing.five, gap: Spacing.three }}>
            <Button title="Track my order" variant="light" icon="arrow-forward" onPress={() => goReplace(`/order/${id}`)} />
            <Button title="Back to home" variant="ghost" onPress={() => goReplace("/(tabs)/home")} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
