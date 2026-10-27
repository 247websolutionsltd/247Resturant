/**
 * The Ember menu. It lives in the app so it works offline and prices are never ambiguous.
 * To drive it from Firestore later, keep the same `MenuItem` shape and swap `MENU` for a subscription.
 */

export type CategoryId =
  | "rice"
  | "soups"
  | "grills"
  | "burgers"
  | "small"
  | "sides"
  | "drinks"
  | "desserts";

export type Category = { id: CategoryId; label: string; emoji: string; tint: string };

export const CATEGORIES: Category[] = [
  { id: "rice", label: "Rice & Mains", emoji: "🍛", tint: "#FFE3D1" },
  { id: "soups", label: "Soups & Swallow", emoji: "🍲", tint: "#FFE8B8" },
  { id: "grills", label: "Grills & Suya", emoji: "🍢", tint: "#FFD6D0" },
  { id: "burgers", label: "Burgers & Wraps", emoji: "🍔", tint: "#FBE4B5" },
  { id: "small", label: "Small Chops", emoji: "🥟", tint: "#F9DDEB" },
  { id: "sides", label: "Sides", emoji: "🍌", tint: "#FFF1B8" },
  { id: "drinks", label: "Drinks", emoji: "🍹", tint: "#D9F0E4" },
  { id: "desserts", label: "Desserts", emoji: "🍨", tint: "#E8E0F7" },
];

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

export type Tag = "popular" | "spicy" | "new" | "veg" | "chef";

export type SizeOption = { id: string; label: string; extra: number };
export type AddOn = { id: string; label: string; price: number };

export type MenuItem = {
  id: string;
  name: string;
  desc: string;
  price: number;
  cat: CategoryId;
  emoji: string;
  rating: number;
  reviews: number;
  /** minutes to prepare */
  prep: number;
  tags: Tag[];
  sizes?: SizeOption[];
  addOns?: AddOn[];
};

/* ----------------------------- option presets ----------------------------- */

const MAIN_SIZES: SizeOption[] = [
  { id: "reg", label: "Regular", extra: 0 },
  { id: "lrg", label: "Large", extra: 1500 },
];
const DRINK_SIZES: SizeOption[] = [
  { id: "reg", label: "Regular", extra: 0 },
  { id: "lrg", label: "Large", extra: 500 },
];
const MAIN_ADDONS: AddOn[] = [
  { id: "chicken", label: "Extra chicken", price: 1800 },
  { id: "plantain", label: "Fried plantain", price: 700 },
  { id: "moimoi", label: "Moi moi", price: 900 },
  { id: "pepper", label: "Extra pepper sauce", price: 300 },
];
const SOUP_ADDONS: AddOn[] = [
  { id: "meat", label: "Extra assorted meat", price: 1500 },
  { id: "fish", label: "Smoked fish", price: 1200 },
  { id: "swallow", label: "Extra swallow", price: 800 },
];
const GRILL_ADDONS: AddOn[] = [
  { id: "yaji", label: "Extra yaji spice", price: 200 },
  { id: "onions", label: "Onions & tomatoes", price: 300 },
  { id: "bread", label: "Side of bread", price: 400 },
];
const BURGER_ADDONS: AddOn[] = [
  { id: "cheese", label: "Extra cheese", price: 500 },
  { id: "bacon", label: "Beef bacon", price: 900 },
  { id: "fries", label: "Fries", price: 1200 },
];

