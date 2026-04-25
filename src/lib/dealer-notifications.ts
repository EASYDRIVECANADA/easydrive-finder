// Tracks dealer-side notifications for new customer-initiated orders.
// Compares the current order list to a localStorage "last seen" timestamp; any
// order created after that is considered "new" until the dealer visits the
// Sales page (which calls `markSalesSeen`).
//
// Frontend-only; replace with realtime subscriptions when a backend lands.

import { useEffect, useRef, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { listOrders, type Order } from "./orders";

const LAST_SEEN_KEY = "edc.dealer.salesLastSeen";
const EVT = "edc.orders.updated";

function readLastSeen(): number {
  if (typeof window === "undefined") return Date.now();
  const raw = localStorage.getItem(LAST_SEEN_KEY);
  return raw ? Number(raw) : 0;
}

export function markSalesSeen() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
  window.dispatchEvent(new Event(EVT));
}

// Cache the snapshot so useSyncExternalStore gets a stable reference
// between subscription notifications. Without this, listOrders() returns
// a fresh array every call and React throws "Maximum update depth exceeded".
let cachedOrders: Order[] = [];
let cacheKey = "";

function getOrdersSnapshot(): Order[] {
  if (typeof window === "undefined") return cachedOrders;
  const raw = localStorage.getItem("edc.orders.v2") ?? "";
  if (raw !== cacheKey) {
    cacheKey = raw;
    cachedOrders = listOrders();
  }
  return cachedOrders;
}

const EMPTY_ORDERS: Order[] = [];

function useOrders(): Order[] {
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
    getOrdersSnapshot,
    () => EMPTY_ORDERS,
  );
}

/** Count of orders created since the dealer last opened the Sales page. */
export function useNewOrderCount(): number {
  const orders = useOrders();
  const lastSeen = readLastSeen();
  return orders.filter((o) => new Date(o.createdAt).getTime() > lastSeen).length;
}

/**
 * Mount-anywhere hook. Pops a sonner toast the first time a brand-new order
 * appears in the local store. Safe to mount once at the dealer shell level.
 */
export function useOrderArrivalToasts() {
  const orders = useOrders();
  const seenIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    // Initialize on first render — don't toast for orders that already exist.
    if (seenIds.current === null) {
      seenIds.current = new Set(orders.map((o) => o.id));
      return;
    }
    for (const o of orders) {
      if (!seenIds.current.has(o.id)) {
        seenIds.current.add(o.id);
        const buyer = [o.customer.firstName, o.customer.lastName].filter(Boolean).join(" ");
        toast.success("New online sale", {
          description: `${buyer || "A customer"} just checked out — ${o.vehicleSnapshot.year} ${o.vehicleSnapshot.make} ${o.vehicleSnapshot.model}`,
        });
      }
    }
  }, [orders]);
}
