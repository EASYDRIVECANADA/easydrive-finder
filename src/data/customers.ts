export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  vehiclesPurchased: number;
  lifetimeValue: number;
  lastPurchase: string;
};

export const customers: Customer[] = [
  { id: "C-001", name: "Noah Kim", email: "noah.k@example.com", phone: "(437) 555-0166", city: "Toronto", vehiclesPurchased: 2, lifetimeValue: 89400, lastPurchase: "2026-04-16" },
  { id: "C-002", name: "James Anderson", email: "james.a@example.com", phone: "(416) 555-0166", city: "Mississauga", vehiclesPurchased: 1, lifetimeValue: 54995, lastPurchase: "2026-04-11" },
  { id: "C-003", name: "Priya Sharma", email: "priya.s@example.com", phone: "(905) 555-0144", city: "Brampton", vehiclesPurchased: 3, lifetimeValue: 132500, lastPurchase: "2026-03-22" },
  { id: "C-004", name: "Daniel Thompson", email: "daniel.t@example.com", phone: "(647) 555-0111", city: "Toronto", vehiclesPurchased: 1, lifetimeValue: 28995, lastPurchase: "2026-02-14" },
  { id: "C-005", name: "Grace Liu", email: "grace.l@example.com", phone: "(416) 555-0188", city: "North York", vehiclesPurchased: 2, lifetimeValue: 76400, lastPurchase: "2026-01-28" },
  { id: "C-006", name: "Marcus Johnson", email: "marcus.j@example.com", phone: "(905) 555-0199", city: "Oakville", vehiclesPurchased: 1, lifetimeValue: 62995, lastPurchase: "2025-12-19" },
  { id: "C-007", name: "Hannah Müller", email: "hannah.m@example.com", phone: "(289) 555-0122", city: "Hamilton", vehiclesPurchased: 1, lifetimeValue: 31495, lastPurchase: "2025-11-30" },
  { id: "C-008", name: "Ryan O'Connor", email: "ryan.oc@example.com", phone: "(416) 555-0144", city: "Toronto", vehiclesPurchased: 2, lifetimeValue: 84900, lastPurchase: "2025-10-15" },
  { id: "C-009", name: "Zara Ahmed", email: "zara.a@example.com", phone: "(647) 555-0177", city: "Markham", vehiclesPurchased: 1, lifetimeValue: 38495, lastPurchase: "2025-09-08" },
  { id: "C-010", name: "Caleb Bennett", email: "caleb.b@example.com", phone: "(905) 555-0166", city: "Burlington", vehiclesPurchased: 1, lifetimeValue: 40495, lastPurchase: "2025-08-22" },
];
