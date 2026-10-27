# Ember Kitchen: rebrand notes

Drop the `src/` folder into your existing Expo project (replace the old `src/`). No new dependencies.
Same stack as before: Expo Router, Firebase Auth + Firestore, AsyncStorage, Google sign-in.

## What changed
- Brand: Verdi (fintech) -> Ember Kitchen (restaurant). Edit `src/constants/brand.ts`.
- Theme: red + cream, light-first, dark mode kept. Edit `src/constants/theme.ts`.
- Style: serif headlines, squarer corners, chunky "sticker" buttons, shop-awning auth screens, emoji "food photos".
- New flow: Home -> Menu -> Item (size/add-ons/notes) -> Basket (promo codes) -> Checkout (delivery/pickup, address, payment) -> live order tracking.
- Tabs: Home, Menu, Basket, Orders, Me. Also Favourites, Saved addresses, Branches, Refer, Help.
- Removed: wallet, transfers, cards, savings, bills, PIN screens.

## Firestore (per user)
users/{uid}: profile, points, favorites[]; subcollections orders, addresses, notifications.
Old wallet data (transactions/goals/beneficiaries) is not read any more.

## Before launch
1. `src/services/payments.ts`: stand-in only. No money moves. Plug in Paystack/Flutterwave.
2. Order status is simulated from time (`Brand.simulateKitchen`). Set false once a kitchen backend writes `status`.
3. Prices are computed on the client. Enforce them with Firestore rules / a Cloud Function, and lock `points` writes.
4. Menu lives in `src/data/menu.ts`; promos in `src/data/promos.ts`; branches in `src/data/branches.ts`.
5. Referral rewards (code only) and the "Apple" / biometric buttons: the old ones were non-functional and are removed.
