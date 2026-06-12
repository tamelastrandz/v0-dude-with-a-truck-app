/**
 * Shared plan type definitions used by both the frontend checkout helper
 * and the server-side Stripe route.
 */

export type { PlanKey } from "@shared/plans";
export {
  PLANS,
  FOUNDERS_ANNUAL_LIMIT,
  getPlanCadence,
  getPlanDisplayPrice,
  isValidPlanKey,
} from "@shared/plans";

import type { PlanKey } from "@shared/plans";

export const PLAN_LABELS: Record<PlanKey, string> = {
  founders: "Founders Special",
  standard: "Standard",
  founders_annual: "Founders Annual",
};

export const PLAN_PRICES: Record<PlanKey, string> = {
  founders: "$14.50/mo (after 30-day free trial)",
  standard: "$29.00/mo",
  founders_annual: "$299/year",
};
