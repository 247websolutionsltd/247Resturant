import { Colors, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "./brand";
import { RoundButton } from "./header";
import { ThemedText } from "./themed-text";
import { Awning } from "./ui";

/**
 * Shared frame for the sign-in screens. A striped shop awning hangs from the top, a big
 * serif headline sits under it with a "plate" of food, and the form follows on plain paper.
 */
export default function AuthShell({
  title,
  subtitle,
  onBack,
  emoji = "🍛",
  compact = false,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  emoji?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const plate = compact ? 84 : 118;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
        >
          <Awning top={insets.top} height={compact ? 14 : 30} />

          <View style={{ paddingHorizontal: Spacing.four, paddingTop: Spacing.three }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 }}>
              {onBack ? <RoundButton icon="chevron-back" onPress={onBack} label="Go back" /> : <Logo size={34} />}
              {onBack ? <Logo size={30} showName={false} /> : null}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: compact ? Spacing.three : Spacing.four }}>
              <View style={{ flex: 1, paddingRight: Spacing.two }}>
                <ThemedText type={compact ? "title" : "display"}>{title}</ThemedText>
                {subtitle ? (
                  <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.two, lineHeight: 22 }}>
                    {subtitle}
                  </ThemedText>
                ) : null}
              </View>
              {/* the "plate" */}
              <View
                style={{
                  width: plate,
                  height: plate,
                  borderRadius: plate / 2,
                  backgroundColor: theme.card,
                  borderWidth: 2,
                  borderColor: theme.line,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ rotate: "8deg" }],
                }}
              >
                <View style={{ width: plate - 18, height: plate - 18, borderRadius: (plate - 18) / 2, backgroundColor: Colors.palette.red100, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: plate * 0.5 }}>{emoji}</Text>
                </View>
              </View>
            </View>
          </View>

          <View
            style={{
              flexGrow: 1,
              paddingHorizontal: Spacing.four,
              paddingTop: compact ? Spacing.three : Spacing.four,
              paddingBottom: insets.bottom + Spacing.four,
            }}
          >
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/** "or" divider used between the main action and social sign-in. */
export function OrDivider({ label = "or" }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: Spacing.three + 2 }}>
      <View style={{ flex: 1, height: 1.5, backgroundColor: theme.line, borderRadius: Radius.pill }} />
      <ThemedText type="label" themeColor="inkSoft" style={{ marginHorizontal: Spacing.three }}>
        {label}
      </ThemedText>
      <View style={{ flex: 1, height: 1.5, backgroundColor: theme.line, borderRadius: Radius.pill }} />
    </View>
  );
}
