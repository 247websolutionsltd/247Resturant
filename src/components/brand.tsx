import { Brand } from "@/constants/brand";
import { SerifFont } from "@/constants/theme";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { ThemedText } from "./themed-text";

/** Ember mark: a flame on a red tile. `light` flips it for use on red backgrounds. */
export function LogoMark({ size = 40, light = false }: { size?: number; light?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: light ? "#FFF8F0" : Colors.hero,
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: Math.max(2, size * 0.06),
        borderBottomColor: light ? "#F0D9C4" : Colors.heroDeep,
      }}
    >
      <Ionicons name="flame" size={size * 0.58} color={light ? Colors.hero : "#FFF8F0"} />
    </View>
  );
}

export function Logo({ size = 40, showName = true, light = false }: { size?: number; showName?: boolean; light?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <LogoMark size={size} light={light} />
      {showName && (
        <View style={{ marginLeft: size * 0.28 }}>
          <ThemedText
            style={{
              fontFamily: SerifFont,
              fontSize: size * 0.7,
              lineHeight: size * 0.76,
              fontWeight: "800",
              letterSpacing: -0.6,
              color: light ? "#FFF8F0" : theme.text,
            }}
          >
            {Brand.name}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: Math.max(8, size * 0.22),
              lineHeight: size * 0.28,
              fontWeight: "800",
              letterSpacing: 3,
              color: light ? "rgba(255,248,240,0.8)" : theme.accent,
            }}
          >
            KITCHEN
          </ThemedText>
        </View>
      )}
    </View>
  );
}
