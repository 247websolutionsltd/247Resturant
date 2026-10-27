import Button from "@/components/button";
import Container from "@/components/custom-container";
import { RoundButton } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Card, DashedLine, DetailRow, EmojiTile, EmptyState, ProgressBar, QtyStepper } from "@/components/ui";
import { Brand } from "@/constants/brand";
import { Radius, Spacing, TabBarSpace } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { categoryById, MENU } from "@/data/menu";
import { PROMOS, price } from "@/data/promos";
import { useTheme } from "@/hooks/use-theme";
import { formatMoney, plural } from "@/lib/format";
import { go } from "@/lib/nav";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, TextInput, TouchableOpacity, View } from "react-native";

const drinks = MENU.filter((m) => m.cat === "drinks");

export default function Cart() {
  const theme = useTheme();
  const { lines, count, subtotal, promo, applyPromo, removePromo, setQty, remove, clear, bump, qtyOfItem } = useCart();
  const [code, setCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);

  const tryApply = (c = code) => {
    if (!c.trim()) return;
    const err = applyPromo(c);
    setPromoError(err);
    if (!err) setCode("");
  };

  if (lines.length === 0) {
    return (
      <Container edges={["top"]} style={{ paddingBottom: TabBarSpace }}>
        <View style={{ padding: Spacing.three }}>
          <ThemedText type="title">Your basket</ThemedText>
        </View>
        <EmptyState emoji="🛒" title="Your basket is empty" text="Hungry? Add a few dishes from the menu and they'll show up here.">
          <Button title="Browse the menu" icon="arrow-forward" onPress={() => go("/(tabs)/menu")} />
        </EmptyState>
      </Container>
    );
  }

  const { discount } = price(subtotal, "pickup", promo);
  const toFree = Math.max(0, Brand.freeDeliveryOver - subtotal);
  const belowMin = subtotal < Brand.minOrder;
  const suggestions = drinks.filter((d) => qtyOfItem(d.id) === 0).slice(0, 3);

  return (
    <Container edges={["top"]} style={{ paddingBottom: TabBarSpace }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.three }}>
        <View>
          <ThemedText type="title">Your basket</ThemedText>
          <ThemedText themeColor="textSecondary">{plural(count, "item")}</ThemedText>
        </View>
        <RoundButton
          icon="trash-outline"
          label="Empty basket"
          onPress={() => Alert.alert("Empty your basket?", "All items will be removed.", [{ text: "Cancel", style: "cancel" }, { text: "Empty", style: "destructive", onPress: clear }])}
        />
      </View>

      <View style={{ paddingHorizontal: Spacing.three, gap: Spacing.three }}>
        {/* free delivery meter */}
        <Card alt style={{ paddingVertical: Spacing.three - 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: Spacing.two }}>
            <ThemedText style={{ fontSize: 18 }}>🛵</ThemedText>
            <ThemedText type="smallBold" style={{ marginLeft: Spacing.two, flex: 1 }}>
              {toFree > 0 ? `Add ${formatMoney(toFree)} more for free delivery` : "You've unlocked free delivery!"}
            </ThemedText>
          </View>
          <ProgressBar value={subtotal / Brand.freeDeliveryOver} />
        </Card>

        {/* lines */}
        <Card style={{ paddingVertical: 0 }}>
          {lines.map((l, i) => (
            <View key={l.key} style={{ flexDirection: "row", paddingVertical: Spacing.three, borderBottomWidth: i === lines.length - 1 ? 0 : 1, borderBottomColor: theme.line }}>
              <EmojiTile emoji={l.item.emoji} size={68} tint={categoryById(l.item.cat).tint} />
              <View style={{ flex: 1, marginLeft: Spacing.three }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <ThemedText type="bold" numberOfLines={2} style={{ flex: 1 }}>{l.item.name}</ThemedText>
                  <TouchableOpacity onPress={() => remove(l.key)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Remove ${l.item.name}`}>
                    <Ionicons name="close" size={18} color={theme.inkSoft} />
                  </TouchableOpacity>
                </View>
                {l.options ? <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: 2 }} numberOfLines={2}>{l.options}</ThemedText> : null}
                {l.note ? <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: 2, fontStyle: "italic" }} numberOfLines={2}>“{l.note}”</ThemedText> : null}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Spacing.two }}>
                  <ThemedText type="price">{formatMoney(l.total)}</ThemedText>
                  <QtyStepper value={l.qty} onChange={(v) => setQty(l.key, v)} size={30} />
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* drink upsell */}
        {suggestions.length > 0 ? (
          <View>
            <ThemedText type="big" style={{ marginBottom: Spacing.two + 2 }}>Add a drink?</ThemedText>
            <View style={{ flexDirection: "row", gap: Spacing.two }}>
              {suggestions.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  activeOpacity={0.85}
                  onPress={() => (d.sizes?.length ? go(`/item/${d.id}`) : bump(d.id, 1))}
                  style={{ flex: 1, backgroundColor: theme.card, borderRadius: Radius.md, borderWidth: 1.5, borderColor: theme.line, padding: Spacing.two + 2, alignItems: "center" }}
                >
                  <EmojiTile emoji={d.emoji} size={52} tint={categoryById(d.cat).tint} radius={16} />
                  <ThemedText type="caption" style={{ marginTop: 6, fontWeight: "700" }} numberOfLines={1}>{d.name}</ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary">+{formatMoney(d.price)}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* promo */}
        <View>
          <ThemedText type="big" style={{ marginBottom: Spacing.two + 2 }}>Promo code</ThemedText>
          {promo ? (
            <Card alt style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="pricetag" size={20} color={theme.accent} />
              <View style={{ flex: 1, marginLeft: Spacing.two + 2 }}>
                <ThemedText type="smallBold">{promo.code} applied</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">{promo.title}</ThemedText>
              </View>
              <TouchableOpacity onPress={removePromo} hitSlop={10}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>Remove</ThemedText>
              </TouchableOpacity>
            </Card>
          ) : (
            <>
              <View style={{ flexDirection: "row", gap: Spacing.two }}>
                <View style={{ flex: 1, height: 50, borderRadius: Radius.md, backgroundColor: theme.card, borderWidth: 1.5, borderColor: promoError ? theme.danger : theme.line, justifyContent: "center", paddingHorizontal: Spacing.three }}>
                  <TextInput
                    value={code}
                    onChangeText={(t) => {
                      setCode(t.toUpperCase());
                      setPromoError(null);
                    }}
                    onSubmitEditing={() => tryApply()}
                    placeholder="Enter code"
                    placeholderTextColor={theme.inkSoft}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    selectionColor={theme.accent}
                    style={{ color: theme.text, fontSize: 16, fontWeight: "700", letterSpacing: 1, ...({ outlineStyle: "none" } as object) }}
                  />
                </View>
                <Button title="Apply" small onPress={() => tryApply()} style={{ height: 50, borderRadius: Radius.md }} />
              </View>
              {promoError ? <ThemedText type="caption" style={{ color: theme.danger, marginTop: 6 }}>{promoError}</ThemedText> : null}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.two, marginTop: Spacing.two + 2 }}>
                {PROMOS.map((p) => (
                  <TouchableOpacity key={p.code} onPress={() => tryApply(p.code)} style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: theme.accent, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <ThemedText type="caption" style={{ color: theme.accent, fontWeight: "800", letterSpacing: 0.6 }}>{p.code}</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">{p.title}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* summary */}
        <Card>
          <DetailRow label="Subtotal" value={formatMoney(subtotal)} />
          {discount > 0 ? <DetailRow label={`Promo (${promo?.code})`} value={`-${formatMoney(discount)}`} accent /> : null}
          <DetailRow label="Delivery" value={toFree > 0 ? `${formatMoney(Brand.deliveryFee)} · free for pickup` : "Free"} />
          <DashedLine style={{ marginVertical: Spacing.two }} />
          <DetailRow label="Estimated total" value={formatMoney(Math.max(0, subtotal - discount) + (toFree > 0 ? Brand.deliveryFee : 0))} bold last />
        </Card>

        {belowMin ? (
          <ThemedText type="caption" style={{ color: theme.danger, textAlign: "center" }}>
            The minimum order is {formatMoney(Brand.minOrder)}. Add {formatMoney(Brand.minOrder - subtotal)} more.
          </ThemedText>
        ) : null}
        <Button title="Go to checkout" icon="arrow-forward" disabled={belowMin} onPress={() => go("/checkout")} />
      </View>
    </Container>
  );
}
