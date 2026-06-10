/**
 * Stripe Express routes for Dude With A Truck.
 *
 * Routes:
 *  POST /api/stripe/create-checkout  — creates a Stripe Checkout Session for a driver subscription
 *  POST /api/stripe/webhook          — handles Stripe webhook events
 *
 * Webhook events handled:
 *  checkout.session.completed        — driver completed checkout; update subscription status
 *  invoice.paid                      — first/recurring payment succeeded; activate subscription
 *                                      and trigger affiliate payout eligibility
 *  customer.subscription.deleted     — subscription canceled; update status in Supabase
 *
 * Note: All Supabase writes go through the existing db.ts helpers which call Supabase directly.
 * The server has the Supabase service-role key available via SUPABASE_SERVICE_ROLE_KEY (if set),
 * but for now we use the anon key since the operations are straightforward updates.
 */

import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { PLANS, type PlanKey } from "./products";

// ---- Stripe client ----
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-05-27.dahlia",
});

// ---- Supabase admin client (bypasses RLS for webhook writes) ----
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL ?? "https://cfkvfmdjbeyemencgbxx.supabase.co",
  // Use service role key if available, otherwise fall back to anon key
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    "sb_publishable_c9Y0kf7TAMPbLilyo-15EA_XyXMT2A3"
);

