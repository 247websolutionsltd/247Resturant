import Button from "@/components/button";
import Container from "@/components/custom-container";
import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Card, IconBadge } from "@/components/ui";
import { Spacing } from "@/constants/theme";
import { useOrders } from "@/context/OrdersContext";
import { timeAgo } from "@/lib/format";
import { go } from "@/lib/nav";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function NotificationDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { notifications } = useOrders();
  const n = notifications.find((x) => x.id === id) ?? notifications[0];
  if (!n) return null;

  return (
    <Container edges={["top", "bottom"]}>
      <Header title="Notification" />
      <View style={{ paddingHorizontal: Spacing.three }}>
        <View style={{ alignItems: "center", marginTop: Spacing.four }}>
          <IconBadge icon={n.icon} size={76} round />
          <ThemedText type="large" style={{ textAlign: "center", marginTop: Spacing.four }}>{n.title}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>{timeAgo(n.ts)} · {n.type}</ThemedText>
        </View>
        <Card alt style={{ marginTop: Spacing.four }}>
          <ThemedText themeColor="textSecondary" style={{ lineHeight: 24 }}>{n.detail}</ThemedText>
        </Card>
        {n.action && <Button title={n.action.label} onPress={() => go(n.action!.route)} style={{ marginTop: Spacing.four }} />}
      </View>
    </Container>
  );
}
