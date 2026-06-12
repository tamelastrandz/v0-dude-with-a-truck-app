import type { IncomingMessage, ServerResponse } from "http";
import type Stripe from "stripe";
import {
  getStripe,
  getSupabaseAdmin,
  upsertSubscriptionFromCheckout,
  type PlanKey,
} from "./_lib/subscriptionSync.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function handleInvoicePaid(stripeSubscriptionId: string, billingReason: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: sub, error: fetchError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id, status")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  if (fetchError || !sub) {
    console.warn("[Webhook] handleInvoicePaid: subscription not found for", stripeSubscriptionId);
    return;
  }

  const wasTrialing = sub.status === "trialing";

  const { error: updateError } = await supabaseAdmin
    .from("subscriptions")
    .update({ status: "active" })
    .eq("id", sub.id);

  if (updateError) {
    console.error("[Webhook] handleInvoicePaid: update error:", updateError.message);
    return;
  }

  const isFirstPayment =
    billingReason === "subscription_create" ||
    (billingReason === "subscription_cycle" && wasTrialing);

  if (isFirstPayment) {
    const now = new Date().toISOString();
    const { data: referral } = await supabaseAdmin
      .from("affiliate_referrals")
      .update({ is_payout_eligible: true, first_paid_at: now })
      .eq("referred_driver_id", sub.user_id)
      .eq("is_payout_eligible", false)
      .select("id, affiliate_id")
      .maybeSingle();

    if (referral) {
      await supabaseAdmin.from("affiliate_payouts").insert({
        affiliate_id: referral.affiliate_id,
        referral_id: referral.id,
        amount: 10.0,
        status: "pending",
      });
    }
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const stripe = getStripe();
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;

  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid webhook signature";
    console.error("[Webhook] Signature verification failed:", message);
    res.statusCode = 400;
    res.end(JSON.stringify({ error: `Webhook Error: ${message}` }));
    return;
  }

  if (event.id.startsWith("evt_test_")) {
    res.statusCode = 200;
    res.end(JSON.stringify({ verified: true }));
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id ?? session.client_reference_id;
        const planKey = (session.metadata?.plan_key ?? "standard") as PlanKey;
        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : null;
        const stripeSubscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        if (userId) {
          await upsertSubscriptionFromCheckout(
            userId,
            planKey,
            stripeCustomerId,
            stripeSubscriptionId
          );
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | null;
          parent?: { subscription_details?: { subscription?: string } };
        };
        const stripeSubscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : typeof invoice.parent?.subscription_details?.subscription === "string"
              ? invoice.parent.subscription_details.subscription
              : null;

        if (stripeSubscriptionId) {
          await handleInvoicePaid(
            stripeSubscriptionId,
            (invoice.billing_reason as string) ?? ""
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await getSupabaseAdmin()
          .from("subscriptions")
          .update({ status: "canceled", canceled_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook handler failed";
    console.error(`[Webhook] Error processing ${event.type}:`, message);
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ received: true }));
}
