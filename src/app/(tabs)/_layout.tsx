import { Colors, SerifFont } from "@/constants/theme";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_META: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  home: { label: "Home", icon: "home-outline", iconActive: "home" },
  menu: { label: "Menu", icon: "restaurant-outline", iconActive: "restaurant" },
  cart: { label: "Basket", icon: "bag-handle-outline", iconActive: "bag-handle" },
  orders: { label: "Orders", icon: "receipt-outline", iconActive: "receipt" },
  profile: { label: "Me", icon: "person-outline", iconActive: "person" },
};

const ORDER = ["home", "menu", "cart", "orders", "profile"];

/** Flat bar with a red "awning" tab indicator on the active item. */
function CustomTabBar({ state, navigation }: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { count } = useCart();

  const routes = ORDER.map((name) => state.routes.find((r: any) => r.name === name)).filter(Boolean);
  const focusedName = state.routes[state.index]?.name;

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderTopWidth: 1.5,
        borderTopColor: theme.line,
        paddingBottom: Math.max(insets.bottom, 8),
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <View style={{ flexDirection: "row", height: 64 }}>
        {routes.map((route: any) => {
          const meta = TAB_META[route.name];
          const focused = focusedName === route.name;
          const color = focused ? theme.accent : theme.textSecondary;
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityLabel={meta.label}
              accessibilityState={{ selected: focused }}
            >
              <View style={[styles.indicator, { backgroundColor: focused ? Colors.hero : "transparent" }]} />
              <View>
                <Ionicons name={focused ? meta.iconActive : meta.icon} size={23} color={color} />
                {route.name === "cart" && count > 0 ? (
                  <View style={[styles.badge, { backgroundColor: Colors.hero, borderColor: theme.card }]}>
                    <Text style={styles.badgeText}>{count > 9 ? "9+" : count}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.label, { color, fontWeight: focused ? "800" : "600" }]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="menu" options={{ title: "Menu" }} />
      <Tabs.Screen name="cart" options={{ title: "Basket" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  indicator: { position: "absolute", top: 0, width: 34, height: 4, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  label: { fontSize: 11 },
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "800", fontFamily: SerifFont },
});
