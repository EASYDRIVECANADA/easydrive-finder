// Dealer-side configuration for warranty retail pricing + add-on catalog.
// Persists in localStorage. Only stores OVERRIDES — costs come from the live
// BridgeWarranty catalog (`src/lib/bridgewarranty/plans.ts`) at read time so
// brochure updates flow through automatically.
//
// Storage shape is intentionally minimal: a `null` retail means "use the
// global markup default", so dealers don't have to touch every cell.

import { useSyncExternalStore } from "react";
import {
  warrantyPlans,
  getPlanBySlug,
  type WarrantyPlan,
  type PricingTier,
} from "./bridgewarranty";
import type { AddOn } from "./orders";
import { ADDONS } from "./orders";

const STORAGE_KEY = "edc.dealerConfig.v1";
const EVT = "edc.dealerConfig.updated";

// ── Types ────────────────────────────────────────────────────────

/** Per-cell override in the term grid. `retail = null` → use markup default. */
export type RetailCell = { retail: number | null };

export type WarrantyPlanConfig = {
  enabled: boolean;
  /** key = tierIndex (0,1,2…). Each value holds a row->terms[] override grid. */
  tiers: Record<
    number,
    {
      /** Override per row label ("Base Price", "Unlimited km", etc.) → array indexed by termIndex. */
      rows: Record<string, (RetailCell | null)[]>;
    }
  >;
};

export type DealerProductConfig = Omit<AddOn, "id"> & {
  id: string;
  /** dealer cost (informational only; retail is what customers see) */
  cost: number;
  /** Visible in the public customer checkout add-ons step */
  customerVisible: boolean;
  /** Available to add to manual Bills of Sale */
  dealerVisible: boolean;
};

export type DealerConfig = {
  /** Default markup applied to ANY warranty cell that doesn't have an explicit override. */
  warrantyMarkupPct: number;
  /** Master switch: when off, customer-facing /warranty page hides retail and shows "Call for pricing". */
  showRetailToCustomers: boolean;
  /** Per-plan overrides. Plans not present here are treated as enabled w/ no overrides. */
  warranty: Record<string, WarrantyPlanConfig>;
  /** Dealer-managed product catalog (seeded from ADDONS on first read). */
  products: DealerProductConfig[];
};

const DEFAULT_CONFIG: DealerConfig = {
  warrantyMarkupPct: 40,
  showRetailToCustomers: true,
  warranty: {},
  products: ADDONS.map<DealerProductConfig>((a) => ({
    ...a,
    cost: Math.round(a.price * 0.6), // sensible seed cost
    customerVisible: true,
    dealerVisible: true,
  })),
};

// ── Storage I/O ──────────────────────────────────────────────────

function read(): DealerConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<DealerConfig>;
    // Merge with defaults so newly-added fields work.
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      warranty: parsed.warranty ?? {},
      products: parsed.products?.length ? parsed.products : DEFAULT_CONFIG.products,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function write(cfg: DealerConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event(EVT));
}

export function getConfig(): DealerConfig {
  return read();
}

export function setConfig(patch: (cfg: DealerConfig) => DealerConfig) {
  write(patch(read()));
}

// ── React subscription ───────────────────────────────────────────

export function useDealerConfig(): DealerConfig {
  return useSyncExternalStore(
    (cb) => {
      const handler = () => cb();
      window.addEventListener(EVT, handler);
      window.addEventListener("storage", handler);
      return () => {
        window.removeEventListener(EVT, handler);
        window.removeEventListener("storage", handler);
      };
    },
    () => read(),
    () => DEFAULT_CONFIG,
  );
}

// ── Catalog helpers (cost lookups from the live brochure) ────────

const isNumeric = (v: unknown): v is number => typeof v === "number" && !isNaN(v);

/** Resolve the underlying COST for a given plan/tier/term/row from the live brochure. */
export function getCost(
  plan: WarrantyPlan,
  tierIndex: number,
  termIndex: number,
  rowLabel: string,
): number | null {
  const tier: PricingTier | undefined = plan.pricingTiers[tierIndex];
  if (!tier) return null;
  const row = tier.rows.find((r) => r.label === rowLabel);
  if (!row) return null;
  const v = row.values[termIndex];
  return isNumeric(v) ? v : null;
}

/** Resolve the RETAIL the customer should see. Falls back to cost × (1 + markup). */
export function getRetail(
  cfg: DealerConfig,
  planSlug: string,
  tierIndex: number,
  termIndex: number,
  rowLabel: string,
): number | null {
  const plan = getPlanBySlug(planSlug);
  if (!plan) return null;
  const cost = getCost(plan, tierIndex, termIndex, rowLabel);
  if (cost == null) return null;
  const override = cfg.warranty[planSlug]?.tiers?.[tierIndex]?.rows?.[rowLabel]?.[termIndex]?.retail;
  if (override != null) return override;
  return Math.round(cost * (1 + cfg.warrantyMarkupPct / 100));
}

/** Is this plan enabled for customer-facing surfaces? Defaults to true. */
export function isPlanEnabled(cfg: DealerConfig, planSlug: string): boolean {
  const entry = cfg.warranty[planSlug];
  return entry ? entry.enabled : true;
}

