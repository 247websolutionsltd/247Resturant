import Button from "@/components/button";
import Container from "@/components/custom-container";
import Input from "@/components/custom-input";
import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Card, Chip, EmptyState, IconBadge } from "@/components/ui";
import { Spacing } from "@/constants/theme";
import { useOrders } from "@/context/OrdersContext";
import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";

export default function Addresses() {
  const theme = useTheme();
  const { addresses, addAddress, removeAddress } = useOrders();
  const [label, setLabel] = useState("Home");
  const [line, setLine] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setError(null);
    setSaving(true);
    const res = await addAddress({ label, line });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    setLine("");
  };

  const confirmRemove = (id: string, name: string) =>
    Alert.alert("Remove address?", `${name} will be deleted from your saved addresses.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeAddress(id) },
    ]);

  return (
    <Container edges={["top", "bottom"]}>
      <Header title="Saved addresses" />
      <View style={{ paddingHorizontal: Spacing.three, gap: Spacing.three }}>
        {addresses.length === 0 ? (
          <EmptyState emoji="📍" title="No addresses yet" text="Save the places you order to most, and checkout becomes one tap." />
        ) : (
          <Card style={{ paddingVertical: 0 }}>
            {addresses.map((a, i) => (
              <View key={a.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: Spacing.three, borderBottomWidth: i === addresses.length - 1 ? 0 : 1, borderBottomColor: theme.line }}>
                <IconBadge icon={a.label.toLowerCase() === "work" ? "briefcase-outline" : "home-outline"} size={42} />
                <View style={{ flex: 1, marginLeft: Spacing.three }}>
                  <ThemedText type="smallBold">{a.label}</ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: 2 }}>{a.line}</ThemedText>
                </View>
                <TouchableOpacity onPress={() => confirmRemove(a.id, a.label)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Remove ${a.label}`}>
                  <Ionicons name="trash-outline" size={19} color={theme.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </Card>
        )}

        <Card>
          <ThemedText type="big">Add an address</ThemedText>
          <View style={{ flexDirection: "row", gap: Spacing.two, marginTop: Spacing.three }}>
            {["Home", "Work", "Other"].map((l) => (
              <Chip key={l} label={l} selected={label === l} onPress={() => setLabel(l)} />
            ))}
          </View>
          <Input placeholder="House number, street, area" icon="location-outline" value={line} onChangeText={setLine} error={error} />
          <Button title="Save address" onPress={save} loading={saving} style={{ marginTop: Spacing.two }} />
        </Card>
      </View>
    </Container>
  );
}
