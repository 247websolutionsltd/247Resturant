import Container from "@/components/custom-container";
import { MenuRow } from "@/components/food";
import Header from "@/components/header";
import Button from "@/components/button";
import { EmptyState, Card } from "@/components/ui";
import { Spacing } from "@/constants/theme";
import { useOrders } from "@/context/OrdersContext";
import { MENU } from "@/data/menu";
import { go } from "@/lib/nav";
import { View } from "react-native";

export default function Favorites() {
  const { favorites } = useOrders();
  const items = MENU.filter((m) => favorites.includes(m.id));

  return (
    <Container edges={["top", "bottom"]}>
      <Header title="Favourites" />
      <View style={{ paddingHorizontal: Spacing.three }}>
        {items.length === 0 ? (
          <EmptyState emoji="💛" title="No favourites yet" text="Tap the heart on any dish and it'll be saved here for one-tap ordering.">
            <Button title="Browse the menu" onPress={() => go("/(tabs)/menu")} />
          </EmptyState>
        ) : (
          <Card style={{ paddingVertical: 0 }}>
            {items.map((m, i) => (
              <MenuRow key={m.id} item={m} last={i === items.length - 1} />
            ))}
          </Card>
        )}
      </View>
    </Container>
  );
}
