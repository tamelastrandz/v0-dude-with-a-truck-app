/**
 * stripeCheckout.ts
 *
 * Frontend helper to start a Stripe Checkout session for a driver subscription.
 *
 * Flow:
 *  1. POST /api/stripe/create-checkout with userId, email, planKey, origin
 *  2. Server creates a Stripe Checkout Session and returns the URL
 *  3. Frontend opens the URL in a new tab
 *
 * After successful checkout, Stripe redirects to /dashboard?checkout=success&plan=<key>
 * The webhook (invoice.paid) then activates the subscription in Supabase.
 */

import type { PlanKey } from "./planTypes";

export interface StartCheckoutOptions {
  userId: string;
  email: string;
  fullName?: string;
  planKey: PlanKey;
}

export async function startStripeCheckout(opts: StartCheckoutOptions): Promise<void> {
  const response = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: opts.userId,
      email: opts.email,
      fullName: opts.fullName ?? "",
      planKey: opts.planKey,
      origin: window.location.origin,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Checkout request failed (${response.status})`);
  }

  const { url } = await response.json();
  if (!url) throw new Error("No checkout URL returned from server.");

  // Open Stripe Checkout in a new tab
  window.open(url, "_blank");
}
