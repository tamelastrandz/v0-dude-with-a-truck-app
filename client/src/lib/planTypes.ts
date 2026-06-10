/**
 * Shared plan type definitions used by both the frontend checkout helper
 * and the server-side Stripe route.
 */

export type PlanKey = "founders" | "standard";

export const PLAN_LABELS: Record<PlanKey, string> = {
  founders: "Founders Special",
  standard: "Standard",
};

export const PLAN_PRICES: Record<PlanKey, string> = {
  founders: "$14.50/mo (after 30-day free trial)",
  standard: "$29.00/mo",
};
