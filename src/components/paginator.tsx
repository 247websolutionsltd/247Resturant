import { useTheme } from "@/hooks/use-theme";
import { View } from "react-native";

export default function Paginator({ count, currentIndex }: { count: number; currentIndex: number }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 8,
            width: currentIndex === i ? 30 : 8,
            borderRadius: 4,
            marginRight: 6,
            backgroundColor: currentIndex === i ? theme.cta : theme.controlOff,
          }}
        />
      ))}
    </View>
  );
}
