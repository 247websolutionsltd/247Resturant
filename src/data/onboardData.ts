export type Slide = {
  id: string;
  kind: "menu" | "order" | "track";
  eyebrow: string;
  title: string;
  description: string;
};

export const onboardingData: Slide[] = [
  {
    id: "1",
    kind: "menu",
    eyebrow: "Browse",
    title: "Naija's favourites, cooked fresh",
    description: "Party jollof, smoky suya, egusi and more. Every dish is made to order by our kitchen the moment you ask.",
  },
  {
    id: "2",
    kind: "order",
    eyebrow: "Order",
    title: "Make it yours in a few taps",
    description: "Pick your size, add extras, save your favourites and use promo codes. Delivery to your door or pickup from a branch near you.",
  },
  {
    id: "3",
    kind: "track",
    eyebrow: "Track",
    title: "Watch it go from pan to door",
    description: "Follow your order live from the kitchen to your doorstep, and collect points on every meal toward Silver and Gold perks.",
  },
];
