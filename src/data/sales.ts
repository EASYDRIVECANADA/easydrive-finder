export type SaleStatus = "Draft" | "Pending Signature" | "Funded" | "Delivered";

export type Sale = {
  id: string;
  billOfSale: string;
  customer: string;
  vehicle: string;
  stockNumber: string;
  salePrice: number;
  taxes: number;
  fees: number;
  total: number;
  status: SaleStatus;
  date: string;
  salesperson: string;
};

export const sales: Sale[] = [
  { id: "S-001", billOfSale: "BOS-20260418-001", customer: "Noah Kim", vehicle: "2022 BMW X5 xDrive40i", stockNumber: "EDC-1047", salePrice: 62995, taxes: 8189, fees: 599, total: 71783, status: "Delivered", date: "2026-04-18", salesperson: "Jordan Pierce" },
  { id: "S-002", billOfSale: "BOS-20260417-002", customer: "James Anderson", vehicle: "2023 Ford F-150 Lariat", stockNumber: "EDC-1044", salePrice: 54995, taxes: 7149, fees: 599, total: 62743, status: "Funded", date: "2026-04-17", salesperson: "Avery Lin" },
  { id: "S-003", billOfSale: "BOS-20260416-003", customer: "Priya Sharma", vehicle: "2022 Audi Q5 Progressiv", stockNumber: "EDC-1051", salePrice: 48495, taxes: 6304, fees: 599, total: 55398, status: "Pending Signature", date: "2026-04-16", salesperson: "Jordan Pierce" },
  { id: "S-004", billOfSale: "BOS-20260415-004", customer: "Marcus Johnson", vehicle: "2021 Mazda CX-5 GT", stockNumber: "EDC-1048", salePrice: 28995, taxes: 3769, fees: 599, total: 33363, status: "Delivered", date: "2026-04-15", salesperson: "Sam Patel" },
  { id: "S-005", billOfSale: "BOS-20260414-005", customer: "Hannah Müller", vehicle: "2021 Subaru Outback Limited XT", stockNumber: "EDC-1052", salePrice: 31495, taxes: 4094, fees: 599, total: 36188, status: "Funded", date: "2026-04-14", salesperson: "Avery Lin" },
  { id: "S-006", billOfSale: "BOS-20260412-006", customer: "Ryan O'Connor", vehicle: "2023 Kia Telluride SX", stockNumber: "EDC-1053", salePrice: 53495, taxes: 6954, fees: 599, total: 61048, status: "Delivered", date: "2026-04-12", salesperson: "Jordan Pierce" },
  { id: "S-007", billOfSale: "BOS-20260411-007", customer: "Zara Ahmed", vehicle: "2023 Hyundai Tucson Ultimate Hybrid", stockNumber: "EDC-1049", salePrice: 38495, taxes: 5004, fees: 599, total: 44098, status: "Draft", date: "2026-04-11", salesperson: "Sam Patel" },
  { id: "S-008", billOfSale: "BOS-20260410-008", customer: "Caleb Bennett", vehicle: "2020 Chevrolet Silverado 1500 LT", stockNumber: "EDC-1050", salePrice: 40495, taxes: 5264, fees: 599, total: 46358, status: "Delivered", date: "2026-04-10", salesperson: "Avery Lin" },
];
