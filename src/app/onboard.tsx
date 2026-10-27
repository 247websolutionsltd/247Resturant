import { Logo } from "@/components/brand";
import Button from "@/components/button";
import { RoundButton } from "@/components/header";
import OnboardingItem from "@/components/onboard";
import Paginator from "@/components/paginator";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { onboardingData } from "@/data/onboardData";
import { useAppTheme } from "@/context/PageContext";
import { useTheme } from "@/hooks/use-theme";
import { goReplace } from "@/lib/nav";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef, useState } from "react";
import { FlatList, StatusBar, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding() {
  const theme = useTheme();
  const { themeMode } = useAppTheme();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<any> | null>(null);
  const last = index === onboardingData.length - 1;

  const onViewable = useRef(({ viewableItems }: any) => {
    const next = viewableItems[0]?.index;
    if (typeof next === "number") setIndex(next);
  }).current;
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const finish = async () => {
    setBusy(true);
    try {
      await AsyncStorage.setItem("onboarded", "true");
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
    goReplace("/auth/register");
  };

  const next = () => (last ? finish() : listRef.current?.scrollToIndex({ index: index + 1 }));
  const prev = () => index > 0 && listRef.current?.scrollToIndex({ index: index - 1 });

  const skip = async () => {
    try {
      await AsyncStorage.setItem("onboarded", "true");
    } catch {}
    goReplace("/auth/logIn");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["top", "bottom"]}>
      <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.four, paddingTop: Spacing.two }}>
        <Logo size={34} />
        <TouchableOpacity onPress={skip} hitSlop={12}>
          <ThemedText type="smallBold" themeColor="textSecondary">I have an account</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={onboardingData}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <OnboardingItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={viewConfig}
      />

      <View style={{ paddingHorizontal: Spacing.four, paddingBottom: Spacing.three }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Paginator count={onboardingData.length} currentIndex={index} />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {index > 0 && (
              <View style={{ marginRight: Spacing.two }}>
                <RoundButton icon="chevron-back" size={52} onPress={prev} label="Previous" />
              </View>
            )}
            <Button
              title={last ? "Let's eat" : "Next"}
              icon={last ? undefined : "arrow-forward"}
              onPress={next}
              loading={busy}
              style={{ minWidth: 150 }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
