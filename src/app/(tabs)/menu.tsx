import CartBar from "@/components/cart-bar";
import { MenuRow } from "@/components/food";
import { ThemedText } from "@/components/themed-text";
import { Chip, EmptyState, EmojiTile } from "@/components/ui";
import { Radius, Spacing, TabBarSpace } from "@/constants/theme";
import { CATEGORIES, CategoryId, MENU } from "@/data/menu";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Filter = "all" | CategoryId;

export default function Menu() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ cat?: string; focus?: string }>();
  const [cat, setCat] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const input = useRef<TextInput>(null);

  // arriving from a Home category tile or the Home search box
  useEffect(() => {
    if (params.cat && CATEGORIES.some((c) => c.id === params.cat)) setCat(params.cat as CategoryId);
    else if (params.cat === undefined && params.focus) setCat("all");
    if (params.focus) setTimeout(() => input.current?.focus(), 250);
  }, [params.cat, params.focus]);

  const query = q.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      MENU.filter(
        (m) =>
          (cat === "all" || m.cat === cat) &&
          (!query || m.name.toLowerCase().includes(query) || m.desc.toLowerCase().includes(query)),
      ),
    [cat, query],
  );
  const grouped = cat === "all" && !query;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: Spacing.three, paddingTop: Spacing.three }}>
          <ThemedText type="title">The menu</ThemedText>
          <ThemedText themeColor="textSecondary" style={{ marginTop: 2 }}>
            {MENU.length} dishes, cooked when you order.
          </ThemedText>
          <View
            style={{
              marginTop: Spacing.three,
              height: 50,
              borderRadius: Radius.md,
              backgroundColor: theme.card,
              borderWidth: 1.5,
              borderColor: theme.line,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: Spacing.three,
            }}
          >
            <Ionicons name="search" size={18} color={theme.inkSoft} />
            <TextInput
              ref={input}
              value={q}
              onChangeText={setQ}
              placeholder="Search dishes and drinks"
              placeholderTextColor={theme.inkSoft}
              selectionColor={theme.accent}
              returnKeyType="search"
              style={{ flex: 1, marginLeft: Spacing.two + 2, color: theme.text, fontSize: 16, height: 50, ...({ outlineStyle: "none" } as object) }}
            />
            {q ? (
              <TouchableOpacity onPress={() => setQ("")} hitSlop={10} accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={theme.inkSoft} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={{ height: 64 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, gap: Spacing.two }}>
            <Chip label="All" selected={cat === "all"} onPress={() => setCat("all")} />
            {CATEGORIES.map((c) => (
              <Chip key={c.id} label={c.label} emoji={c.emoji} selected={cat === c.id} onPress={() => setCat(c.id)} />
            ))}
          </ScrollView>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three, paddingBottom: TabBarSpace }}>
          {filtered.length === 0 ? (
            <EmptyState emoji="🔍" title="Nothing matches that" text={`We couldn't find "${q.trim()}". Try a different dish, or browse a category.`} />
          ) : grouped ? (
            CATEGORIES.map((c) => {
              const items = MENU.filter((m) => m.cat === c.id);
              if (!items.length) return null;
              return (
                <View key={c.id} style={{ marginBottom: Spacing.three }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: Spacing.two }}>
                    <EmojiTile emoji={c.emoji} size={34} radius={11} tint={c.tint} />
                    <ThemedText type="big" style={{ marginLeft: Spacing.two + 2, flex: 1 }}>{c.label}</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">{items.length} dishes</ThemedText>
                  </View>
                  {items.map((m, i) => (
                    <MenuRow key={m.id} item={m} last={i === items.length - 1} />
                  ))}
                </View>
              );
            })
          ) : (
            filtered.map((m, i) => <MenuRow key={m.id} item={m} last={i === filtered.length - 1} />)
          )}
        </ScrollView>
      </SafeAreaView>
      <CartBar />
    </View>
  );
}
