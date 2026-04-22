export type Role = "Owner" | "Manager" | "Sales" | "Finance" | "Service";

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  joined: string;
};

export const employees: Employee[] = [
  { id: "E-001", name: "Marcus Reilly", email: "marcus@edc.com", phone: "(416) 555-0100", role: "Owner", active: true, joined: "2019-06-01" },
  { id: "E-002", name: "Jordan Pierce", email: "jordan@edc.com", phone: "(416) 555-0101", role: "Sales", active: true, joined: "2021-03-15" },
  { id: "E-003", name: "Avery Lin", email: "avery@edc.com", phone: "(416) 555-0102", role: "Sales", active: true, joined: "2022-08-22" },
  { id: "E-004", name: "Sam Patel", email: "sam@edc.com", phone: "(416) 555-0103", role: "Finance", active: true, joined: "2020-11-10" },
  { id: "E-005", name: "Riley Brooks", email: "riley@edc.com", phone: "(416) 555-0104", role: "Manager", active: true, joined: "2020-02-18" },
];
