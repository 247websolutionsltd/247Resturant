import { Colors, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { ActivityIndicator, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Variant = "primary" | "dark" | "soft" | "secondary" | "light" | "ghost" | "danger";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconLeft?: IconName;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Chunky "sticker" button: square-ish corners and a darker lower edge, so it feels pressable.
 * `light` and `ghost` are for use on red surfaces.
 */
export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  iconLeft,
  small = false,
  style,
}: Props) {
  const theme = useTheme();

  const palette = {
    primary: { bg: theme.cta, fg: theme.ctaText, border: "transparent", edge: Colors.heroDeep },
    dark: { bg: theme.text, fg: theme.background, border: "transparent", edge: theme.textSecondary },
    light: { bg: "#FFF8F0", fg: Colors.heroDeep, border: "transparent", edge: "#E9CDB4" },
    ghost: { bg: "transparent", fg: "#FFF", border: "rgba(255,255,255,0.6)", edge: "rgba(255,255,255,0.6)" },
    soft: { bg: theme.accentSurface, fg: theme.accentText, border: theme.line, edge: theme.line },
    secondary: { bg: "transparent", fg: theme.text, border: theme.line, edge: theme.line },
    danger: { bg: "transparent", fg: theme.danger, border: theme.line, edge: theme.line },
  }[variant];

  const solid = variant === "primary" || variant === "dark" || variant === "light";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.base,
        small && styles.small,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderBottomColor: solid ? palette.edge : palette.border,
          borderBottomWidth: solid ? 4 : 1.5,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {iconLeft && <Ionicons name={iconLeft} size={small ? 16 : 20} color={palette.fg} style={{ marginRight: Spacing.two }} />}
          <ThemedText style={{ color: palette.fg, fontSize: small ? 14 : 16, fontWeight: "800", letterSpacing: 0.2 }}>{title}</ThemedText>
          {icon && <Ionicons name={icon} size={small ? 16 : 20} color={palette.fg} style={{ marginLeft: Spacing.two }} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  small: { height: 42, paddingHorizontal: Spacing.three, borderRadius: 12 },
  row: { flexDirection: "row", alignItems: "center" },
});
