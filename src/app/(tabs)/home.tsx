import Avatar from "@/components/avatar";
import Button from "@/components/button";
import CartBar from "@/components/cart-bar";
import Container from "@/components/custom-container";
import { FeatureCard, MenuRow } from "@/components/food";
import { RoundButton } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Card, EmojiTile, ProgressBar, SectionHeader, Sprinkles } from "@/components/ui";
import { Brand } from "@/constants/brand";
import { Colors, Radius, SerifFont, Spacing, TabBarSpace } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { useAuth } from "@/context/PageContext";
import { CATEGORIES, MENU } from "@/data/menu";
import { useNow } from "@/hooks/use-now";
import { useTheme } from "@/hooks/use-theme";
import { formatMoney, greeting, plural, timeLabel } from "@/lib/format";
import { go, goWith } from "@/lib/nav";
import { effectiveStatus, etaTimestamp, isActive, STATUS_LABEL, stepIndex, stepsFor } from "@/lib/order-status";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const popular = MENU.filter((m) => m.tags.includes("popular")).slice(0, 8);
const chefPicks = MENU.filter((m) => m.tags.includes("chef")).slice(0, 3);

export default function Home() {
  const theme = useTheme();
  const { owner } = useAuth();
  const { orders, addresses, notifications } = useOrders();
  const { reorder } = useCart();
  const now = useNow(1000);
  const firstName = owner.name.split(" ")[0];
  const unread = notifications.some((n) => n.unread);
  const address = addresses[0];

  const active = useMemo(() => orders.find((o) => isActive(effectiveStatus(o, now))), [orders, now]);
  const lastDone = useMemo(() => orders.find((o) => !isActive(effectiveStatus(o, now)) && effectiveStatus(o, now) !== "cancelled"), [orders, now]);

  return (
    <View style={{ flex: 1, backgroundColor:'red' }}>
      <Container edges={["top"]} style={{ paddingBottom: TabBarSpace }}>
        {/* top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.three, paddingTop: Spacing.two }}>
          <TouchableOpacity onPress={() => go("/account/addresses")} style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel="Change delivery address">
            <ThemedText type="label" themeColor="textSecondary">Deliver to</ThemedText>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
              <Ionicons name="location" size={16} color={theme.accent} />
              <ThemedText type="smallBold" numberOfLines={1} style={{ marginLeft: 4, maxWidth: 220 }}>
                {address ? `${address.label} · ${address.line}` : "Add a delivery address"}
              </ThemedText>
              <Ionicons name="chevron-down" size={14} color={theme.textSecondary} style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.two }}>
            <RoundButton icon="notifications-outline" label="Notifications" dot={unread} onPress={() => go("/notifications")} />
            <TouchableOpacity onPress={() => go("/(tabs)/profile")} accessibilityRole="button" accessibilityLabel="Profile">
              <Avatar name={owner.name} size={42} />
            </TouchableOpacity>
          </View>
        </View>

        {/* greeting */}
        <View style={{ paddingHorizontal: Spacing.three, marginTop: Spacing.four }}>
          <ThemedText type="large">
            {greeting()}
            {firstName ? `, ${firstName}.` : "."}
          </ThemedText>
          <ThemedText type="large" style={{ color: theme.accent }}>
            What are we eating?
          </ThemedText>
        </View>

        {/* search */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => goWith("/(tabs)/menu", { focus: 1 })}
          accessibilityRole="search"
          style={{
            marginHorizontal: Spacing.three,
            marginTop: Spacing.three,
            height: 52,
            borderRadius: Radius.md,
            backgroundColor: theme.card,
            borderWidth: 1.5,
            borderColor: theme.line,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: Spacing.three,
          }}
        >
          <Ionicons name="search" size={19} color={theme.inkSoft} />
          <ThemedText themeColor="inkSoft" style={{ marginLeft: Spacing.two + 2 }}>
            Search jollof, suya, chapman…
          </ThemedText>
        </TouchableOpacity>

        {/* live order */}
        {active ? <ActiveOrder order={active} now={now} /> : null}

        {/* promo hero */}
        <View style={{ paddingHorizontal: Spacing.three, marginTop: Spacing.four }}>
          <View style={{ backgroundColor: Colors.hero, borderRadius: Radius.xl, padding: Spacing.four - 2, overflow: "hidden", minHeight: 176, borderBottomWidth: 5, borderBottomColor: Colors.heroDeep }}>
            <Sprinkles opacity={0.13} />
            <View style={{ width: "66%" }}>
              <View style={{ alignSelf: "flex-start", backgroundColor: Colors.palette.saffron, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: "-3deg" }] }}>
                <ThemedText style={{ color: Colors.palette.ink, fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>FIRST ORDER</ThemedText>
              </View>
              <Text style={{ fontFamily: SerifFont, color: "#FFF8F0", fontSize: 40, lineHeight: 44, fontWeight: "800", letterSpacing: -1, marginTop: 10 }}>
                20% off
              </Text>
              <ThemedText style={{ color: Colors.heroMuted, marginTop: 2, lineHeight: 20 }} type="small">
                Use code <Text style={{ fontWeight: "800", color: "#FFF" }}>WELCOME</Text> at checkout.
              </ThemedText>
              <Button title="Order now" variant="light" small icon="arrow-forward" onPress={() => go("/(tabs)/menu")} style={{ marginTop: Spacing.three, alignSelf: "flex-start" }} />
            </View>
            <Text style={{ position: "absolute", right: -14, bottom: -8, fontSize: 124, transform: [{ rotate: "-12deg" }] }}>🍛</Text>
          </View>
        </View>

        {/* categories */}
        <View style={{ marginTop: Spacing.five - 4 }}>
          <SectionHeader title="What are you craving?" style={{ paddingHorizontal: Spacing.three }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.three - 2 }}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c.id} activeOpacity={0.8} onPress={() => goWith("/(tabs)/menu", { cat: c.id })} style={{ width: 78, alignItems: "center" }} accessibilityRole="button" accessibilityLabel={c.label}>
                <EmojiTile emoji={c.emoji} size={72} tint={c.tint} radius={24} />
                <ThemedText type="caption" style={{ marginTop: 6, textAlign: "center", fontWeight: "700" }} numberOfLines={2}>
                  {c.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* order again */}
        {lastDone ? (
          <View style={{ paddingHorizontal: Spacing.three, marginTop: Spacing.five - 4 }}>
            <SectionHeader title="Order it again" action="All orders" onAction={() => go("/(tabs)/orders")} />
            <Card style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flexDirection: "row" }}>
                {lastDone.items.slice(0, 2).map((i, idx) => (
                  <View key={idx} style={{ marginLeft: idx ? -18 : 0, borderRadius: 18, borderWidth: 3, borderColor: theme.card }}>
                    <EmojiTile emoji={i.emoji} size={46} radius={14} />
                  </View>
                ))}
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.three }}>
                <ThemedText type="smallBold" numberOfLines={2}>
                  {lastDone.items.map((i) => i.name).join(", ")}
                </ThemedText>
                <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: 2 }}>
                  {formatMoney(lastDone.total)} · {plural(lastDone.items.reduce((s, i) => s + i.qty, 0), "item")}
                </ThemedText>
              </View>
              <Button
                title="Reorder"
                small
                variant="soft"
                onPress={() => {
                  reorder(lastDone.items);
                  go("/(tabs)/cart");
                }}
              />
            </Card>
          </View>
        ) : null}

        {/* popular */}
        <View style={{ marginTop: Spacing.five - 4 }}>
          <SectionHeader title="Popular right now" action="See menu" onAction={() => go("/(tabs)/menu")} style={{ paddingHorizontal: Spacing.three }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.three - 2 }}>
            {popular.map((m) => (
              <FeatureCard key={m.id} item={m} />
            ))}
          </ScrollView>
        </View>

        {/* chef's picks */}
        <View style={{ paddingHorizontal: Spacing.three, marginTop: Spacing.five - 4 }}>
          <SectionHeader title="Chef's picks" />
          <Card style={{ paddingVertical: 0, paddingHorizontal: Spacing.three }}>
            {chefPicks.map((m, i) => (
              <MenuRow key={m.id} item={m} last={i === chefPicks.length - 1} />
            ))}
          </Card>
        </View>

        <ThemedText type="caption" themeColor="inkSoft" style={{ textAlign: "center", marginTop: Spacing.five }}>
          Free delivery over {formatMoney(Brand.freeDeliveryOver)} · {Brand.supportPhone}
        </ThemedText>
      </Container>
      <CartBar />
    </View>
  );
}

