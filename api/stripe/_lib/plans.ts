/**
 * Plan definitions colocated with Vercel API routes (avoids cross-root import issues).
 */

export const FOUNDERS_ANNUAL_LIMIT = 50;

export type PlanKey = "founders" | "standard" | "founders_annual";

export interface PlanDefinition {
  name: string;
  description: string;
  priceCents: number;
  billingInterval: "month" | "year";
  trialDays: number;
  featuredOnHomepage?: boolean;
  featuredDurationDays?: number;
  emailBlast?: boolean;
  limitedSpots?: number;
}

export const PLANS: Record<PlanKey, PlanDefinition> = {
  founders: {
    name: "Founders Special",
    description: "Locked-in Founders rate — $14.50/mo forever. 30 days free.",
    priceCents: 1450,
    billingInterval: "month",
    trialDays: 30,
  },
  standard: {
    name: "Standard",
    description: "Full platform access at the standard monthly rate.",
    priceCents: 2900,
    billingInterval: "month",
    trialDays: 0,
  },
  founders_annual: {
    name: "Founders Annual",
    description:
      "Founding member annual plan with homepage priority and email blast feature.",
    priceCents: 29900,
    billingInterval: "year",
    trialDays: 0,
    featuredOnHomepage: true,
    featuredDurationDays: 365,
    emailBlast: true,
    limitedSpots: FOUNDERS_ANNUAL_LIMIT,
  },
};

export function isValidPlanKey(key: string): key is PlanKey {
  return key in PLANS;
}