export const MENU: MenuItem[] = [
  /* ------------------------------ rice & mains ----------------------------- */
  {
    id: "jollof-chicken",
    name: "Party Jollof & Chicken",
    desc: "Smoky party-style jollof rice with a crisp-grilled chicken quarter and sweet fried plantain.",
    price: 5500,
    cat: "rice",
    emoji: "🍛",
    rating: 4.9,
    reviews: 1284,
    prep: 20,
    tags: ["popular", "chef"],
    sizes: MAIN_SIZES,
    addOns: MAIN_ADDONS,
  },
  {
    id: "fried-rice-turkey",
    name: "Fried Rice & Turkey",
    desc: "Veggie-packed fried rice, peppered turkey wing and a spoon of house coleslaw.",
    price: 6200,
    cat: "rice",
    emoji: "🍚",
    rating: 4.7,
    reviews: 642,
    prep: 22,
    tags: ["popular"],
    sizes: MAIN_SIZES,
    addOns: MAIN_ADDONS,
  },
  {
    id: "ofada-ayamase",
    name: "Ofada Rice & Ayamase",
    desc: "Aromatic local ofada rice with fiery green-pepper ayamase stew, ponmo and boiled egg.",
    price: 6800,
    cat: "rice",
    emoji: "🥘",
    rating: 4.8,
    reviews: 410,
    prep: 25,
    tags: ["spicy", "chef"],
    sizes: MAIN_SIZES,
    addOns: MAIN_ADDONS,
  },
  {
    id: "coconut-rice",
    name: "Coconut Rice & Fish",
    desc: "Creamy coconut rice with golden pan-fried croaker and a tangy pepper dip.",
    price: 6500,
    cat: "rice",
    emoji: "🐟",
    rating: 4.6,
    reviews: 233,
    prep: 24,
    tags: ["new"],
    sizes: MAIN_SIZES,
    addOns: MAIN_ADDONS,
  },
  /* ----------------------------- soups & swallow --------------------------- */
  {
    id: "egusi-pounded",
    name: "Egusi & Pounded Yam",
    desc: "Rich melon-seed soup loaded with assorted meat and stockfish, served with smooth pounded yam.",
    price: 7500,
    cat: "soups",
    emoji: "🍲",
    rating: 4.9,
    reviews: 958,
    prep: 25,
    tags: ["popular", "chef"],
    addOns: SOUP_ADDONS,
  },
  {
    id: "efo-amala",
    name: "Efo Riro & Amala",
    desc: "Silky spinach stew cooked down with locust beans and smoked fish, with soft amala.",
    price: 6500,
    cat: "soups",
    emoji: "🥬",
    rating: 4.7,
    reviews: 377,
    prep: 25,
    tags: [],
    addOns: SOUP_ADDONS,
  },
  {
    id: "oha-fufu",
    name: "Oha Soup & Fufu",
    desc: "Traditional oha leaf soup thickened with cocoyam, beef and dried fish, with fufu.",
    price: 7000,
    cat: "soups",
    emoji: "🥣",
    rating: 4.6,
    reviews: 189,
    prep: 28,
    tags: ["new"],
    addOns: SOUP_ADDONS,
  },
  {
    id: "goat-pepper-soup",
    name: "Goat Meat Pepper Soup",
    desc: "A peppery, spice-forward broth with tender goat meat. Warms you up from the inside.",
    price: 5800,
    cat: "soups",
    emoji: "🌶️",
    rating: 4.8,
    reviews: 520,
    prep: 20,
    tags: ["spicy", "popular"],
  },
  /* ------------------------------ grills & suya ---------------------------- */
  {
    id: "beef-suya",
    name: "Beef Suya Platter",
    desc: "Thin-sliced beef rubbed in yaji and charred over open flame. Served with onions and tomato.",
    price: 4500,
    cat: "grills",
    emoji: "🍢",
    rating: 4.9,
    reviews: 1530,
    prep: 15,
    tags: ["popular", "spicy"],
    sizes: [
      { id: "reg", label: "Regular", extra: 0 },
      { id: "lrg", label: "Sharing", extra: 3000 },
    ],
    addOns: GRILL_ADDONS,
  },
  {
    id: "asun",
    name: "Peppered Asun",
    desc: "Smoky grilled goat chopped and tossed in a sharp scotch-bonnet pepper sauce.",
    price: 5200,
    cat: "grills",
    emoji: "🔥",
    rating: 4.7,
    reviews: 604,
    prep: 18,
    tags: ["spicy"],
    addOns: GRILL_ADDONS,
  },
  {
    id: "bbq-wings",
    name: "BBQ Chicken Wings",
    desc: "Eight wings glazed in sticky smoked-barbecue sauce, grilled until they blister.",
    price: 4800,
    cat: "grills",
    emoji: "🍗",
    rating: 4.6,
    reviews: 861,
    prep: 18,
    tags: ["popular"],
    addOns: GRILL_ADDONS,
  },
  {
    id: "grilled-croaker",
    name: "Grilled Croaker",
    desc: "Whole croaker marinated in herbs and pepper, grilled and served with spicy ata dindin.",
    price: 8500,
    cat: "grills",
    emoji: "🐠",
    rating: 4.8,
    reviews: 276,
    prep: 30,
    tags: ["chef"],
    addOns: GRILL_ADDONS,
  },
  /* ----------------------------- burgers & wraps --------------------------- */
  {
    id: "smash-burger",
    name: "Ember Smash Burger",
    desc: "Two smashed beef patties, melted cheddar, pickles and our house ember sauce on a toasted bun.",
    price: 5800,
    cat: "burgers",
    emoji: "🍔",
    rating: 4.8,
    reviews: 1102,
    prep: 15,
    tags: ["popular"],
    addOns: BURGER_ADDONS,
  },
  {
    id: "chicken-wrap",
    name: "Spicy Chicken Wrap",
    desc: "Crispy chicken, slaw and suya mayo rolled in a warm flatbread.",
    price: 4200,
    cat: "burgers",
    emoji: "🌯",
    rating: 4.5,
    reviews: 340,
    prep: 12,
    tags: ["spicy"],
    addOns: BURGER_ADDONS,
  },
  {
    id: "shawarma",
    name: "Beef Shawarma",
    desc: "Slow-roasted beef ribbons, garlic sauce, cabbage and sausage in a toasted wrap.",
    price: 3800,
    cat: "burgers",
    emoji: "🥙",
    rating: 4.7,
    reviews: 975,
    prep: 12,
    tags: ["popular"],
    addOns: BURGER_ADDONS,
  },
  {
    id: "veggie-burger",
    name: "Garden Veggie Burger",
    desc: "A chickpea and sweet-potato patty with avocado, tomato and lime yoghurt.",
    price: 4900,
    cat: "burgers",
    emoji: "🥗",
    rating: 4.4,
    reviews: 98,
    prep: 14,
    tags: ["veg", "new"],
    addOns: BURGER_ADDONS,
  },
  /* ------------------------------- small chops ----------------------------- */
  {
    id: "puff-puff",
    name: "Puff Puff (10)",
    desc: "Pillowy, golden, lightly sweet dough balls, fried to order.",
    price: 1800,
    cat: "small",
    emoji: "🍩",
    rating: 4.8,
    reviews: 703,
    prep: 10,
    tags: ["veg", "popular"],
  },
  {
    id: "spring-rolls",
    name: "Spring Rolls (6)",
    desc: "Crisp rolls filled with chicken and vegetables, with sweet chilli dip.",
    price: 2400,
    cat: "small",
    emoji: "🥟",
    rating: 4.5,
    reviews: 288,
    prep: 10,
    tags: [],
  },
  {
    id: "samosa",
    name: "Beef Samosa (6)",
    desc: "Flaky pastry parcels stuffed with spiced minced beef and peas.",
    price: 2600,
    cat: "small",
    emoji: "🥠",
    rating: 4.6,
    reviews: 251,
    prep: 10,
    tags: [],
  },
  {
    id: "peppered-snail",
    name: "Peppered Snail",
    desc: "Juicy snails sautéed in a fiery tomato-pepper sauce. For the adventurous.",
    price: 4600,
    cat: "small",
    emoji: "🐌",
    rating: 4.3,
    reviews: 87,
    prep: 14,
    tags: ["spicy", "chef"],
  },
  /* ---------------------------------- sides -------------------------------- */
  {
    id: "dodo",
    name: "Fried Plantain (Dodo)",
    desc: "Ripe plantain, fried until caramelised at the edges.",
    price: 1200,
    cat: "sides",
    emoji: "🍌",
    rating: 4.9,
    reviews: 1340,
    prep: 8,
    tags: ["veg", "popular"],
  },
  {
    id: "moi-moi",
    name: "Moi Moi",
    desc: "Steamed bean pudding with egg and fish. Soft, savoury and filling.",
    price: 1500,
    cat: "sides",
    emoji: "🫘",
    rating: 4.6,
    reviews: 412,
    prep: 8,
    tags: [],
  },
  {
    id: "coleslaw",
    name: "House Coleslaw",
    desc: "Crunchy cabbage, carrot and sweetcorn in a light creamy dressing.",
    price: 900,
    cat: "sides",
    emoji: "🥗",
    rating: 4.2,
    reviews: 120,
    prep: 5,
    tags: ["veg"],
  },
  /* --------------------------------- drinks -------------------------------- */
  {
    id: "chapman",
    name: "Chapman",
    desc: "Nigeria's favourite fizzy fruit cocktail, non-alcoholic, with cucumber and orange.",
    price: 2200,
    cat: "drinks",
    emoji: "🍹",
    rating: 4.9,
    reviews: 1620,
    prep: 5,
    tags: ["popular"],
    sizes: DRINK_SIZES,
  },
  {
    id: "zobo",
    name: "Zobo",
    desc: "Chilled hibiscus drink steeped with ginger, cloves and pineapple.",
    price: 1500,
    cat: "drinks",
    emoji: "🧃",
    rating: 4.7,
    reviews: 545,
    prep: 5,
    tags: ["veg"],
    sizes: DRINK_SIZES,
  },
  {
    id: "orange-juice",
    name: "Fresh Orange Juice",
    desc: "Squeezed to order. Nothing added.",
    price: 1800,
    cat: "drinks",
    emoji: "🍊",
    rating: 4.6,
    reviews: 218,
    prep: 6,
    tags: ["veg"],
    sizes: DRINK_SIZES,
  },
  {
    id: "malt",
    name: "Cold Malt",
    desc: "Ice-cold malt drink in a bottle.",
    price: 900,
    cat: "drinks",
    emoji: "🥤",
    rating: 4.4,
    reviews: 150,
    prep: 2,
    tags: [],
  },
  /* -------------------------------- desserts ------------------------------- */
  {
    id: "chin-chin",
    name: "Chin Chin Cup",
    desc: "Crunchy, buttery fried pastry bites with a hint of nutmeg.",
    price: 1500,
    cat: "desserts",
    emoji: "🍪",
    rating: 4.7,
    reviews: 330,
    prep: 3,
    tags: ["veg"],
  },
  {
    id: "ice-cream",
    name: "Vanilla Ice Cream",
    desc: "Two scoops of creamy vanilla with a caramel drizzle.",
    price: 2300,
    cat: "desserts",
    emoji: "🍨",
    rating: 4.6,
    reviews: 270,
    prep: 4,
    tags: ["veg"],
  },
  {
    id: "red-velvet",
    name: "Red Velvet Slice",
    desc: "Moist red velvet layered with cream-cheese frosting.",
    price: 3200,
    cat: "desserts",
    emoji: "🍰",
    rating: 4.9,
    reviews: 512,
    prep: 4,
    tags: ["veg", "chef"],
  },
];

export const itemById = (id: string) => MENU.find((m) => m.id === id);

export const TAG_LABEL: Record<Tag, string> = {
  popular: "Popular",
  spicy: "Spicy",
  new: "New",
  veg: "Vegetarian",
  chef: "Chef's pick",
};
