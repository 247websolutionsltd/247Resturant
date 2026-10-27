import { Colors, Radius, SerifFont, Spacing } from "@/constants/theme";
import { IconName } from "@/data/icons";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { Dimensions, LayoutChangeEvent, StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";

/* ------------------------------ Card ------------------------------------ */
export function Card({
  children,
  style,
  alt = false,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  alt?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const base: ViewStyle = {
    backgroundColor: alt ? theme.accentSurface : theme.card,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: theme.line,
    padding: Spacing.three,
  };
  if (onPress)
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[base, style]}>
        {children}
      </TouchableOpacity>
    );
  return <View style={[base, style]}>{children}</View>;
}

/* ------------------------------ Awning ---------------------------------- */
/**
 * A striped shop-front awning with a scalloped lower edge. Ember's signature element:
 * it hangs from the top of the auth screens.
 */
export function Awning({ top = 0, stripes = 9, height = 38 }: { top?: number; stripes?: number; height?: number }) {
  const [width, setWidth] = useState(Dimensions.get("window").width);
  const w = width / stripes;
  const stripe = (i: number) => (i % 2 === 0 ? Colors.hero : "#FFF8F0");
  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ width: "100%" }}>
      <View style={{ flexDirection: "row", height: height + top }}>
        {Array.from({ length: stripes }).map((_, i) => (
          <View key={i} style={{ width: w, height: "100%", backgroundColor: stripe(i) }} />
        ))}
      </View>
      <View style={{ flexDirection: "row", height: w / 2 }}>
        {Array.from({ length: stripes }).map((_, i) => (
          <View
            key={i}
            style={{
              width: w,
              height: w / 2,
              backgroundColor: stripe(i),
              borderBottomLeftRadius: w / 2,
              borderBottomRightRadius: w / 2,
            }}
          />
        ))}
      </View>
    </View>
  );
}

/* ------------------------------ Sprinkles -------------------------------- */
const SPRINKLES: { e: string; x: number; y: number; s: number; r: number }[] = [
  { e: "🍛", x: 6, y: 8, s: 40, r: -14 },
  { e: "🌶️", x: 78, y: 4, s: 30, r: 18 },
  { e: "🍗", x: 88, y: 38, s: 38, r: -8 },
  { e: "🍔", x: 4, y: 46, s: 36, r: 12 },
  { e: "🍹", x: 62, y: 66, s: 34, r: -16 },
  { e: "🍢", x: 20, y: 80, s: 36, r: 20 },
  { e: "🥟", x: 46, y: 24, s: 28, r: -10 },
  { e: "🍌", x: 84, y: 84, s: 34, r: 14 },
];

/** Scattered food emoji at low opacity. Texture for red surfaces. */
export function Sprinkles({ opacity = 0.16 }: { opacity?: number }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
      {SPRINKLES.map((s, i) => (
        <Text
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: s.s,
            opacity,
            transform: [{ rotate: `${s.r}deg` }],
          }}
        >
          {s.e}
        </Text>
      ))}
    </View>
  );
}

/* ----------------------------- EmojiTile -------------------------------- */
/** Food "photo": an emoji on a soft tinted tile. Works offline, themes cleanly. */
export function EmojiTile({
  emoji,
  size = 84,
  tint,
  radius,
  style,
}: {
  emoji: string;
  size?: number;
  tint?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius ?? size * 0.26,
          backgroundColor: tint ?? theme.accentSurface,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        style,
      ]}
    >
      <View
        style={{
          position: "absolute",
          width: size * 0.86,
          height: size * 0.86,
          borderRadius: size,
          backgroundColor: "rgba(255,255,255,0.55)",
        }}
      />
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

/* ------------------------------ IconBadge ------------------------------- */
export function IconBadge({
  icon,
  size = 46,
  color,
  bg,
  round = false,
}: {
  icon: IconName;
  size?: number;
  color?: string;
  bg?: string;
  round?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: round ? size / 2 : size * 0.3,
        backgroundColor: bg ?? theme.accentSurface,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={size * 0.46} color={color ?? theme.accent} />
    </View>
  );
}

/* -------------------------------- Chip ---------------------------------- */
export function Chip({
  label,
  selected,
  onPress,
  icon,
  emoji,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  emoji?: string;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Spacing.three - 2,
        height: 40,
        borderRadius: 12,
        backgroundColor: selected ? theme.cta : theme.card,
        borderWidth: 1.5,
        borderColor: selected ? theme.cta : theme.line,
      }}
    >
      {emoji ? <Text style={{ fontSize: 16, marginRight: 6 }}>{emoji}</Text> : null}
      {icon && <Ionicons name={icon} size={15} color={selected ? theme.ctaText : theme.textSecondary} style={{ marginRight: 6 }} />}
      <ThemedText type="smallBold" style={{ color: selected ? theme.ctaText : theme.text }}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

/* ---------------------------- ProgressBar ------------------------------- */
export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: height, backgroundColor: theme.line, overflow: "hidden" }}>
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height, backgroundColor: color ?? theme.accent }} />
    </View>
  );
}

