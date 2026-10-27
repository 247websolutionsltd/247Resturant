export type Branch = {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  /** Typical wait for a pickup order, in minutes. */
  pickupMins: number;
};

export const BRANCHES: Branch[] = [
  { id: "lekki", name: "Ember · Lekki Phase 1", address: "14 Admiralty Way, Lekki Phase 1, Lagos", hours: "10:00 – 23:00 daily", phone: "+234 800 363 7423", pickupMins: 20 },
  { id: "vi", name: "Ember · Victoria Island", address: "27 Akin Adesola Street, Victoria Island, Lagos", hours: "10:00 – 00:00 daily", phone: "+234 800 363 7424", pickupMins: 15 },
  { id: "ikeja", name: "Ember · Ikeja GRA", address: "5 Isaac John Street, Ikeja GRA, Lagos", hours: "10:00 – 22:00 daily", phone: "+234 800 363 7425", pickupMins: 20 },
];

export const branchById = (id: string) => BRANCHES.find((b) => b.id === id);
