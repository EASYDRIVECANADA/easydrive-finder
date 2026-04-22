export type Vendor = {
  id: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  outstanding: number;
};

export const vendors: Vendor[] = [
  { id: "V-001", name: "Apex Auto Detailing", category: "Detailing", contact: "Tom Hayes", phone: "(416) 555-0211", email: "tom@apexdetail.com", outstanding: 1250 },
  { id: "V-002", name: "Northbridge Insurance", category: "Insurance", contact: "Karen Wu", phone: "(905) 555-0233", email: "karen@northbridge.ca", outstanding: 0 },
  { id: "V-003", name: "GTA Reconditioning", category: "Mechanical", contact: "Mike Soto", phone: "(647) 555-0244", email: "mike@gtarecon.com", outstanding: 4820 },
  { id: "V-004", name: "AutoTrader Canada", category: "Marketing", contact: "Lisa Park", phone: "(416) 555-0255", email: "lisa@autotrader.ca", outstanding: 899 },
  { id: "V-005", name: "Carfax Canada", category: "Reports", contact: "Dev Sharma", phone: "(416) 555-0266", email: "dev@carfax.ca", outstanding: 320 },
  { id: "V-006", name: "Premier Towing Co.", category: "Logistics", contact: "Frank Bell", phone: "(905) 555-0277", email: "frank@premiertow.ca", outstanding: 0 },
];
