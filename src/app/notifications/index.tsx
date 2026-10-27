import Container from "@/components/custom-container";
import Header from "@/components/header";
import NotificationCard from "@/components/notification";
import { ThemedText } from "@/components/themed-text";
import { Chip } from "@/components/ui";
import { Spacing } from "@/constants/theme";
import { useOrders } from "@/context/OrdersContext";
import { useTheme } from "@/hooks/use-theme";
import { timeAgo } from "@/lib/format";
import { go } from "@/lib/nav";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";

const filters = ["All", "Orders", "Offers", "Account"] as const;

export default function Notifications() {
  const theme = useTheme();
  const { notifications, markAllRead, markNotificationRead } = useOrders();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const list = notifications.filter((n) => filter === "All" || n.type === filter);
  const hasUnread = notifications.some((n) => n.unread);

  return (
    <Container edges={["top", "bottom"]}>
      <Header
        title="Notifications"
        right={
          <TouchableOpacity onPress={markAllRead} disabled={!hasUnread} hitSlop={10}>
            <ThemedText type="smallBold" style={{ color: hasUnread ? theme.accent : theme.inkSoft }}>Read all</ThemedText>
          </TouchableOpacity>
        }
      />
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.three }}>
          {filters.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>
      </View>
      <View style={{ paddingHorizontal: Spacing.three }}>
        {list.length === 0 && <ThemedText themeColor="textSecondary" style={{ textAlign: "center", marginTop: Spacing.five }}>Nothing new. You're all caught up.</ThemedText>}
        {list.map((n) => (
          <NotificationCard
            key={n.id}
            icon={n.icon}
            title={n.title}
            desc={n.desc}
            time={timeAgo(n.ts)}
            unread={n.unread}
            onPress={() => {
              markNotificationRead(n.id);
              go(`/notifications/${n.id}`);
            }}
          />
        ))}
      </View>
    </Container>
  );
}
