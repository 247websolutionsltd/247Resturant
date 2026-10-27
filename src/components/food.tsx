import { SerifFont, Spacing } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrdersContext";
import { categoryById, MenuItem, TAG_LABEL } from "@/data/menu";
import { useTheme } from "@/hooks/use-theme";
import { formatMoney } from "@/lib/format";
import { go } from "@/lib/nav";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { EmojiTile, Pill, QtyStepper } from "./ui";

export const hasOptions = (item: MenuItem) => !!(item.sizes?.length || item.addOns?.length);
export const openItem = (id: string) => go(`/item/${id}`);

export function Rating({ item, compact = false }: { item: MenuItem; compact?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Ionicons name="star" size={12} color={theme.gold} />
      <ThemedText type="caption" style={{ marginLeft: 3, fontWeight: "700" }}>
        {item.rating.toFixed(1)}
      </ThemedText>
      {!compact && (
        <ThemedText type="caption" themeColor="textSecondary" style={{ marginLeft: 3 }}>
          ({item.reviews.toLocaleString("en-NG")})
        </ThemedText>
      )}
    </View>
  );
}

/** "+" that adds straight away, or opens the item when it has sizes / add-ons to choose. */
export function QuickAdd({ item }: { item: MenuItem }) {
  const theme = useTheme();
  const { bump, qtyOfItem } = useCart();
  const qty = qtyOfItem(item.id);
  const custom = hasOptions(item);

  if (qty > 0 && !custom) {
    return (
      <QtyStepper value={qty} onChange={(v) => bump(item.id, v > qty ? 1 : -1)} size={30} />
    );
  }
  return (
    <TouchableOpacity
      onPress={() => (custom ? openItem(item.id) : bump(item.id, 1))}
      accessibilityRole="button"
      accessibilityLabel={`Add ${item.name}`}
      style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: theme.cta,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name="add" size={22} color="#FFF" />
      {custom && qty > 0 ? (
        <View style={{ position: "absolute", top: -6, right: -6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: theme.gold, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: "800", color: "#2A1411" }}>{qty}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

/** Menu list row: photo tile on the left, details and the add control on the right. */
export function MenuRow({ item, last = false }: { item: MenuItem; last?: boolean }) {
  const theme = useTheme();
  const cat = categoryById(item.cat);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => openItem(item.id)}
      style={{
        flexDirection: "row",
        paddingVertical: Spacing.three,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.line,
      }}
    >
      <EmojiTile emoji={item.emoji} size={92} tint={cat.tint} />
      <View style={{ flex: 1, marginLeft: Spacing.three }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {item.tags.slice(0, 2).map((t) => (
            <Pill key={t} label={TAG_LABEL[t].toUpperCase()} tone={t === "spicy" ? "red" : t === "veg" ? "green" : "gold"} />
          ))}
        </View>
        <ThemedText type="bold" numberOfLines={1} style={{ marginTop: item.tags.length ? 4 : 0 }}>
          {item.name}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary" numberOfLines={2} style={{ marginTop: 2, lineHeight: 16 }}>
          {item.desc}
        </ThemedText>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <View>
            <ThemedText type="price">{formatMoney(item.price)}</ThemedText>
            <Rating item={item} compact />
          </View>
          <QuickAdd item={item} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

/** Vertical feature card for horizontal carousels. */
export function FeatureCard({ item, width = 168 }: { item: MenuItem; width?: number }) {
  const theme = useTheme();
  const { isFavorite, toggleFavorite } = useOrders();
  const cat = categoryById(item.cat);
  const fav = isFavorite(item.id);
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => openItem(item.id)}
      style={{
        width,
        borderRadius: 22,
        backgroundColor: theme.card,
        borderWidth: 1.5,
        borderColor: theme.line,
        padding: 10,
      }}
    >
      <View>
        <EmojiTile emoji={item.emoji} size={width - 23} tint={cat.tint} radius={16} />
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={fav ? "Remove from favourites" : "Add to favourites"}
          style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name={fav ? "heart" : "heart-outline"} size={17} color={fav ? "#D7261E" : "#7A5F57"} />
        </TouchableOpacity>
        {item.tags[0] ? (
          <View style={{ position: "absolute", left: 8, bottom: 8 }}>
            <Pill label={TAG_LABEL[item.tags[0]].toUpperCase()} tone={item.tags[0] === "spicy" ? "red" : "gold"} />
          </View>
        ) : null}
      </View>
      <ThemedText type="smallBold" numberOfLines={1} style={{ marginTop: 10 }}>
        {item.name}
      </ThemedText>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
        <Rating item={item} compact />
        <ThemedText type="caption" themeColor="textSecondary" style={{ marginLeft: 6 }}>
          · {item.prep} min
        </ThemedText>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <ThemedText type="price" style={{ fontFamily: SerifFont }}>
          {formatMoney(item.price)}
        </ThemedText>
        <QuickAdd item={item} />
      </View>
    </TouchableOpacity>
  );
}
