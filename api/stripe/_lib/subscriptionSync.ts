import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const PLANS = {
  founders: {
    name: "Founders Special",
    monthlyPriceCents: 1450,
    trialDays: 30,
  },
  standard: {
    name: "Standard",
    monthlyPriceCents: 2900,
    trialDays: 0,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY as string);
}

export function getSupabaseAdmin() {
  return createClient(
    process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );
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

  const payload = {
    user_id: userId,
    plan_name: plan.name,
    monthly_price: plan.monthlyPriceCents / 100,
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
          current_period_end: addDays(now, 30).toISOString(),
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
    return;
  }

  const { error } = await supabaseAdmin.from("subscriptions").insert(payload);
  if (error) throw new Error(error.message);
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

  const planKey = (session.metadata?.plan_key ?? "standard") as PlanKey;
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
