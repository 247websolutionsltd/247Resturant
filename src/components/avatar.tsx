import { Colors, SerifFont } from "@/constants/theme";
import { initials } from "@/lib/format";
import { View } from "react-native";
import { ThemedText } from "./themed-text";

export default function Avatar({ name, size = 46, onHero = false }: { name: string; size?: number; onHero?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: onHero ? "#FFF8F0" : Colors.palette.saffron,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ThemedText style={{ fontFamily: SerifFont, color: onHero ? Colors.heroDeep : Colors.palette.ink, fontWeight: "800", fontSize: size * 0.38 }}>
        {initials(name) || "🍴"}
      </ThemedText>
    </View>
  );
}
