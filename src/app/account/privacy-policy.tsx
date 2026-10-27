import Container from "@/components/custom-container";
import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Brand } from "@/constants/brand";
import { Spacing } from "@/constants/theme";
import { View } from "react-native";

const sections = [
  { t: "Information we collect", b: "We collect the details you give us (name, phone, email, delivery addresses) and how you use the app, such as your orders and favourites, so we can cook, deliver and improve." },
  { t: "How we use it", b: "To prepare and deliver your orders, contact you about them, prevent fraud, run promotions and loyalty points, and make the menu better. We never sell your personal data." },
  { t: "Who sees it", b: "Our kitchen and delivery riders see only what they need to complete your order: your name, items, address and phone number." },
  { t: "Your choices", b: `You can update your details or delete saved addresses in the app at any time, or contact ${Brand.supportEmail} to request a copy of your data or close your account.` },
];

export default function Privacy() {
  return (
    <Container edges={["top", "bottom"]}>
      <Header title="Privacy policy" />
      <View style={{ paddingHorizontal: Spacing.three }}>
        <ThemedText themeColor="textSecondary" style={{ lineHeight: 24 }}>
          At {Brand.fullName}, we only use your information to get great food to you. Here's a plain-English summary of how we handle it.
        </ThemedText>
        {sections.map((s) => (
          <View key={s.t} style={{ marginTop: Spacing.four }}>
            <ThemedText type="big">{s.t}</ThemedText>
            <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.two, lineHeight: 24 }}>{s.b}</ThemedText>
          </View>
        ))}
        <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: Spacing.five }}>
          Placeholder text. Replace with your legal team's policy before launch.
        </ThemedText>
      </View>
    </Container>
  );
}
