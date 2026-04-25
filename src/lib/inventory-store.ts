// Frontend inventory store layered over the seed `vehicles` data.
// Supports add / edit / delete with localStorage persistence and a stable
// useSyncExternalStore subscription for React.

import { useSyncExternalStore } from "react";
import { vehicles as SEED, type Vehicle } from "@/data/vehicles";

const KEY = "edc.inventory.v1";
const EVT = "edc.inventory.updated";

type Patch = {
  /** ids of seed vehicles that have been deleted */
  deleted: string[];
  /** edited overrides, keyed by id (full Vehicle replaces seed) */
  overrides: Record<string, Vehicle>;
  /** brand-new vehicles created by the dealer */
  added: Vehicle[];
};

const EMPTY_PATCH: Patch = { deleted: [], overrides: {}, added: [] };

function readPatch(): Patch {
  if (typeof window === "undefined") return EMPTY_PATCH;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_PATCH;
    const p = JSON.parse(raw) as Partial<Patch>;
    return {
      deleted: p.deleted ?? [],
      overrides: p.overrides ?? {},
      added: p.added ?? [],
    };
  } catch {
    return EMPTY_PATCH;
  }
}

function writePatch(p: Patch) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event(EVT));
}

function compute(patch: Patch): Vehicle[] {
  const seedFiltered = SEED.filter((v) => !patch.deleted.includes(v.id)).map(
    (v) => patch.overrides[v.id] ?? v,
  );
  return [...patch.added, ...seedFiltered];
}

let cachedRaw: string | null = "__init__";
let cachedList: Vehicle[] = compute(EMPTY_PATCH);

function getSnapshot(): Vehicle[] {
  if (typeof window === "undefined") return cachedList;
  const raw = localStorage.getItem(KEY) ?? "";
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedList = compute(readPatch());
  }
  return cachedList;
}

export function listInventory(): Vehicle[] {
  return getSnapshot();
}

export function getInventoryVehicle(id: string): Vehicle | undefined {
  return getSnapshot().find((v) => v.id === id);
}

export function useInventory(): Vehicle[] {
  return useSyncExternalStore(
    (cb) => {
      const h = () => cb();
      window.addEventListener(EVT, h);
      window.addEventListener("storage", h);
      return () => {
        window.removeEventListener(EVT, h);
        window.removeEventListener("storage", h);
      };
    },
    getSnapshot,
    () => cachedList,
  );
}

export function deleteVehicles(ids: string[]) {
  const p = readPatch();
  const idSet = new Set(ids);
  // remove from added
  p.added = p.added.filter((v) => !idSet.has(v.id));
  // remove from overrides (no longer needed)
  for (const id of ids) delete p.overrides[id];
  // mark seed ids as deleted
  for (const id of ids) {
    if (SEED.some((v) => v.id === id) && !p.deleted.includes(id)) {
      p.deleted.push(id);
    }
  }
  writePatch(p);
}

export function upsertVehicle(v: Vehicle) {
  const p = readPatch();
  const isSeed = SEED.some((s) => s.id === v.id);
  if (isSeed) {
    p.overrides[v.id] = v;
  } else {
    const idx = p.added.findIndex((a) => a.id === v.id);
    if (idx >= 0) p.added[idx] = v;
    else p.added.unshift(v);
  }
  writePatch(p);
}

export function newVehicleId(): string {
  return `nv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function blankVehicle(): Vehicle {
  return {
    id: newVehicleId(),
    year: new Date().getFullYear(),
    make: "",
    model: "",
    trim: "",
    vehicleType: "Sedan",
    drive: "FWD",
    transmission: "Automatic",
    cylinders: 4,
    colour: "",
    odometer: 0,
    cashValue: 0,
    listPrice: 0,
    salePrice: 0,
    dii: 0,
    stockNumber: `EDC-${Math.floor(1000 + Math.random() * 9000)}`,
    keyNumber: `K-${Math.floor(100 + Math.random() * 900)}`,
    certification: "Cert",
    status: "In Stock",
    bodyType: "Sedan",
    fuel: "Gasoline",
    doors: 4,
    vin: "",
    description: "",
    features: [],
    image: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=1200&q=80",
    images: [],
    listingType: "EDC Premier",
    sellerName: "EasyDrive Canada",
  };
}
