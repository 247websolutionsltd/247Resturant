import Container from "@/components/custom-container";
import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Card, ListRow } from "@/components/ui";
import { Brand } from "@/constants/brand";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatMoney } from "@/lib/format";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Linking, View } from "react-native";

const faqs = [
  { q: "How long will my order take?", a: "Most delivery orders arrive in 30–45 minutes, depending on the dishes and traffic. Pickup orders are usually ready in 15–25 minutes. You can follow every step in the Orders tab." },
  { q: "How much is delivery?", a: `Delivery is ${formatMoney(Brand.deliveryFee)}, and free when your food comes to ${formatMoney(Brand.freeDeliveryOver)} or more. Pickup is always free. The minimum order is ${formatMoney(Brand.minOrder)}.` },
  { q: "Can I change or cancel my order?", a: "You can cancel from the order screen until the kitchen sends it out. After that, call us right away and we'll do our best to help." },
  { q: "How do points work?", a: "You earn 1 point for every ₦100 you spend. Reach 500 points for Silver and 1,500 for Gold." },
  { q: "My order is wrong or missing something", a: `We're sorry! Call ${Brand.supportPhone} or email ${Brand.supportEmail} with your order reference and we'll make it right.` },
];

export default function Support() {
  const theme = useTheme();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Container edges={["top", "bottom"]}>
      <Header title="Help & support" />
      <View style={{ paddingHorizontal: Spacing.three }}>
        <Card style={{ paddingVertical: 0 }}>
          <ListRow icon="call-outline" title="Call the kitchen" subtitle={Brand.supportPhone} onPress={() => Linking.openURL(`tel:${Brand.supportPhone.replace(/\s/g, "")}`)} />
          <ListRow icon="mail-outline" title="Email us" subtitle={Brand.supportEmail} onPress={() => Linking.openURL(`mailto:${Brand.supportEmail}`)} last />
        </Card>

        <ThemedText type="big" style={{ marginTop: Spacing.five, marginBottom: Spacing.three }}>Common questions</ThemedText>
        <View style={{ gap: Spacing.two + 2 }}>
          {faqs.map((f, i) => (
            <Card key={f.q} onPress={() => setOpen(open === i ? null : i)}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ThemedText type="smallBold" style={{ flex: 1 }}>{f.q}</ThemedText>
                <Ionicons name={open === i ? "chevron-up" : "chevron-down"} size={18} color={theme.textSecondary} />
              </View>
              {open === i && <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two, lineHeight: 21 }}>{f.a}</ThemedText>}
            </Card>
          ))}
        </View>
      </View>
    </Container>
  );
}
