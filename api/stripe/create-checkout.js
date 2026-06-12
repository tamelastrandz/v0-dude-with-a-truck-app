const Stripe = require("stripe");

const PLANS = {
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
  },
};

function isValidPlanKey(key) {
  return key in PLANS;
}

function buildCheckoutSessionParams(planKey, userId, email, fullName, origin) {
  const plan = PLANS[planKey];

  return {
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    allow_promotion_codes: true,
    client_reference_id: userId,
    metadata: {
      user_id: userId,
      customer_email: email,
      customer_name: fullName || "",
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
          unit_amount: plan.priceCents,
          recurring: {
            interval: plan.billingInterval,
            interval_count: 1,
          },
        },
        quantity: 1,
      },
    ],
    subscription_data:
      plan.trialDays > 0
        ? {
            trial_period_days: plan.trialDays,
            metadata: { user_id: userId, plan_key: planKey },
          }
        : { metadata: { user_id: userId, plan_key: planKey } },
    success_url: `${origin}/payment-success?plan=${planKey}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#pricing`,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, email, fullName, planKey, origin } = req.body || {};

    if (!userId || !email || !planKey || !origin) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (!isValidPlanKey(planKey)) {
      return res.status(400).json({ error: "Invalid plan key." });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return res.status(500).json({ error: "STRIPE_SECRET_KEY is not configured on the server." });
    }

    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create(
      buildCheckoutSessionParams(planKey, userId, email, fullName, origin)
    );

    return res.status(200).json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    console.error("[Stripe] create-checkout error:", message);
    return res.status(500).json({ error: message });
  }
};
