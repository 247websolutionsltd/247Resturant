import { Colors, Spacing } from "@/constants/theme";
import { Slide } from "@/data/onboardData";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions, Text, View, ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";

const { width } = Dimensions.get("window");

/** A little floating "sticker" around the plate. */
function Sticker({ children, style }: { children: React.ReactNode; style: ViewStyle }) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          position: "absolute",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.card,
          borderWidth: 1.5,
          borderColor: theme.line,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 8,
          shadowColor: "#2A1411",
          shadowOpacity: 0.14,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const PLATE = Math.min(250, width - 110);

function Illustration({ kind }: { kind: Slide["kind"] }) {
  const theme = useTheme();
  const emoji = kind === "menu" ? "🍛" : kind === "order" ? "🍔" : "🛵";
  return (
    <View style={{ height: 320, alignItems: "center", justifyContent: "center" }}>
      {/* backdrop sun-burst */}
      <View style={{ position: "absolute", width: PLATE + 70, height: PLATE + 70, borderRadius: (PLATE + 70) / 2, backgroundColor: Colors.palette.red100, opacity: theme.background === Colors.dark.background ? 0.15 : 1 }} />
      <View style={{ position: "absolute", width: PLATE + 20, height: PLATE + 20, borderRadius: (PLATE + 20) / 2, backgroundColor: Colors.hero, opacity: 0.12 }} />
      {/* plate */}
      <View style={{ width: PLATE, height: PLATE, borderRadius: PLATE / 2, backgroundColor: theme.card, borderWidth: 3, borderColor: theme.line, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: PLATE - 36, height: PLATE - 36, borderRadius: (PLATE - 36) / 2, backgroundColor: theme.accentSurface, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: theme.line }}>
          <Text style={{ fontSize: PLATE * 0.46 }}>{emoji}</Text>
        </View>
      </View>

      {kind === "menu" && (
        <>
          <Sticker style={{ top: 20, right: 0, transform: [{ rotate: "6deg" }] }}>
            <Ionicons name="star" size={14} color={theme.gold} />
            <ThemedText type="smallBold" style={{ marginLeft: 6 }}>4.9 · 1.2k reviews</ThemedText>
          </Sticker>
          <Sticker style={{ bottom: 26, left: 0, transform: [{ rotate: "-5deg" }] }}>
            <Text style={{ fontSize: 15 }}>🌶️</Text>
            <ThemedText type="smallBold" style={{ marginLeft: 6 }}>Spicy</ThemedText>
          </Sticker>
        </>
      )}
      {kind === "order" && (
        <>
          <Sticker style={{ top: 24, left: 0, transform: [{ rotate: "-6deg" }] }}>
            <Ionicons name="pricetag" size={14} color={theme.accent} />
            <ThemedText type="smallBold" style={{ marginLeft: 6 }}>WELCOME · 20% off</ThemedText>
          </Sticker>
          <Sticker style={{ bottom: 24, right: 0, transform: [{ rotate: "5deg" }] }}>
            <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: theme.cta, alignItems: "center", justifyContent: "center", marginRight: 8 }}>
              <Ionicons name="add" size={16} color="#FFF" />
            </View>
            <ThemedText type="smallBold">Add extra chicken</ThemedText>
          </Sticker>
        </>
      )}
      {kind === "track" && (
        <>
          <Sticker style={{ top: 22, right: 4, transform: [{ rotate: "5deg" }] }}>
            <Ionicons name="time" size={14} color={theme.accent} />
            <ThemedText type="smallBold" style={{ marginLeft: 6 }}>Arriving in 18 min</ThemedText>
          </Sticker>
          <Sticker style={{ bottom: 24, left: 0, transform: [{ rotate: "-4deg" }] }}>
            <Ionicons name="checkmark-circle" size={16} color={theme.success} />
            <ThemedText type="smallBold" style={{ marginLeft: 6 }}>Cooking · on the way</ThemedText>
          </Sticker>
        </>
      )}
    </View>
  );
}

export default function OnboardingItem({ item }: { item: Slide }) {
  const theme = useTheme();
  return (
    <View style={{ width, paddingHorizontal: Spacing.four, paddingTop: Spacing.three }}>
      <Illustration kind={item.kind} />
      <View style={{ marginTop: Spacing.three }}>
        <ThemedText type="label" style={{ color: theme.accent }}>{item.eyebrow}</ThemedText>
        <ThemedText type="title" style={{ marginTop: Spacing.two }}>{item.title}</ThemedText>
        <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.three, lineHeight: 24 }}>{item.description}</ThemedText>
      </View>
    </View>
  );
}
