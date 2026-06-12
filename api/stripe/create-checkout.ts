import {
  buildCheckoutSessionParams,
  countFoundersAnnualSubscriptions,
  getStripe,
  isValidPlanKey,
} from "./_lib/subscriptionSync";
import { FOUNDERS_ANNUAL_LIMIT } from "../../shared/plans";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, email, fullName, planKey, origin } = req.body;

    if (!userId || !email || !planKey || !origin) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (!isValidPlanKey(planKey)) {
      return res.status(400).json({ error: "Invalid plan key." });
    }

    if (planKey === "founders_annual") {
      const claimed = await countFoundersAnnualSubscriptions();
      if (claimed >= FOUNDERS_ANNUAL_LIMIT) {
        return res.status(409).json({
          error: "All 50 Founders Annual spots have been claimed.",
          soldOut: true,
        });
      }
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      buildCheckoutSessionParams(planKey, userId, email, fullName, origin)
    );

    return res.status(200).json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    console.error("[Stripe] create-checkout error:", message);
    return res.status(500).json({ error: message });
  }
}
