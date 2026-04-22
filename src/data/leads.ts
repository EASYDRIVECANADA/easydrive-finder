export type LeadStatus = "New" | "Contacted" | "Qualified" | "Test Drive" | "Won" | "Lost";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleInterest: string;
  status: LeadStatus;
  source: string;
  date: string;
  notes: string;
};

export const leads: Lead[] = [
  { id: "L-001", name: "Aiden Carter", email: "aiden.c@example.com", phone: "(416) 555-0142", vehicleInterest: "2022 Toyota RAV4", status: "Qualified", source: "Website", date: "2026-04-18", notes: "Looking for AWD with sunroof. Pre-approved." },
  { id: "L-002", name: "Sophia Patel", email: "sophia.p@example.com", phone: "(647) 555-0188", vehicleInterest: "2023 Hyundai Tucson", status: "Test Drive", source: "Facebook", date: "2026-04-19", notes: "Booked test drive Saturday 2pm." },
  { id: "L-003", name: "Liam O'Brien", email: "liam.ob@example.com", phone: "(905) 555-0177", vehicleInterest: "2023 Ford F-150", status: "New", source: "AutoTrader", date: "2026-04-21", notes: "" },
  { id: "L-004", name: "Emma Wilson", email: "emma.w@example.com", phone: "(416) 555-0123", vehicleInterest: "2020 Tesla Model 3", status: "Contacted", source: "Referral", date: "2026-04-20", notes: "Wants to trade in 2017 Civic." },
  { id: "L-005", name: "Noah Kim", email: "noah.k@example.com", phone: "(437) 555-0166", vehicleInterest: "2022 BMW X5", status: "Won", source: "Website", date: "2026-04-15", notes: "Deal closed. Delivery Friday." },
  { id: "L-006", name: "Olivia Tremblay", email: "olivia.t@example.com", phone: "(514) 555-0199", vehicleInterest: "2021 Honda Civic", status: "Qualified", source: "Kijiji", date: "2026-04-17", notes: "First-time buyer." },
  { id: "L-007", name: "Ethan Singh", email: "ethan.s@example.com", phone: "(289) 555-0144", vehicleInterest: "2019 Jeep Wrangler", status: "Lost", source: "Walk-in", date: "2026-04-12", notes: "Bought elsewhere." },
  { id: "L-008", name: "Ava Martinez", email: "ava.m@example.com", phone: "(416) 555-0155", vehicleInterest: "2023 Kia Telluride", status: "New", source: "Website", date: "2026-04-21", notes: "" },
  { id: "L-009", name: "Lucas Brown", email: "lucas.b@example.com", phone: "(647) 555-0133", vehicleInterest: "2022 Audi Q5", status: "Test Drive", source: "Instagram", date: "2026-04-19", notes: "Waiting on bank approval." },
  { id: "L-010", name: "Mia Chen", email: "mia.c@example.com", phone: "(416) 555-0177", vehicleInterest: "2021 Mazda CX-5", status: "Contacted", source: "AutoTrader", date: "2026-04-20", notes: "" },
  { id: "L-011", name: "Mason Lee", email: "mason.l@example.com", phone: "(905) 555-0188", vehicleInterest: "2020 Chevrolet Silverado", status: "Qualified", source: "Website", date: "2026-04-18", notes: "Cash buyer." },
  { id: "L-012", name: "Charlotte Dubois", email: "charlotte.d@example.com", phone: "(514) 555-0122", vehicleInterest: "2021 Subaru Outback", status: "New", source: "Referral", date: "2026-04-21", notes: "" },
  { id: "L-013", name: "James Anderson", email: "james.a@example.com", phone: "(416) 555-0166", vehicleInterest: "2023 Ford F-150", status: "Won", source: "Website", date: "2026-04-10", notes: "Delivered." },
  { id: "L-014", name: "Isabella Rossi", email: "isabella.r@example.com", phone: "(647) 555-0199", vehicleInterest: "2022 Toyota RAV4", status: "Contacted", source: "Facebook", date: "2026-04-19", notes: "Comparing with CR-V." },
  { id: "L-015", name: "Benjamin Wright", email: "benjamin.w@example.com", phone: "(289) 555-0177", vehicleInterest: "2020 Tesla Model 3", status: "New", source: "Kijiji", date: "2026-04-21", notes: "" },
];
