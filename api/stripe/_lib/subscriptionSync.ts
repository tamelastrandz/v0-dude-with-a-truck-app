import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import {
  FOUNDERS_ANNUAL_LIMIT,
  PLANS,
  type PlanKey,
  isValidPlanKey,
} from "../../../shared/plans";

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export { PLANS, type PlanKey, isValidPlanKey, FOUNDERS_ANNUAL_LIMIT };

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY as string);
}

export function getSupabaseAdmin() {
  return createClient(
    process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );
}

export async function countFoundersAnnualSubscriptions() {
  const supabaseAdmin = getSupabaseAdmin();
  const { count, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("plan_key", "founders_annual")
    .in("status", ["active", "trialing"]);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function activateFoundersAnnualFeatures(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const claimed = await countFoundersAnnualSubscriptions();
  const featuredUntil = addDays(new Date(), PLANS.founders_annual.featuredDurationDays ?? 365);

  const { error } = await supabaseAdmin
    .from("driver_profiles")
    .update({
      is_featured: true,
      featured_until: featuredUntil.toISOString(),
      featured_sort: claimed,
    })
    .eq("user_id", userId);

  if (error) {
    console.error("[SubscriptionSync] featured activation error:", error.message);
  }
}

export async function upsertSubscriptionFromCheckout(
  userId: string,
  planKey: PlanKey,
  stripeCustomerId: string | null,
  stripeSubscriptionId: string | null
) {
  const plan = PLANS[planKey] ?? PLANS.standard;
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
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    if (planKey === "founders_annual") {
      const claimed = await countFoundersAnnualSubscriptions();
      if (claimed >= FOUNDERS_ANNUAL_LIMIT) {
        throw new Error("All 50 Founders Annual spots have been claimed.");
      }
    }

    const { error } = await supabaseAdmin.from("subscriptions").insert(payload);
    if (error) throw new Error(error.message);
  }

  if (planKey === "founders_annual" && plan.featuredOnHomepage) {
    await activateFoundersAnnualFeatures(userId);
  }
}

export async function syncSubscriptionFromSession(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") {
    throw new Error("Not a subscription checkout session.");
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    throw new Error("Checkout session is not paid yet.");
  }

  const userId = session.metadata?.user_id ?? session.client_reference_id;
  if (!userId) {
    throw new Error("Checkout session is missing user_id.");
  }

  const rawPlanKey = session.metadata?.plan_key ?? "standard";
  const planKey: PlanKey = isValidPlanKey(rawPlanKey) ? rawPlanKey : "standard";
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : null;
  const stripeSubscriptionId =
    typeof session.subscription === "string" ? session.subscription : null;

  await upsertSubscriptionFromCheckout(
    userId,
    planKey,
    stripeCustomerId,
    stripeSubscriptionId
  );

  return { userId, planKey, status: PLANS[planKey]?.trialDays ? "trialing" : "active" };
}

export async function findPaidCheckoutSession(
  stripe: Stripe,
  userId: string,
  email: string
) {
  const matchesSession = (session: Stripe.Checkout.Session) => {
    const sessionUserId =
      session.metadata?.user_id ?? session.client_reference_id ?? null;
    const sessionEmail =
      session.customer_email ?? session.metadata?.customer_email ?? null;

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
  return recentSessions.data.find(matchesSession) ?? null;
}

export function buildCheckoutSessionParams(
  planKey: PlanKey,
  userId: string,
  email: string,
  fullName: string | undefined,
  origin: string
): Stripe.Checkout.SessionCreateParams {
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
          unit_amount: plan.priceCents,
          recurring: { interval: plan.billingInterval },
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
