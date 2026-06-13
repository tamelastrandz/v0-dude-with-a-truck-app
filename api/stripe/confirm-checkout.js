const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const PLANS = {
  founders: {
    name: "Founders Special",
    priceCents: 1450,
    billingInterval: "month",
    trialDays: 30,
    featuredOnHomepage: false,
    featuredDurationDays: 0,
  },
  standard: {
    name: "Standard",
    priceCents: 2900,
    billingInterval: "month",
    trialDays: 0,
    featuredOnHomepage: false,
    featuredDurationDays: 0,
  },
  founders_annual: {
    name: "Founders Annual",
    priceCents: 29900,
    billingInterval: "year",
    trialDays: 0,
    featuredOnHomepage: true,
    featuredDurationDays: 365,
  },
};

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isValidPlanKey(key) {
  return key in PLANS;
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured on the server.");
  return new Stripe(key);
}

function getSupabaseAdmin() {
  const url =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://cfkvfmdjbeyemencgbxx.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured on the server.");
  return createClient(url, key);
}

async function upsertSubscriptionFromCheckout(userId, planKey, stripeCustomerId, stripeSubscriptionId) {
  const plan = PLANS[planKey] || PLANS.standard;
  const now = new Date();
  const status = plan.trialDays > 0 ? "trialing" : "active";
  const supabaseAdmin = getSupabaseAdmin();
  const periodDays = plan.billingInterval === "year" ? 365 : 30;

  const payload = {
    user_id: userId,
    plan_key: planKey,
    plan_name: plan.name,
    billing_interval: plan.billingInterval,
    monthly_price: plan.priceCents / 100,
    status,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    ...(plan.trialDays > 0
      ? {
          trial_start_date: now.toISOString(),
          trial_end_date: addDays(now, plan.trialDays).toISOString(),
        }
      : {
          current_period_start: now.toISOString(),
          current_period_end: addDays(now, periodDays).toISOString(),
        }),
  };

  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.id) {
    let { error } = await supabaseAdmin.from("subscriptions").update(payload).eq("id", existing.id);
    if (error) {
      const minimal = {
        user_id: userId,
        plan_name: plan.name,
        monthly_price: plan.priceCents / 100,
        status,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        current_period_start: payload.current_period_start,
        current_period_end: payload.current_period_end,
        trial_start_date: payload.trial_start_date,
        trial_end_date: payload.trial_end_date,
      };
      ({ error } = await supabaseAdmin.from("subscriptions").update(minimal).eq("id", existing.id));
    }
    if (error) throw new Error(error.message);
  } else {
    let { error } = await supabaseAdmin.from("subscriptions").insert(payload);
    if (error) {
      const minimal = {
        user_id: userId,
        plan_name: plan.name,
        monthly_price: plan.priceCents / 100,
        status,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        current_period_start: payload.current_period_start,
        current_period_end: payload.current_period_end,
        trial_start_date: payload.trial_start_date,
        trial_end_date: payload.trial_end_date,
      };
      ({ error } = await supabaseAdmin.from("subscriptions").insert(minimal));
    }
    if (error) throw new Error(error.message);
  }

  if (planKey === "founders_annual" && plan.featuredOnHomepage) {
    const featuredUntil = addDays(now, plan.featuredDurationDays || 365);
    await supabaseAdmin
      .from("driver_profiles")
      .update({
        is_featured: true,
        featured_until: featuredUntil.toISOString(),
      })
      .eq("user_id", userId);
  }
}

async function syncSubscriptionFromSession(session) {
  if (session.mode !== "subscription") {
    throw new Error("Not a subscription checkout session.");
  }
  if (session.payment_status !== "paid" && session.status !== "complete") {
    throw new Error("Checkout session is not paid yet.");
  }

  const userId = session.metadata?.user_id || session.client_reference_id;
  if (!userId) throw new Error("Checkout session is missing user_id.");

  const rawPlanKey = session.metadata?.plan_key || "standard";
  const planKey = isValidPlanKey(rawPlanKey) ? rawPlanKey : "standard";
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;
  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : null;

  await upsertSubscriptionFromCheckout(userId, planKey, stripeCustomerId, stripeSubscriptionId);

  return {
    userId,
    planKey,
    status: PLANS[planKey]?.trialDays ? "trialing" : "active",
  };
}

async function findPaidCheckoutSession(stripe, userId, email) {
  const matchesSession = (session) => {
    const sessionUserId =
      session.metadata?.user_id || session.client_reference_id || null;
    const sessionEmail =
      session.customer_email || session.metadata?.customer_email || null;

    const matchesUser =
      sessionUserId === userId ||
      (email && sessionEmail && sessionEmail.toLowerCase() === email.toLowerCase());

    return (
      matchesUser &&
      session.mode === "subscription" &&
      (session.payment_status === "paid" || session.status === "complete")
    );
  };

  if (email) {
    const customers = await stripe.customers.list({ email, limit: 5 });
    for (const customer of customers.data) {
      const sessions = await stripe.checkout.sessions.list({
        customer: customer.id,
        limit: 10,
      });
      const match = sessions.data.find(matchesSession);
      if (match) return match;
    }
  }

  const recentSessions = await stripe.checkout.sessions.list({ limit: 25 });
  return recentSessions.data.find(matchesSession) || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, email, sessionId } = req.body || {};
    const stripe = getStripe();
    let session;

    if (sessionId) {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } else if (userId && email) {
      session = await findPaidCheckoutSession(stripe, userId, email);
    } else {
      return res.status(400).json({ error: "Provide sessionId or userId and email." });
    }

    if (!session) {
      return res.status(404).json({ error: "No paid checkout session found." });
    }

    const result = await syncSubscriptionFromSession(session);
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not confirm checkout.";
    console.error("[Stripe] confirm-checkout error:", message);
    return res.status(500).json({ error: message });
  }
};
