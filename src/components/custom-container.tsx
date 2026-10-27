import { useTheme } from "@/hooks/use-theme";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

interface ContainerProps {
  children?: ReactNode;
  backgroundColor?: string;
  scroll?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

export default function Container({
  children,
  backgroundColor,
  style,
  edges = ["top", "bottom"],
  scroll = true,
}: ContainerProps) {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor || theme.background }} edges={edges}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[{ flexGrow: 1, paddingBottom: 32 }, style]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scroll}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
          alwaysBounceVertical={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
