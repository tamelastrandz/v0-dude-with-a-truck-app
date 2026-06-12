/**
 * stripeCheckout.ts
 *
 * Frontend helper to start a Stripe Checkout session for a driver subscription.
 *
 * Flow:
 *  1. POST /api/stripe/create-checkout with userId, email, planKey, origin
 *  2. Server creates a Stripe Checkout Session and returns the URL
 *  3. Frontend redirects the browser to Stripe Checkout (same tab)
 *
 * After successful checkout, Stripe redirects to /payment-success?plan=<key>
 * confirm-checkout then activates the subscription in Supabase.
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
    const text = await response.text();
    let detail = `Checkout request failed (${response.status})`;
    try {
      const body = JSON.parse(text) as { error?: string };
      if (typeof body.error === "string" && body.error.trim()) {
        detail = body.error;
      }
    } catch {
      if (text.includes("STRIPE_SECRET_KEY")) {
        detail = "Payment server is not configured. Please contact support.";
      }
    }
    throw new Error(detail);
  }

  const { url } = await response.json();
  if (!url) throw new Error("No checkout URL returned from server.");

  window.location.assign(url);
}