/** Red "your order is cooking" card with a mini progress meter. */
function ActiveOrder({ order, now }: { order: ReturnType<typeof useOrders>["orders"][number]; now: number }) {
  const theme = useTheme();
  const status = effectiveStatus(order, now);
  const steps = stepsFor(order.mode);
  const idx = stepIndex(status, order.mode);
  const eta = etaTimestamp(order);
  const secsLeft = Math.max(0, Math.round((eta - now) / 1000));
  const left = secsLeft >= 90 ? `${Math.round(secsLeft / 60)} min` : secsLeft > 0 ? "under a minute" : "any moment";
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => go(`/order/${order.id}`)}
      style={{
        marginHorizontal: Spacing.three,
        marginTop: Spacing.four,
        backgroundColor: theme.card,
        borderRadius: Radius.lg,
        borderWidth: 1.5,
        borderColor: theme.accent,
        padding: Spacing.three,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <EmojiTile emoji={order.mode === "delivery" && status === "on_the_way" ? "🛵" : "👨‍🍳"} size={50} radius={16} />
        <View style={{ flex: 1, marginLeft: Spacing.three }}>
          <ThemedText type="label" style={{ color: theme.accent }}>{STATUS_LABEL[status]}</ThemedText>
          <ThemedText type="smallBold" style={{ marginTop: 2 }}>
            {order.mode === "delivery" ? `Arriving in ${left}` : `Ready in ${left}`}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">By {timeLabel(eta)} · {order.reference}</ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.inkSoft} />
      </View>
      <View style={{ flexDirection: "row", gap: 6, marginTop: Spacing.three }}>
        {steps.map((s, i) => (
          <View key={s.key} style={{ flex: 1 }}>
            <ProgressBar value={i <= idx ? 1 : 0} height={6} />
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}
