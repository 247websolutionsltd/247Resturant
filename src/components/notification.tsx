import { Radius, Spacing } from "@/constants/theme";
import { IconName } from "@/data/icons";
import { useTheme } from "@/hooks/use-theme";
import { TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";
import { IconBadge } from "./ui";

export default function NotificationCard({
  icon,
  title,
  desc,
  time,
  unread,
  onPress,
}: {
  icon: IconName;
  title: string;
  desc: string;
  time: string;
  unread?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.three,
        borderRadius: Radius.md,
        backgroundColor: unread ? theme.accentSurface : theme.card,
        borderWidth: 1.5,
        borderColor: unread ? theme.accent : theme.line,
        marginBottom: Spacing.two + 2,
      }}
    >
      <IconBadge icon={icon} size={44} />
      <View style={{ flex: 1, marginLeft: Spacing.three }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <ThemedText type="smallBold" style={{ flex: 1 }} numberOfLines={1}>
            {title}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary" style={{ marginLeft: Spacing.two }}>
            {time}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2} style={{ marginTop: 2 }}>
          {desc}
        </ThemedText>
      </View>
      {unread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent, marginLeft: Spacing.two }} />}
    </TouchableOpacity>
  );
}
