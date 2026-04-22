// Frontend-only order store (localStorage). No backend.
import type { ListingType, Vehicle } from "@/data/vehicles";

// ── BridgeWarranty selections persisted on the order ─────────────
export type WarrantySelection = {
  planSlug: string;
  planName: string;
  perClaimAmount: number;
  deductible: number;
  termMonths: number;
  termKm: string;
  termLabel: string;
  basePrice: number;
  addOns: string[];          // labels (e.g. "Unlimited km")
  addOnTotal: number;
  premiumVehicleFee: number;
  total: number;
  contractNumber: string;
  termsAcknowledgedAt: string | null;
};

export type TireRimSelection = {
  tierSlug: string;
  tierName: string;
  vehicleClass: 1 | 2 | 3;
  termLabel: string;
  termMonths: number;
  total: number;
  contractNumber: string;
};

export type OrderStatus =
  | "deposit_pending"
  | "deposit_confirmed"
  | "awaiting_full_payment"
  | "ready_for_delivery"
  | "picked_up"
  | "cancelled";

export type CustomerInfo = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  province: string;
  postalCode: string;
  dob: string;
};

export function fullName(c: CustomerInfo): string {
  return [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ");
}

export type FileRef = {
  name: string;
  size: number;
  type: string;
  dataUrl: string | null;
  uploadedAt: string;
};

export type SignatureRecord = {
  typedName: string;
  drawnDataUrl: string;
  signedAt: string;
};

export type AddOnId =
  | "delivery"
  | "ppf_partial"
  | "ppf_full_front"
  | "ppf_full_body"
  | "ceramic_1yr"
  | "ceramic_5yr"
  | "ceramic_lifetime";

export type AddOn = {
  id: AddOnId;
  group: "delivery" | "ppf" | "ceramic";
  label: string;
  description: string;
  price: number;
  taxable: boolean;
};

// Add-on catalog. Warranty is now its own structured selection (see WarrantySelection)
// driven by the BridgeWarranty / A-Protect plan catalog, not a static tier here.
export const ADDONS: AddOn[] = [
  { id: "delivery", group: "delivery", label: "Home Delivery (Ontario)", description: "Doorstep delivery anywhere in ON. Outside ON quoted separately.", price: 299, taxable: true },
  { id: "ppf_partial",    group: "ppf", label: "PPF — Partial Front",  description: "Bumper, partial hood, partial fenders, mirror caps.", price: 899,  taxable: true },
  { id: "ppf_full_front", group: "ppf", label: "PPF — Full Front",     description: "Full bumper, full hood, full fenders, mirrors.",      price: 1799, taxable: true },
  { id: "ppf_full_body",  group: "ppf", label: "PPF — Full Body",      description: "Self-healing film over the entire painted body.",     price: 4995, taxable: true },
  { id: "ceramic_1yr",      group: "ceramic", label: "Ceramic Coating — 1 year",   description: "Entry-level hydrophobic protection.",  price: 499,  taxable: true },
  { id: "ceramic_5yr",      group: "ceramic", label: "Ceramic Coating — 5 year",   description: "Multi-layer professional grade coating.", price: 1299, taxable: true },
  { id: "ceramic_lifetime", group: "ceramic", label: "Ceramic Coating — Lifetime", description: "Lifetime warranty graphene coating.",   price: 2495, taxable: true },
];

export function getAddOn(id: AddOnId): AddOn | undefined {
  return ADDONS.find((a) => a.id === id);
}

export type Order = {
  id: string;
  vehicleId: string;
  vehicleSnapshot: Pick<
    Vehicle,
    "id" | "year" | "make" | "model" | "trim" | "stockNumber" | "vin" | "salePrice" | "image"
  > & { listingType: ListingType; sellerName: string };
  customer: CustomerInfo;
  pricing: PricingBreakdown;
  selectedAddOnIds: AddOnId[];
  warranty: WarrantySelection | null;
  warrantyDeclined: boolean;
  tireRim: TireRimSelection | null;
  documents: {
    licenceFront: FileRef | null;
    licenceBack: FileRef | null;
    insurance: FileRef | null;
  };
  carfax: {
    acknowledgedAt: string | null;
    initialDataUrl: string | null;
  };
  signatures: {
    billOfSaleCustomer: SignatureRecord | null;
    billOfSaleDealer: SignatureRecord | null;
    dealerGuaranteeCustomer: SignatureRecord | null;
  };
  status: OrderStatus;
  depositSentByCustomerAt: string | null;
  depositConfirmedAt: string | null;
  dealerCounterSignedAt: string | null;
  readyForDeliveryAt: string | null;
  pickedUpAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  events: Array<{ at: string; type: string; actor: "customer" | "dealer" | "system"; note?: string }>;
  createdAt: string;
};

const STORAGE_KEY = "edc.orders.v2";

function read(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}
function write(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("edc.orders.updated"));
}

export const HST_RATE = 0.13;
export const DEPOSIT = 1000;

// Premier (EDC own inventory) fee structure
export const PREMIER_DOC_FEE_LIST = 999;
export const PREMIER_ADMIN_FEE_LIST = 999;
export const PREMIER_OMVIC_FEE = 22;       // taxable
export const PREMIER_LICENSING = 59;       // not taxable
// Standard non-Premier (third-party) fees
export const STANDARD_DOC_FEE = 599;
export const STANDARD_LICENSING = 120;

export type PricingLineItem = {
  label: string;
  amount: number;
  taxable: boolean;
  waived?: boolean;
  originalAmount?: number;
  note?: string;
};

