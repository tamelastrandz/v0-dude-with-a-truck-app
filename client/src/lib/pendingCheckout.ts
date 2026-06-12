import type { PlanKey } from "./planTypes";

const STORAGE_KEY = "pending_driver_checkout";

export interface PendingDriverCheckout {
  userId: string;
  email: string;
  fullName?: string;
  planKey: PlanKey;
}

export function storePendingCheckout(payload: PendingDriverCheckout) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getPendingCheckout(): PendingDriverCheckout | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingDriverCheckout;
  } catch {
    return null;
  }
}

export function clearPendingCheckout() {
  sessionStorage.removeItem(STORAGE_KEY);
}
