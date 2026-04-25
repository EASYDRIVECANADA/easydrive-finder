// Lightweight account-type "demo" state stored in localStorage.
// This is UI-only — no real auth.
import { useSyncExternalStore } from "react";

export type AccountType =
  | "Guest"
  | "Customer"
  | "Private Seller"
  | "Dealer Select"
  | "EDC Premier"
  | "Fleet Select";

const KEY = "edc.accountType";
const listeners = new Set<() => void>();

// Cache snapshots so useSyncExternalStore receives stable references.
let cachedAccount: AccountType = "Guest";
let cachedAccountRaw: string | null = "__init__";

function read(): AccountType {
  if (typeof window === "undefined") return "Guest";
  const v = window.localStorage.getItem(KEY);
  if (!v) return "Guest";
  return v as AccountType;
}

function getAccountSnapshot(): AccountType {
  if (typeof window === "undefined") return "Guest";
  const raw = window.localStorage.getItem(KEY);
  if (raw !== cachedAccountRaw) {
    cachedAccountRaw = raw;
    cachedAccount = (raw as AccountType) || "Guest";
  }
  return cachedAccount;
}

export function setAccountType(t: AccountType) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, t);
  listeners.forEach((cb) => cb());
}

export function useAccountType(): AccountType {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getAccountSnapshot,
    () => "Guest",
  );
}

export const ACCOUNT_TYPES: AccountType[] = [
  "Guest",
  "Customer",
  "Private Seller",
  "Dealer Select",
  "EDC Premier",
  "Fleet Select",
];

export const ACCOUNT_TYPE_DESCRIPTIONS: Record<AccountType, string> = {
  Guest: "Browsing only — no account active.",
  Customer: "Buy a car, save favourites, manage your orders.",
  "Private Seller": "Sell ONE vehicle at a time. Requires document verification.",
  "Dealer Select": "Mid-tier dealer. List multiple vehicles. No verification gate.",
  "EDC Premier": "Top-tier dealer. Waived doc + admin fees on checkout.",
  "Fleet Select": "Fleet operators. Bulk listings, no verification gate.",
};

// Private seller verification — UI-only checklist
export type PrivateSellerDoc =
  | "ownership"
  | "drivers_license"
  | "insurance"
  | "carfax";

export const PRIVATE_SELLER_DOCS: { key: PrivateSellerDoc; label: string; help: string }[] = [
  {
    key: "ownership",
    label: "Vehicle ownership / registration",
    help: "Provincial ownership document showing you as the registered owner.",
  },
  {
    key: "drivers_license",
    label: "Driver's licence",
    help: "Government-issued ID. Name must match the ownership document.",
  },
  {
    key: "insurance",
    label: "Proof of insurance",
    help: "Insurance slip showing the vehicle is on your policy.",
  },
  {
    key: "carfax",
    label: "CARFAX vehicle history report",
    help: "Recent CARFAX report for the VIN you're listing.",
  },
];

const VERIFY_KEY = "edc.privateSeller.docs";

export function getPrivateSellerVerification(): Record<PrivateSellerDoc, boolean> {
  if (typeof window === "undefined") {
    return { ownership: false, drivers_license: false, insurance: false, carfax: false };
  }
  try {
    const raw = window.localStorage.getItem(VERIFY_KEY);
    if (!raw) throw new Error("no");
    return JSON.parse(raw);
  } catch {
    return { ownership: false, drivers_license: false, insurance: false, carfax: false };
  }
}

export function setPrivateSellerVerification(
  v: Record<PrivateSellerDoc, boolean>,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VERIFY_KEY, JSON.stringify(v));
  listeners.forEach((cb) => cb());
}

// Cache verification snapshots
let cachedVerify: Record<PrivateSellerDoc, boolean> = {
  ownership: false,
  drivers_license: false,
  insurance: false,
  carfax: false,
};
let cachedVerifyRaw: string | null = "__init__";
const EMPTY_VERIFY: Record<PrivateSellerDoc, boolean> = {
  ownership: false,
  drivers_license: false,
  insurance: false,
  carfax: false,
};

function getVerifySnapshot(): Record<PrivateSellerDoc, boolean> {
  if (typeof window === "undefined") return EMPTY_VERIFY;
  const raw = window.localStorage.getItem(VERIFY_KEY);
  if (raw !== cachedVerifyRaw) {
    cachedVerifyRaw = raw;
    cachedVerify = getPrivateSellerVerification();
  }
  return cachedVerify;
}

export function usePrivateSellerVerification() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getVerifySnapshot,
    () => EMPTY_VERIFY,
  );
}

export function isPrivateSellerVerified(
  v: Record<PrivateSellerDoc, boolean>,
): boolean {
  return v.ownership && v.drivers_license && v.insurance && v.carfax;
}
