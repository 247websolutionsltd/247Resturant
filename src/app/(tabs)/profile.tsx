import Avatar from "@/components/avatar";
import Button from "@/components/button";
import Container from "@/components/custom-container";
import { ThemedText } from "@/components/themed-text";
import { Card, ListRow, ProgressBar, Sprinkles, Toggle } from "@/components/ui";
import { Colors, Radius, Spacing, TabBarSpace } from "@/constants/theme";
import { useOrders } from "@/context/OrdersContext";
import { useAppTheme, useAuth } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { go, goReplace } from "@/lib/nav";
import { logoutUser } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";

const settings = [
  { title: "Edit profile", subtitle: "Name, email and phone", icon: "person-outline" as const, route: "/account/edit-profile" },
  { title: "Saved addresses", subtitle: "Where we deliver", icon: "location-outline" as const, route: "/account/addresses" },
  { title: "Favourites", subtitle: "Your go-to dishes", icon: "heart-outline" as const, route: "/favorites" },
  { title: "Our branches", subtitle: "Pickup spots and opening hours", icon: "storefront-outline" as const, route: "/branches" },
];
const more = [
  { title: "Refer & earn", subtitle: "Give ₦1,000, get ₦1,000", icon: "gift-outline" as const, route: "/refer" },
  { title: "Help & support", subtitle: "We're here every day", icon: "chatbubble-ellipses-outline" as const, route: "/support" },
  { title: "Privacy policy", subtitle: "How we look after your data", icon: "document-text-outline" as const, route: "/account/privacy-policy" },
];

export default function Profile() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useAppTheme();
  const { owner } = useAuth();
  const { orders, favorites, points, tier } = useOrders();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const confirmLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await logoutUser();
      setLogoutVisible(false);
      goReplace("/");
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Unable to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Container edges={["top"]} style={{ paddingBottom: TabBarSpace - 40 }}>
      <View style={{ padding: Spacing.three }}>
        <ThemedText type="title">Me</ThemedText>
      </View>

      <View style={{ paddingHorizontal: Spacing.three }}>
        <View style={{ backgroundColor: Colors.hero, borderRadius: Radius.xl, padding: Spacing.four - 2, overflow: "hidden", borderBottomWidth: 5, borderBottomColor: Colors.heroDeep }}>
          <Sprinkles opacity={0.12} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Avatar name={owner.name} size={64} />
            <View style={{ flex: 1, marginLeft: Spacing.three }}>
              <ThemedText type="big" style={{ color: "#FFF8F0" }} numberOfLines={1}>{owner.name || "Hungry human"}</ThemedText>
              <ThemedText type="small" style={{ color: Colors.heroMuted, marginTop: 2 }} numberOfLines={1}>{owner.email}</ThemedText>
            </View>
          </View>

          <View style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: Radius.md, padding: Spacing.three, marginTop: Spacing.four }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="ribbon" size={18} color={Colors.palette.saffron} />
                <ThemedText type="smallBold" style={{ color: "#FFF8F0", marginLeft: 6 }}>Ember {tier.name}</ThemedText>
              </View>
              <ThemedText type="smallBold" style={{ color: "#FFF8F0" }}>{points.toLocaleString("en-NG")} pts</ThemedText>
            </View>
            <View style={{ marginTop: Spacing.two + 2 }}>
              <ProgressBar value={tier.progress} color={Colors.palette.saffron} height={8} />
            </View>
            <ThemedText type="caption" style={{ color: Colors.heroMuted, marginTop: 6 }}>
              {tier.next ? `${tier.toNext.toLocaleString("en-NG")} points to ${tier.next}` : "You're at the top tier. Thank you!"}
            </ThemedText>
          </View>

          <View style={{ flexDirection: "row", gap: Spacing.two, marginTop: Spacing.three }}>
            {[
              { label: "Orders", value: String(orders.length) },
              { label: "Favourites", value: String(favorites.length) },
              { label: "Code", value: owner.referralCode || "–" },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: Radius.md, paddingVertical: Spacing.three - 2, alignItems: "center" }}>
                <ThemedText type="bold" style={{ color: "#FFF8F0" }} numberOfLines={1}>{s.value}</ThemedText>
                <ThemedText type="caption" style={{ color: Colors.heroMuted, marginTop: 2 }}>{s.label}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: Spacing.three, marginTop: Spacing.four, gap: Spacing.three }}>
        <Card style={{ paddingVertical: 0 }}>
          <ListRow
            icon={themeMode === "dark" ? "moon-outline" : "sunny-outline"}
            title="Dark mode"
            subtitle={themeMode === "dark" ? "On" : "Off"}
            last
            right={<Toggle value={themeMode === "dark"} onValueChange={(v) => setThemeMode(v ? "dark" : "light")} label="Dark mode" />}
          />
        </Card>

        <Card style={{ paddingVertical: 0 }}>
          {settings.map((s, i) => (
            <ListRow key={s.title} icon={s.icon} title={s.title} subtitle={s.subtitle} onPress={() => go(s.route)} last={i === settings.length - 1} />
          ))}
        </Card>

        <Card style={{ paddingVertical: 0 }}>
          {more.map((s, i) => (
            <ListRow key={s.title} icon={s.icon} title={s.title} subtitle={s.subtitle} onPress={() => go(s.route)} last={i === more.length - 1} />
          ))}
        </Card>

        <Button
          title="Sign out"
          variant="danger"
          iconLeft="log-out-outline"
          onPress={() => {
            setLogoutError(null);
            setLogoutVisible(true);
          }}
        />
      </View>

      <Modal visible={logoutVisible} transparent animationType="fade" onRequestClose={() => !loggingOut && setLogoutVisible(false)}>
        <View style={{ flex: 1, justifyContent: "center", padding: Spacing.four }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close sign-out dialog"
            onPress={() => !loggingOut && setLogoutVisible(false)}
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: theme.overlay }}
          />
          <View style={{ backgroundColor: theme.card, borderRadius: Radius.lg, padding: Spacing.four, borderWidth: 1.5, borderColor: theme.line }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.two }}>
              <Ionicons name="log-out-outline" size={22} color={theme.danger} />
              <ThemedText type="large">Leaving already?</ThemedText>
            </View>
            <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
              You'll need to sign in again to order. Your basket stays on this device.
            </ThemedText>
            {logoutError && <ThemedText style={{ color: theme.danger, marginTop: Spacing.two }}>{logoutError}</ThemedText>}
            <View style={{ flexDirection: "row", gap: Spacing.two, marginTop: Spacing.four }}>
              <Button title="Stay" variant="secondary" disabled={loggingOut} onPress={() => setLogoutVisible(false)} style={{ flex: 1 }} />
              <Button title="Sign out" variant="danger" loading={loggingOut} onPress={confirmLogout} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}
