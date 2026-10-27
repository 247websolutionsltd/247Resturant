import { IconName } from "./icons";

export type NotificationType = "Orders" | "Offers" | "Account";

export type AppNotification = {
  id: string;
  title: string;
  desc: string;
  detail: string;
  icon: IconName;
  type: NotificationType;
  ts: number;
  unread: boolean;
  action?: { label: string; route: string };
};

/** Fields written to Firestore (id comes from the document). */
export type NewNotification = Omit<AppNotification, "id" | "ts" | "unread">;

export const welcomeNotifications = (firstName?: string): NewNotification[] => [
  {
    title: firstName ? `Welcome to Ember, ${firstName}` : "Welcome to Ember",
    desc: "Your first order is 20% off with code WELCOME.",
    detail:
      "Pick something hot from the menu, add code WELCOME at checkout and we'll take 20% off (up to ₦2,000). Every order earns points toward Silver and Gold perks.",
    icon: "flame",
    type: "Offers",
    action: { label: "Browse the menu", route: "/(tabs)/menu" },
  },
  {
    title: "Give ₦1,000, get ₦1,000",
    desc: "Invite friends and you both eat for less.",
    detail:
      "Share your referral code. When a friend places their first order with it, you both get ₦1,000 off your next order.",
    icon: "gift",
    type: "Offers",
    action: { label: "Invite friends", route: "/refer" },
  },
];
