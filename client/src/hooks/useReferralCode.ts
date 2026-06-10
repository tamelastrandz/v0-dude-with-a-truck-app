/**
 * useReferralCode — reads ?ref= from the URL and persists it to sessionStorage.
 *
 * Usage:
 *   const referralCode = useReferralCode();
 *
 * Call this hook on any page that might receive a ?ref= param (e.g. Home, /join).
 * The code is stored in sessionStorage under the key "duat_ref" so it survives
 * navigation within the same tab but is cleared when the tab is closed.
 *
 * The DriverSignupModal reads from sessionStorage so the code is pre-filled
 * even if the driver navigates away from the landing URL before signing up.
 */

import { useEffect } from "react";
import { useSearch } from "wouter";

const STORAGE_KEY = "duat_ref";

export function useReferralCode(): string | null {
  const search = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const ref = params.get("ref");
    if (ref && ref.trim()) {
      sessionStorage.setItem(STORAGE_KEY, ref.trim().toUpperCase());
    }
  }, [search]);

  return sessionStorage.getItem(STORAGE_KEY);
}

/** Read the stored referral code without triggering a re-render */
export function getStoredReferralCode(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

/** Clear the stored referral code (call after successful driver signup) */
export function clearStoredReferralCode(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
