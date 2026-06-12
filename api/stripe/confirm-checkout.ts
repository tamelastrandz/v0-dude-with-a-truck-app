/**
 * Confirms a completed Stripe Checkout session and writes the subscription
 * row in Supabase. Called from /payment-success and as a fallback sync on
 * the driver dashboard when payment succeeded but the webhook hasn't run yet.
 */
import {
  findPaidCheckoutSession,
  getStripe,
  syncSubscriptionFromSession,
} from "./_lib/subscriptionSync";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, email, sessionId } = req.body as {
      userId?: string;
      email?: string;
      sessionId?: string;
    };

    if (!userId || !email) {
      return res.status(400).json({ error: "Missing userId or email." });
    }

    const stripe = getStripe();
    let session;

    if (sessionId) {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } else {
      session = await findPaidCheckoutSession(stripe, userId, email);
    }

    if (!session) {
      return res.status(404).json({ error: "No paid checkout session found." });
    }

    const result = await syncSubscriptionFromSession(session);
    return res.status(200).json({ ok: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not confirm checkout.";
    console.error("[Stripe] confirm-checkout error:", message);
    return res.status(500).json({ error: message });
  }
}
