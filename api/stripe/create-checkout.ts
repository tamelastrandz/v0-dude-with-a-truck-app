import Stripe from "stripe";

// Initialize the Stripe client using your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function handler(req: any, res: any) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Create a Checkout Session for the subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID as string,
          quantity: 1,
        },
      ],
      success_url:
        "https://dudewithatruck.app/onboarding/dude-profile?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://dudewithatruck.app/#pricing",
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: error.message });
  }
}
