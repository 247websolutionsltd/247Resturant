import Button from "@/components/button";
import Input from "@/components/custom-input";
import { Rating } from "@/components/food";
import { RoundButton } from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Pill, QtyStepper } from "@/components/ui";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { categoryById, itemById, TAG_LABEL } from "@/data/menu";
import { useTheme } from "@/hooks/use-theme";
import { MAX_QTY, unitPrice } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ItemDetail() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const item = itemById(String(id));
  const { add } = useCart();
  const { isFavorite, toggleFavorite } = useOrders();
  const [qty, setQty] = useState(1);
  const [sizeId, setSizeId] = useState<string | undefined>(item?.sizes?.[0]?.id);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [note, setNote] = useState("");

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.four }}>
        <ThemedText type="subtitle">That dish isn't on the menu</ThemedText>
        <Button title="Back to menu" onPress={() => router.back()} style={{ marginTop: Spacing.three }} />
      </View>
    );
  }

  const cat = categoryById(item.cat);
  const unit = unitPrice(item, sizeId, addOns);
  const fav = isFavorite(item.id);
  const toggleAddOn = (a: string) => setAddOns((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));

  const addToBasket = () => {
    add({ itemId: item.id, qty, sizeId, addOnIds: addOns, note });
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 140 }}>
          {/* hero */}
          <View style={{ backgroundColor: cat.tint, height: 300 + insets.top * 0.4, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <View style={{ position: "absolute", width: 330, height: 330, borderRadius: 165, backgroundColor: "rgba(255,255,255,0.45)" }} />
            <View style={{ position: "absolute", width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(255,255,255,0.55)" }} />
            <Text style={{ fontSize: 150, marginTop: insets.top * 0.4 }}>{item.emoji}</Text>
            <View style={{ position: "absolute", top: insets.top + 10, left: Spacing.three, right: Spacing.three, flexDirection: "row", justifyContent: "space-between" }}>
              <RoundButton icon="chevron-back" label="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/menu" as never))} />
              <RoundButton icon={fav ? "heart" : "heart-outline"} active={fav} label={fav ? "Remove from favourites" : "Add to favourites"} onPress={() => toggleFavorite(item.id)} />
            </View>
          </View>

          {/* sheet */}
          <View style={{ marginTop: -28, backgroundColor: theme.background, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, paddingHorizontal: Spacing.three, paddingTop: Spacing.four }}>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              {item.tags.map((t) => (
                <Pill key={t} label={TAG_LABEL[t].toUpperCase()} tone={t === "spicy" ? "red" : t === "veg" ? "green" : "gold"} />
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: Spacing.two }}>
              <ThemedText type="title" style={{ flex: 1 }}>{item.name}</ThemedText>
              <ThemedText type="large" style={{ color: theme.accent, marginLeft: Spacing.three }}>{formatMoney(item.price)}</ThemedText>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: Spacing.two, gap: Spacing.three }}>
              <Rating item={item} />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                <ThemedText type="caption" themeColor="textSecondary" style={{ marginLeft: 4 }}>{item.prep} min prep</ThemedText>
              </View>
            </View>
            <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.three, lineHeight: 24 }}>{item.desc}</ThemedText>

            {item.sizes && item.sizes.length > 1 ? (
              <View style={{ marginTop: Spacing.four }}>
                <OptionTitle title="Choose a size" tag="Required" />
                {item.sizes.map((s) => (
                  <OptionRow key={s.id} label={s.label} price={s.extra ? `+${formatMoney(s.extra)}` : "Included"} selected={sizeId === s.id} onPress={() => setSizeId(s.id)} radio />
                ))}
              </View>
            ) : null}

            {item.addOns?.length ? (
              <View style={{ marginTop: Spacing.four }}>
                <OptionTitle title="Make it bigger" tag="Optional" />
                {item.addOns.map((a) => (
                  <OptionRow key={a.id} label={a.label} price={`+${formatMoney(a.price)}`} selected={addOns.includes(a.id)} onPress={() => toggleAddOn(a.id)} />
                ))}
              </View>
            ) : null}

            <View style={{ marginTop: Spacing.four }}>
              <OptionTitle title="Special instructions" tag="Optional" />
              <Input placeholder="No onions, extra pepper, sauce on the side…" desc value={note} onChangeText={setNote} maxLength={140} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* sticky add bar */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.card,
          borderTopWidth: 1.5,
          borderTopColor: theme.line,
          paddingHorizontal: Spacing.three,
          paddingTop: Spacing.three,
          paddingBottom: Math.max(insets.bottom, Spacing.three),
          flexDirection: "row",
          alignItems: "center",
          gap: Spacing.three,
        }}
      >
        <QtyStepper value={qty} onChange={setQty} min={1} max={MAX_QTY} size={40} />
        <Button title={`Add · ${formatMoney(unit * qty)}`} onPress={addToBasket} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

function OptionTitle({ title, tag }: { title: string; tag: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.two }}>
      <ThemedText type="big">{title}</ThemedText>
      <Pill label={tag.toUpperCase()} tone="muted" />
    </View>
  );
}

function OptionRow({ label, price, selected, onPress, radio = false }: { label: string; price: string; selected: boolean; onPress: () => void; radio?: boolean }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole={radio ? "radio" : "checkbox"}
      accessibilityState={{ selected, checked: selected }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.three - 2,
        marginBottom: Spacing.two,
        borderRadius: Radius.md,
        backgroundColor: selected ? theme.accentSurface : theme.card,
        borderWidth: 1.5,
        borderColor: selected ? theme.accent : theme.line,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: radio ? 11 : 7,
          borderWidth: 2,
          borderColor: selected ? theme.cta : theme.controlOff,
          backgroundColor: selected && !radio ? theme.cta : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected ? radio ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.cta }} /> : <Ionicons name="checkmark" size={14} color="#FFF" /> : null}
      </View>
      <ThemedText type="smallBold" style={{ flex: 1, marginLeft: Spacing.three }}>{label}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{price}</ThemedText>
    </TouchableOpacity>
  );
}