// ---- Helper: add N days to a date ----
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function registerStripeRoutes(app: Express): void {
  // ================================================================
  // POST /api/stripe/create-checkout
  // Creates a Stripe Checkout Session for a driver subscription.
  //
  // Body: { userId, email, fullName, planKey, origin }
  // Returns: { url } — the Stripe-hosted checkout URL
  // ================================================================
  app.post("/api/stripe/create-checkout", async (req: Request, res: Response) => {
    try {
      const { userId, email, fullName, planKey, origin } = req.body as {
        userId: string;
        email: string;
        fullName?: string;
        planKey: PlanKey;
        origin: string;
      };

      if (!userId || !email || !planKey || !origin) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const plan = PLANS[planKey];
      if (!plan) {
        return res.status(400).json({ error: "Invalid plan key." });
      }

      // Build the checkout session
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
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
            ? {
                trial_period_days: plan.trialDays,
                metadata: {
                  user_id: userId,
                  plan_key: planKey,
                },
              }
            : {
                metadata: {
                  user_id: userId,
                  plan_key: planKey,
                },
              },
        success_url: `${origin}/payment-success?plan=${planKey}`,
        cancel_url: `${origin}/#pricing`,
      };

      const session = await stripe.checkout.sessions.create(sessionParams);

      return res.json({ url: session.url });
    } catch (err: any) {
      console.error("[Stripe] create-checkout error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // ================================================================
  // POST /api/stripe/webhook
  // Handles Stripe webhook events.
  // Must be registered BEFORE express.json() middleware.
  // ================================================================
  app.post(
    "/api/stripe/webhook",
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error("[Webhook] Signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }

      // ---- Test event passthrough (required for Stripe webhook verification) ----
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Event: ${event.type} | ID: ${event.id}`);

      try {
        switch (event.type) {
          // ---- Checkout completed (driver finished payment setup) ----
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.user_id ?? session.client_reference_id;
            const planKey = (session.metadata?.plan_key ?? "standard") as PlanKey;
            const stripeCustomerId =
              typeof session.customer === "string" ? session.customer : null;
            const stripeSubscriptionId =
              typeof session.subscription === "string" ? session.subscription : null;

            if (userId) {
              await handleCheckoutCompleted(
                userId,
                planKey,
                stripeCustomerId,
                stripeSubscriptionId
              );
            }
            break;
          }

          // ---- Invoice paid (first or recurring payment succeeded) ----
          case "invoice.paid": {
            const invoice = event.data.object as Stripe.Invoice;
            // In newer Stripe API versions, subscription is accessed via parent property
            const invoiceAny = invoice as any;
            const stripeSubscriptionId: string | null =
              typeof invoiceAny.subscription === "string"
                ? invoiceAny.subscription
                : typeof invoiceAny.parent?.subscription_details?.subscription === "string"
                ? invoiceAny.parent.subscription_details.subscription
                : null;

            if (stripeSubscriptionId) {
              await handleInvoicePaid(stripeSubscriptionId, (invoiceAny.billing_reason as string) ?? "");
            }
            break;
          }

          // ---- Subscription canceled ----
          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionCanceled(subscription.id);
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err: any) {
        console.error(`[Webhook] Error processing ${event.type}:`, err.message);
        // Return 200 so Stripe doesn't retry — we log the error for investigation
      }

      return res.json({ received: true });
    }
  );
}

// ================================================================
// Webhook handlers
// ================================================================

/**
 * Called when a driver completes Stripe Checkout.
 * Updates the subscriptions row with Stripe IDs and sets status to "trialing" or "active".
 */
async function handleCheckoutCompleted(
  userId: string,
  planKey: PlanKey,
  stripeCustomerId: string | null,
  stripeSubscriptionId: string | null
) {
  const plan = PLANS[planKey];
  const now = new Date();
  const status = plan.trialDays > 0 ? "trialing" : "active";

  // Upsert the subscription row in Supabase
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
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
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("[Webhook] handleCheckoutCompleted: Supabase error:", error.message);
  } else {
    console.log(`[Webhook] Subscription created/updated for user ${userId} (${plan.name})`);
  }
}

/**
 * Called when an invoice is paid (first payment or renewal).
 * - Activates the subscription (trialing → active)
 * - On first payment, marks any affiliate referral as payout-eligible
 */
async function handleInvoicePaid(
  stripeSubscriptionId: string,
  billingReason: string
) {
  // Find the subscription row by Stripe subscription ID
  const { data: sub, error: fetchError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id, status")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();

  if (fetchError || !sub) {
    console.warn("[Webhook] handleInvoicePaid: subscription not found for", stripeSubscriptionId);
    return;
  }

  const wasTrialing = sub.status === "trialing";

  // Activate the subscription
  const { error: updateError } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "active" })
    .eq("id", sub.id);

  if (updateError) {
    console.error("[Webhook] handleInvoicePaid: update error:", updateError.message);
    return;
  }

  console.log(`[Webhook] Subscription ${sub.id} activated for user ${sub.user_id}`);

  // On the first payment (trial ended or immediate payment), trigger affiliate payout
  const isFirstPayment =
    billingReason === "subscription_create" ||
    billingReason === "subscription_cycle" && wasTrialing;

  if (isFirstPayment) {
    await triggerAffiliatePayout(sub.user_id);
  }
}

/**
 * Called when a subscription is canceled in Stripe.
 * Updates the subscription status in Supabase.
 */
async function handleSubscriptionCanceled(stripeSubscriptionId: string) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "canceled", canceled_at: new Date().toISOString() })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    console.error("[Webhook] handleSubscriptionCanceled error:", error.message);
  } else {
    console.log(`[Webhook] Subscription ${stripeSubscriptionId} marked canceled`);
  }
}

/**
 * After a driver's first paid payment, mark their affiliate referral as payout-eligible
 * and create a $10 affiliate_payouts record.
 */
async function triggerAffiliatePayout(driverUserId: string) {
  const now = new Date().toISOString();

  // Find and mark the referral as eligible
  const { data: referral, error: refError } = await supabaseAdmin
    .from("affiliate_referrals")
    .update({ is_payout_eligible: true, first_paid_at: now })
    .eq("referred_driver_id", driverUserId)
    .eq("is_payout_eligible", false)
    .select("id, affiliate_id")
    .single();

  if (refError || !referral) {
    // No referral found — driver wasn't referred by an affiliate
    return;
  }

  console.log(`[Webhook] Affiliate referral ${referral.id} marked payout-eligible`);

  // Create the $10 payout record
  const { error: payoutError } = await supabaseAdmin
    .from("affiliate_payouts")
    .insert({
      affiliate_id: referral.affiliate_id,
      referral_id: referral.id,
      amount: 10.0,
      status: "pending",
    });

  if (payoutError) {
    console.error("[Webhook] triggerAffiliatePayout: insert error:", payoutError.message);
  } else {
    console.log(`[Webhook] $10 payout created for affiliate ${referral.affiliate_id}`);
  }
}