export type PricingBreakdown = {
  salePrice: number;
  lineItems: PricingLineItem[];
  addOns: Array<{ id: AddOnId; label: string; amount: number; taxable: boolean }>;
  warrantyLine: { label: string; amount: number; contractNumber: string } | null;
  tireRimLine: { label: string; amount: number; contractNumber: string } | null;
  // Convenience numerics
  docFee: number;
  licensing: number;
  hst: number;
  total: number;
  deposit: number;
  balanceDue: number;
};

export function computePricing(
  salePrice: number,
  listingType: ListingType,
  selectedAddOnIds: AddOnId[] = [],
  warranty: WarrantySelection | null = null,
  tireRim: TireRimSelection | null = null,
): PricingBreakdown {
  const lineItems: PricingLineItem[] = [];
  let docFee = 0;
  let licensing = 0;

  if (listingType === "EDC Premier") {
    lineItems.push({
      label: "Documentation Fee",
      amount: 0,
      taxable: false,
      waived: true,
      originalAmount: PREMIER_DOC_FEE_LIST,
      note: "Waived for EDC Premier",
    });
    lineItems.push({
      label: "Dealer Admin Fee",
      amount: 0,
      taxable: false,
      waived: true,
      originalAmount: PREMIER_ADMIN_FEE_LIST,
      note: "Waived for EDC Premier",
    });
    lineItems.push({
      label: "OMVIC Fee",
      amount: PREMIER_OMVIC_FEE,
      taxable: true,
    });
    lineItems.push({
      label: "New Plates / Licensing",
      amount: PREMIER_LICENSING,
      taxable: false,
    });
    docFee = 0;
    licensing = PREMIER_LICENSING;
  } else {
    lineItems.push({ label: "Documentation Fee", amount: STANDARD_DOC_FEE, taxable: true });
    lineItems.push({ label: "Licensing", amount: STANDARD_LICENSING, taxable: false });
    docFee = STANDARD_DOC_FEE;
    licensing = STANDARD_LICENSING;
  }

  const addOns = selectedAddOnIds
    .map((id) => getAddOn(id))
    .filter((a): a is AddOn => Boolean(a))
    .map((a) => ({ id: a.id, label: a.label, amount: a.price, taxable: a.taxable }));

  // BridgeWarranty + Tire & Rim — taxable line items added on top.
  const warrantyLine = warranty
    ? {
        label: `Vehicle Service Contract — ${warranty.planName}`,
        amount: warranty.total,
        contractNumber: warranty.contractNumber,
      }
    : null;
  const tireRimLine = tireRim
    ? {
        label: `Tire & Rim Protection — ${tireRim.tierName}`,
        amount: tireRim.total,
        contractNumber: tireRim.contractNumber,
      }
    : null;
  const warrantyAmount = warrantyLine?.amount ?? 0;
  const tireRimAmount = tireRimLine?.amount ?? 0;

  const taxableBase =
    salePrice +
    lineItems.filter((l) => l.taxable).reduce((sum, l) => sum + l.amount, 0) +
    addOns.filter((a) => a.taxable).reduce((sum, a) => sum + a.amount, 0) +
    warrantyAmount +
    tireRimAmount;
  const hst = Math.round(taxableBase * HST_RATE);

  const lineSum = lineItems.reduce((sum, l) => sum + l.amount, 0);
  const addOnSum = addOns.reduce((sum, a) => sum + a.amount, 0);
  const total = salePrice + lineSum + addOnSum + warrantyAmount + tireRimAmount + hst;

  return {
    salePrice,
    lineItems,
    addOns,
    warrantyLine,
    tireRimLine,
    docFee,
    licensing,
    hst,
    total,
    deposit: DEPOSIT,
    balanceDue: total - DEPOSIT,
  };
}

export function generateOrderId(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ymd}-${rand}`;
}

export function listOrders(): Order[] {
  return read().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getOrder(id: string): Order | undefined {
  return read().find((o) => o.id === id);
}

export function saveOrder(order: Order) {
  const all = read();
  const idx = all.findIndex((o) => o.id === order.id);
  if (idx >= 0) all[idx] = order;
  else all.unshift(order);
  write(all);
}

export function updateOrder(id: string, patch: (o: Order) => Order) {
  const all = read();
  const idx = all.findIndex((o) => o.id === id);
  if (idx < 0) return;
  all[idx] = patch(all[idx]);
  write(all);
}

export function addEvent(
  id: string,
  type: string,
  actor: "customer" | "dealer" | "system",
  note?: string,
) {
  updateOrder(id, (o) => ({
    ...o,
    events: [...o.events, { at: new Date().toISOString(), type, actor, note }],
  }));
}

export const DELIVERY_WINDOW_MS = 72 * 60 * 60 * 1000;

export function deliveryDeadline(o: Order): Date | null {
  return o.readyForDeliveryAt ? new Date(new Date(o.readyForDeliveryAt).getTime() + DELIVERY_WINDOW_MS) : null;
}

export function shouldAutoCancel(o: Order, now = new Date()): boolean {
  if (o.status !== "ready_for_delivery") return false;
  const dl = deliveryDeadline(o);
  if (!dl) return false;
  return now.getTime() > dl.getTime();
}

export function maybeAutoCancel(id: string) {
  const o = getOrder(id);
  if (!o) return;
  if (shouldAutoCancel(o)) {
    updateOrder(id, (curr) => ({
      ...curr,
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
      cancelReason:
        "72-hour delivery window expired without full payment and proof of insurance. Deposit forfeited.",
      events: [
        ...curr.events,
        { at: new Date().toISOString(), type: "auto_cancelled", actor: "system", note: "72h window elapsed" },
      ],
    }));
  }
}

export function activeOrderForVehicle(vehicleId: string): Order | undefined {
  return read().find(
    (o) => o.vehicleId === vehicleId && o.status !== "cancelled" && o.status !== "picked_up",
  );
}
