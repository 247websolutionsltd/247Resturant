import Button from "@/components/button";
import Container from "@/components/custom-container";
import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Card, IconBadge, Sprinkles } from "@/components/ui";
import { Brand } from "@/constants/brand";
import { Colors, Radius, SerifFont, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/PageContext";
import { IconName } from "@/data/icons";
import { Share, Text, View } from "react-native";

const steps: { icon: IconName; title: string; text: string }[] = [
  { icon: "paper-plane", title: "Share your code", text: "Send your referral code to friends and family." },
  { icon: "person-add", title: "They sign up", text: `They join ${Brand.name} and place their first order.` },
  { icon: "pricetag", title: "You both save ₦1,000", text: "Taken off your next order once theirs is delivered." },
];

export default function Refer() {
  const { owner } = useAuth();
  const share = () =>
    Share.share({ message: `Hungry? Join me on ${Brand.fullName}. Use my code ${owner.referralCode} and we both get ₦1,000 off.` });

  return (
    <Container edges={["top", "bottom"]}>
      <Header title="Refer & earn" />
      <View style={{ paddingHorizontal: Spacing.three }}>
        <View style={{ backgroundColor: Colors.hero, borderRadius: Radius.xl, padding: Spacing.four, overflow: "hidden", alignItems: "center", borderBottomWidth: 5, borderBottomColor: Colors.heroDeep }}>
          <Sprinkles opacity={0.14} />
          <Text style={{ fontSize: 56 }}>🎁</Text>
          <Text style={{ fontFamily: SerifFont, color: "#FFF8F0", fontSize: 32, lineHeight: 38, fontWeight: "800", letterSpacing: -0.6, textAlign: "center", marginTop: Spacing.two }}>
            Give ₦1,000,{"\n"}get ₦1,000
          </Text>
          <View style={{ marginTop: Spacing.four, borderWidth: 2, borderStyle: "dashed", borderColor: "rgba(255,255,255,0.6)", borderRadius: Radius.md, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, backgroundColor: "rgba(0,0,0,0.12)" }}>
            <ThemedText type="label" style={{ color: Colors.heroMuted, textAlign: "center" }}>Your code</ThemedText>
            <ThemedText style={{ color: "#FFF8F0", fontFamily: SerifFont, fontSize: 30, fontWeight: "800", letterSpacing: 4, textAlign: "center" }}>{owner.referralCode || "–"}</ThemedText>
          </View>
        </View>

        <Card style={{ marginTop: Spacing.four }}>
          {steps.map((s, i) => (
            <View key={s.title} style={{ flexDirection: "row", alignItems: "center", paddingVertical: Spacing.two + 2 }}>
              <IconBadge icon={s.icon} />
              <View style={{ flex: 1, marginLeft: Spacing.three }}>
                <ThemedText type="smallBold">{i + 1}. {s.title}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary" style={{ marginTop: 2 }}>{s.text}</ThemedText>
              </View>
            </View>
          ))}
        </Card>

        <Button title="Invite friends" iconLeft="share-social" onPress={share} style={{ marginTop: Spacing.four }} />
      </View>
    </Container>
  );
}