/* ------------------------------- Toggle --------------------------------- */
export function Toggle({ value, onValueChange, label }: { value: boolean; onValueChange: (v: boolean) => void; label?: string }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      activeOpacity={0.9}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      style={{
        width: 52,
        height: 30,
        borderRadius: 15,
        backgroundColor: value ? theme.cta : theme.controlOff,
        paddingHorizontal: 4,
        justifyContent: "center",
        alignItems: value ? "flex-end" : "flex-start",
      }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: theme.controlThumb }} />
    </TouchableOpacity>
  );
}

/* --------------------------- SectionHeader ------------------------------ */
export function SectionHeader({
  title,
  action,
  onAction,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <View style={[{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: Spacing.three }, style]}>
      <ThemedText type="big">{title}</ThemedText>
      {action && (
        <TouchableOpacity onPress={onAction} hitSlop={10}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            {action}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ------------------------------- ListRow -------------------------------- */
export function ListRow({
  icon,
  title,
  subtitle,
  onPress,
  right,
  last = false,
  danger = false,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
  last?: boolean;
  danger?: boolean;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.three - 2,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.line,
      }}
    >
      <IconBadge icon={icon} size={40} color={danger ? theme.danger : undefined} />
      <View style={{ flex: 1, marginLeft: Spacing.three }}>
        <ThemedText type="smallBold" style={danger ? { color: theme.danger } : undefined}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: 2 }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={theme.inkSoft} /> : null)}
    </TouchableOpacity>
  );
}

/* ------------------------------ DetailRow ------------------------------- */
export function DetailRow({ label, value, last = false, bold = false, accent = false }: { label: string; value: string; last?: boolean; bold?: boolean; accent?: boolean }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: Spacing.two + 1,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.line,
        gap: Spacing.three,
      }}
    >
      <ThemedText type={bold ? "smallBold" : "small"} themeColor={bold ? "text" : "textSecondary"}>
        {label}
      </ThemedText>
      <ThemedText type={bold ? "price" : "smallBold"} style={{ flexShrink: 1, textAlign: "right", color: accent ? theme.success : theme.text }}>
        {value}
      </ThemedText>
    </View>
  );
}

/* ------------------------------ DashedLine ------------------------------ */
/** Receipt-style perforation. */
export function DashedLine({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View style={[{ height: 1.5, overflow: "hidden" }, style]}>
      <View style={{ height: 3, borderWidth: 1.5, borderStyle: "dashed", borderColor: theme.line, borderRadius: 1 }} />
    </View>
  );
}

/* --------------------------------- Pill --------------------------------- */
export function Pill({
  label,
  tone = "accent",
  icon,
}: {
  label: string;
  tone?: "accent" | "gold" | "green" | "muted" | "red";
  icon?: IconName;
}) {
  const theme = useTheme();
  const tones = {
    accent: { bg: theme.accentSurface, fg: theme.accentText },
    red: { bg: theme.cta, fg: "#FFF" },
    gold: { bg: theme.goldSurface, fg: theme.warning },
    green: { bg: theme.success + "22", fg: theme.success },
    muted: { bg: theme.cardAlt, fg: theme.textSecondary },
  }[tone];
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: tones.bg,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      {icon && <Ionicons name={icon} size={11} color={tones.fg} style={{ marginRight: 4 }} />}
      <ThemedText style={{ color: tones.fg, fontSize: 11, lineHeight: 15, fontWeight: "800", letterSpacing: 0.3 }}>{label}</ThemedText>
    </View>
  );
}

/* ------------------------------ QtyStepper ------------------------------ */
export function QtyStepper({
  value,
  onChange,
  min = 0,
  max = 20,
  size = 34,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: number;
}) {
  const theme = useTheme();
  const btn = (icon: "add" | "remove", onPress: () => void, disabled: boolean, filled: boolean) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={icon === "add" ? "Add one" : "Remove one"}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: filled ? theme.cta : theme.card,
        borderWidth: 1.5,
        borderColor: filled ? theme.cta : theme.line,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Ionicons name={icon} size={size * 0.5} color={filled ? "#FFF" : theme.text} />
    </TouchableOpacity>
  );
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {btn("remove", () => onChange(value - 1), value <= min, false)}
      <ThemedText style={{ minWidth: size * 0.85, textAlign: "center", fontFamily: SerifFont, fontWeight: "800", fontSize: 16 }}>{value}</ThemedText>
      {btn("add", () => onChange(value + 1), value >= max, true)}
    </View>
  );
}

/* ------------------------------- EmptyState ----------------------------- */
export function EmptyState({ emoji, title, text, children }: { emoji: string; title: string; text: string; children?: ReactNode }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: Spacing.five, paddingHorizontal: Spacing.four }}>
      <EmojiTile emoji={emoji} size={96} radius={32} />
      <ThemedText type="subtitle" style={{ marginTop: Spacing.four, textAlign: "center" }}>
        {title}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.two, textAlign: "center", lineHeight: 22 }}>
        {text}
      </ThemedText>
      {children ? <View style={{ marginTop: Spacing.four, alignSelf: "stretch" }}>{children}</View> : null}
    </View>
  );
}
