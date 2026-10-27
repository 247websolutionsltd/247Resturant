import { useCart } from "@/context/CartContext";
import { formatMoney, plural } from "@/lib/format";
import { go } from "@/lib/nav";
import { Colors, SerifFont } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";

/** Sticky "View basket" bar that floats above the tab bar while the cart has items. */
export default function CartBar() {
  const { count, subtotal } = useCart();
  const insets = useSafeAreaInsets();
  if (count === 0) return null;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, bottom: 66 + Math.max(insets.bottom, 8) + 10, paddingHorizontal: 16 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => go("/(tabs)/cart")}
        accessibilityRole="button"
        accessibilityLabel={`View basket, ${plural(count, "item")}`}
        style={{
          height: 58,
          borderRadius: 18,
          backgroundColor: Colors.palette.ink,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          borderBottomWidth: 4,
          borderBottomColor: "#000",
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        }}
      >
        <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: Colors.hero, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#FFF", fontWeight: "800", fontFamily: SerifFont }}>{count}</Text>
        </View>
        <ThemedText type="smallBold" style={{ color: "#FFF8F0", marginLeft: 12, flex: 1 }}>
          View basket
        </ThemedText>
        <ThemedText type="price" style={{ color: "#FFF8F0", marginRight: 8 }}>
          {formatMoney(subtotal)}
        </ThemedText>
        <Ionicons name="arrow-forward" size={18} color="#FFF8F0" />
      </TouchableOpacity>
    </View>
  );
}
