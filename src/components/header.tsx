import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, ReactNode } from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

type IconName = ComponentProps<typeof Ionicons>["name"];

/** Rounded-square icon button (back, bell, heart...). */
export function RoundButton({
  icon,
  onPress,
  label,
  onHero = false,
  dot = false,
  active = false,
  size = 42,
}: {
  icon: IconName;
  onPress?: () => void;
  label?: string;
  onHero?: boolean;
  dot?: boolean;
  active?: boolean;
  size?: number;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ?? icon}
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: onHero ? "rgba(255,255,255,0.2)" : active ? theme.accentSurface : theme.card,
        borderWidth: onHero ? 0 : 1.5,
        borderColor: active ? theme.accent : theme.line,
      }}
    >
      <Ionicons name={icon} size={size * 0.48} color={onHero ? "#FFF" : active ? theme.accent : theme.text} />
      {dot && (
        <View
          style={{
            position: "absolute",
            top: 9,
            right: 10,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.accent,
            borderWidth: 2,
            borderColor: onHero ? "#D7261E" : theme.card,
          }}
        />
      )}
    </TouchableOpacity>
  );
}

/** Standard screen header: back button, centred serif title, optional right slot. */
export default function Header({
  title,
  right,
  back = true,
  onBack,
}: {
  title?: string;
  right?: ReactNode;
  back?: boolean;
  onBack?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.two,
        minHeight: 60,
      }}
    >
      <View style={{ width: 56 }}>
        {back && <RoundButton icon="chevron-back" label="Go back" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home" as never)))} />}
      </View>
      <ThemedText type="big" numberOfLines={1} style={{ flex: 1, textAlign: "center" }}>
        {title}
      </ThemedText>
      <View style={{ width: 56, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}
