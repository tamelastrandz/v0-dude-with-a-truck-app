/**
 * Driver subscription plan definitions — shared by client and API routes.
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
      "$299/year — priority homepage placement for 1 year and a feature in our driver email blast.",
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

export function getPlanCadence(planKey: PlanKey): string {
  return PLANS[planKey].billingInterval === "year" ? "/year" : "/month";
}

export function getPlanDisplayPrice(planKey: PlanKey): string {
  const plan = PLANS[planKey];
  const dollars = (plan.priceCents / 100).toFixed(plan.priceCents % 100 === 0 ? 0 : 2);
  return `$${dollars}${getPlanCadence(planKey)}`;
}
