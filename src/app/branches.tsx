import Container from "@/components/custom-container";
import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Card, IconBadge } from "@/components/ui";
import { Spacing } from "@/constants/theme";
import { BRANCHES } from "@/data/branches";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Linking, TouchableOpacity, View } from "react-native";

export default function Branches() {
  const theme = useTheme();
  return (
    <Container edges={["top", "bottom"]}>
      <Header title="Our branches" />
      <View style={{ paddingHorizontal: Spacing.three, gap: Spacing.three }}>
        <ThemedText themeColor="textSecondary" style={{ lineHeight: 22 }}>
          Every branch cooks to order and takes pickup orders from the app. Skip the queue and walk straight to the counter.
        </ThemedText>
        {BRANCHES.map((b) => (
          <Card key={b.id}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconBadge icon="storefront" size={46} />
              <View style={{ flex: 1, marginLeft: Spacing.three }}>
                <ThemedText type="bold">{b.name}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: 2 }}>{b.address}</ThemedText>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: Spacing.three, gap: Spacing.four }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="time-outline" size={15} color={theme.textSecondary} />
                <ThemedText type="caption" style={{ marginLeft: 5 }}>{b.hours}</ThemedText>
              </View>
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${b.phone.replace(/\s/g, "")}`)} style={{ flexDirection: "row", alignItems: "center", marginLeft: "auto" }} hitSlop={8}>
                <Ionicons name="call-outline" size={15} color={theme.accent} />
                <ThemedText type="caption" style={{ marginLeft: 5, color: theme.accent, fontWeight: "700" }}>Call</ThemedText>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>
    </Container>
  );
}
