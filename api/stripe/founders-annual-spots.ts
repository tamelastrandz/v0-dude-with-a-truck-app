import { FOUNDERS_ANNUAL_LIMIT } from "../../shared/plans";
import { countFoundersAnnualSubscriptions } from "./_lib/subscriptionSync";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const claimed = await countFoundersAnnualSubscriptions();
    const remaining = Math.max(0, FOUNDERS_ANNUAL_LIMIT - claimed);

    return res.status(200).json({
      total: FOUNDERS_ANNUAL_LIMIT,
      claimed,
      remaining,
      soldOut: remaining === 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not load spot count.";
    console.error("[Stripe] founders-annual-spots error:", message);
    return res.status(500).json({ error: message });
  }
}
