/**
 * Single source of truth for the brand and the business rules of the restaurant.
 * Rename the app here and every screen follows.
 */
export const Brand = {
  name: "Ember",
  fullName: "Ember Kitchen",
  tagline: "Hot, fresh, at your door.",
  supportEmail: "hello@emberkitchen.app",
  supportPhone: "+234 800 363 7423",
  currency: "₦",

  /** Delivery fee in naira. Free above `freeDeliveryOver`. */
  deliveryFee: 800,
  freeDeliveryOver: 20000,
  minOrder: 2000,

  /** 1 point for every ₦100 spent. */
  pointsPerNaira: 1 / 100,
  /** Loyalty tiers, by lifetime points. */
  tiers: [
    { name: "Bronze", min: 0 },
    { name: "Silver", min: 500 },
    { name: "Gold", min: 1500 },
  ],

  /**
   * Until a kitchen dashboard / backend updates `status` on order documents, the app
   * simulates progress from the order time so the tracking screen is demo-able.
   * Set `simulateKitchen` to false once a real backend writes the status.
   * Timings are seconds after the order is placed.
   */
  simulateKitchen: true,
  simulation: { preparingAfter: 20, readyAfter: 150, dispatchAfter: 150, doneAfter: 330 },
} as const;
