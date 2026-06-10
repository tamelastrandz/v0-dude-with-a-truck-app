/**
 * Stripe product and price definitions for Dude With A Truck driver subscriptions.
 *
 * Two plans:
 *  - Founders Special: $14.50/month with a 30-day free trial
 *  - Standard:         $29.00/month, no trial
 *
 * Prices are created dynamically via the Stripe API on checkout session creation
 * (inline pricing), so no pre-created Price IDs are needed.
 */

export const PLANS = {
  founders: {
    name: "Founders Special",
    description: "Locked-in Founders rate — $14.50/mo forever. 30 days free.",
    monthlyPriceCents: 1450, // $14.50
    trialDays: 30,
    planKey: "founders" as const,
  },
  standard: {
    name: "Standard",
    description: "Full platform access at the standard monthly rate.",
    monthlyPriceCents: 2900, // $29.00
    trialDays: 0,
    planKey: "standard" as const,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
