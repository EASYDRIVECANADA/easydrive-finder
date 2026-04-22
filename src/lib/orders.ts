// Frontend-only order store (localStorage). No backend.
import type { Vehicle } from "@/data/vehicles";

export type OrderStatus =
  | "deposit_pending"      // customer indicated they sent e-transfer
  | "deposit_confirmed"    // dealer confirmed receipt
  | "awaiting_full_payment"// dealer counter-signed BoS, balance owed
  | "ready_for_delivery"   // dealer marked ready -> 72h timer
  | "picked_up"            // customer picked up
  | "cancelled";           // forfeited

export type CustomerInfo = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  province: string;
  postalCode: string;
  dob: string; // ISO date
};

export type FileRef = {
  name: string;
  size: number;
  type: string;
  // We store a data URL preview only for images < 1MB; otherwise null.
  dataUrl: string | null;
  uploadedAt: string;
};

export type SignatureRecord = {
  typedName: string;
  drawnDataUrl: string; // PNG data URL from canvas
  signedAt: string;
};

export type Order = {
  id: string;            // human-readable: ORD-YYYYMMDD-XXXX
  vehicleId: string;
  vehicleSnapshot: Pick<
    Vehicle,
    "id" | "year" | "make" | "model" | "trim" | "stockNumber" | "vin" | "salePrice" | "image"
  >;
  customer: CustomerInfo;
  pricing: {
    salePrice: number;
    docFee: number;
    licensing: number;
    hst: number;
    total: number;
    deposit: number;
    balanceDue: number;
  };
  documents: {
    licenceFront: FileRef | null;
    licenceBack: FileRef | null;
    insurance: FileRef | null;
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
  readyForDeliveryAt: string | null; // start of 72h
  pickedUpAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  events: Array<{ at: string; type: string; actor: "customer" | "dealer" | "system"; note?: string }>;
  createdAt: string;
};

const STORAGE_KEY = "edc.orders.v1";

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
export const DOC_FEE = 599;
export const LICENSING = 120;
export const DEPOSIT = 1000;

export function computePricing(salePrice: number) {
  const taxableBase = salePrice;
  const hst = Math.round(taxableBase * HST_RATE);
  const total = salePrice + hst + DOC_FEE + LICENSING;
  return {
    salePrice,
    docFee: DOC_FEE,
    licensing: LICENSING,
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

// 72h delivery window helpers
export const DELIVERY_WINDOW_MS = 72 * 60 * 60 * 1000;

export function deliveryDeadline(o: Order): Date | null {
  return o.readyForDeliveryAt ? new Date(new Date(o.readyForDeliveryAt).getTime() + DELIVERY_WINDOW_MS) : null;
}

export function shouldAutoCancel(o: Order, now = new Date()): boolean {
  if (o.status !== "ready_for_delivery") return false;
  const dl = deliveryDeadline(o);
  if (!dl) return false;
  // auto-cancel if past deadline AND (no insurance OR balance not paid)
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
        {
          at: new Date().toISOString(),
          type: "auto_cancelled",
          actor: "system",
          note: "72h window elapsed",
        },
      ],
    }));
  }
}

// Check vehicle availability — returns existing active order for a vehicle
export function activeOrderForVehicle(vehicleId: string): Order | undefined {
  return read().find(
    (o) => o.vehicleId === vehicleId && o.status !== "cancelled" && o.status !== "picked_up",
  );
}