// ── Mutators ─────────────────────────────────────────────────────

function ensureSlot(
  cfg: DealerConfig,
  planSlug: string,
  tierIndex: number,
  rowLabel: string,
  termCount: number,
): { rows: Record<string, (RetailCell | null)[]> } {
  const planEntry = cfg.warranty[planSlug] ?? { enabled: true, tiers: {} };
  const tierEntry = planEntry.tiers[tierIndex] ?? { rows: {} };
  if (!tierEntry.rows[rowLabel]) {
    tierEntry.rows[rowLabel] = new Array(termCount).fill(null);
  }
  planEntry.tiers[tierIndex] = tierEntry;
  cfg.warranty[planSlug] = planEntry;
  return tierEntry;
}

export function setRetailCell(
  planSlug: string,
  tierIndex: number,
  termIndex: number,
  rowLabel: string,
  retail: number | null,
) {
  setConfig((cfg) => {
    const next = structuredClone(cfg);
    const plan = getPlanBySlug(planSlug);
    const termCount = plan?.pricingTiers[tierIndex]?.terms.length ?? 0;
    const tierEntry = ensureSlot(next, planSlug, tierIndex, rowLabel, termCount);
    tierEntry.rows[rowLabel][termIndex] = retail == null ? null : { retail };
    return next;
  });
}

export function setPlanEnabled(planSlug: string, enabled: boolean) {
  setConfig((cfg) => {
    const next = structuredClone(cfg);
    const entry = next.warranty[planSlug] ?? { enabled: true, tiers: {} };
    entry.enabled = enabled;
    next.warranty[planSlug] = entry;
    return next;
  });
}

export function setMarkup(pct: number) {
  setConfig((cfg) => ({ ...cfg, warrantyMarkupPct: Math.max(0, Math.round(pct)) }));
}

export function setShowRetailToCustomers(on: boolean) {
  setConfig((cfg) => ({ ...cfg, showRetailToCustomers: on }));
}

/** Apply a markup % to every cell of a tier (overwrites any existing overrides). */
export function applyMarkupToTier(planSlug: string, tierIndex: number, markupPct: number) {
  const plan = getPlanBySlug(planSlug);
  if (!plan) return;
  const tier = plan.pricingTiers[tierIndex];
  if (!tier) return;
  setConfig((cfg) => {
    const next = structuredClone(cfg);
    for (const row of tier.rows) {
      for (let t = 0; t < tier.terms.length; t++) {
        const cost = getCost(plan, tierIndex, t, row.label);
        if (cost == null) continue;
        const tierEntry = ensureSlot(next, planSlug, tierIndex, row.label, tier.terms.length);
        tierEntry.rows[row.label][t] = {
          retail: Math.round(cost * (1 + markupPct / 100)),
        };
      }
    }
    return next;
  });
}

/** Fill empty cells (those without explicit overrides) with markup-based retails. */
export function fillEmptyOnTier(planSlug: string, tierIndex: number, markupPct: number) {
  const plan = getPlanBySlug(planSlug);
  if (!plan) return;
  const tier = plan.pricingTiers[tierIndex];
  if (!tier) return;
  setConfig((cfg) => {
    const next = structuredClone(cfg);
    for (const row of tier.rows) {
      for (let t = 0; t < tier.terms.length; t++) {
        const cost = getCost(plan, tierIndex, t, row.label);
        if (cost == null) continue;
        const tierEntry = ensureSlot(next, planSlug, tierIndex, row.label, tier.terms.length);
        if (tierEntry.rows[row.label][t] == null) {
          tierEntry.rows[row.label][t] = {
            retail: Math.round(cost * (1 + markupPct / 100)),
          };
        }
      }
    }
    return next;
  });
}

export function resetTierOverrides(planSlug: string, tierIndex: number) {
  setConfig((cfg) => {
    const next = structuredClone(cfg);
    if (next.warranty[planSlug]?.tiers?.[tierIndex]) {
      delete next.warranty[planSlug].tiers[tierIndex];
    }
    return next;
  });
}

// ── Product (add-on) catalog mutators ───────────────────────────

export function upsertProduct(p: DealerProductConfig) {
  setConfig((cfg) => {
    const next = structuredClone(cfg);
    const idx = next.products.findIndex((x) => x.id === p.id);
    if (idx >= 0) next.products[idx] = p;
    else next.products.push(p);
    return next;
  });
}

export function deleteProduct(id: string) {
  setConfig((cfg) => {
    const next = structuredClone(cfg);
    next.products = next.products.filter((p) => p.id !== id);
    return next;
  });
}

/** Customer-visible products — used by public checkout add-ons step. */
export function getCustomerProducts(cfg?: DealerConfig): DealerProductConfig[] {
  return (cfg ?? read()).products.filter((p) => p.customerVisible);
}

/** Dealer-visible products — used by manual Bill of Sale picker. */
export function getDealerProducts(cfg?: DealerConfig): DealerProductConfig[] {
  return (cfg ?? read()).products.filter((p) => p.dealerVisible);
}

// ── Plan listing helpers ─────────────────────────────────────────

/** Convenience: list every plan in the catalog regardless of grouping. */
export function listAllPlans(): WarrantyPlan[] {
  return warrantyPlans;
}
