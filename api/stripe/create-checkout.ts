import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const PLANS: Record<string, { name: string; description: string; monthlyPriceCents: number; trialDays: number }> = {
  founders: {
    name: "Founders Special",
    description: "Locked-in Founders rate — $14.50/mo forever. 30 days free.",
    monthlyPriceCents: 1450,
    trialDays: 30,
  },
  standard: {
    name: "Standard",
    description: "Full platform access at the standard monthly rate.",
    monthlyPriceCents: 2900,
    trialDays: 0,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, email, fullName, planKey, origin } = req.body;

    if (!userId || !email || !planKey || !origin) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const plan = PLANS[planKey];
    if (!plan) {
      return res.status(400).json({ error: "Invalid plan key." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      allow_promotion_codes: true,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        customer_email: email,
        customer_name: fullName ?? "",
        plan_key: planKey,
        plan_name: plan.name,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Dude With A Truck — ${plan.name}`,
              description: plan.description,
            },
            unit_amount: plan.monthlyPriceCents,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data:
        plan.trialDays > 0
          ? { trial_period_days: plan.trialDays, metadata: { user_id: userId, plan_key: planKey } }
          : { metadata: { user_id: userId, plan_key: planKey } },
      success_url: `${origin}/payment-success?plan=${planKey}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("[Stripe] create-checkout error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
