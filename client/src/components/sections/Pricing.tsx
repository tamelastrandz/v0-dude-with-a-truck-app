/**
 * Pricing — Driver subscription tiers.
 * Preserved from original v0 design.
 * Added: Founders Special CTA opens the DriverSignupModal.
 */

import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DriverSignupModal } from "@/components/forms/DriverSignupModal";

const tiers = [
  {
    name: "Founders Special",
    price: "$14.50",
    cadence: "/month after 30-day free trial",
    desc: "Lock in the lowest rate forever. For the first drivers who join the platform.",
    features: [
      "30 days completely free",
      "Locked-in Founders rate — $14.50/mo forever",
      "Full driver profile listing",
      "Unlimited customer leads",
      "Priority placement in search",
      "Dedicated support line",
    ],
    note: "🔒 Founders rate is locked in for life. Price never increases.",
    cta: "Claim Founders Rate",
    href: "#",
    highlight: true,
    isDriverSignup: true,
    planKey: "founders",
  },
  {
    name: "Standard",
    price: "$29",
    cadence: "/month",
    desc: "Full access to the platform at the standard monthly rate.",
    features: [
      "Full driver profile listing",
      "Unlimited customer leads",
      "Standard placement in search",
      "Email support",
    ],
    note: null,
    cta: "Get Started",
    href: "#",
    highlight: false,
    isDriverSignup: true,
    planKey: "standard",
  },
];

export function Pricing() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"founders" | "standard">("founders");

  const handleCta = (tier: (typeof tiers)[number]) => {
    if (tier.isDriverSignup) {
      setSelectedPlan(tier.planKey as "founders" | "standard");
      setSignupOpen(true);
    }
  };

  return (
    <>
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
          Driver Pricing
        </p>
        <h2 className="font-heading mt-4 max-w-2xl text-balance text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-6xl">
          List Your Truck. Start Earning.
        </h2>
        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Join the platform and start getting paid for moves in your area. No experience required —
          just a truck and a work ethic.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "flex flex-col rounded-xl border p-8",
                tier.highlight
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-card"
              )}
            >
              {tier.highlight && (
                <span className="font-heading mb-4 inline-block w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
                  Most Popular
                </span>
              )}
              <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
                {tier.name}
              </p>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-heading text-5xl font-bold text-foreground">
                  {tier.price}
                </span>
                <span className="mb-1 text-sm text-muted-foreground">{tier.cadence}</span>
              </div>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{tier.desc}</p>
              <ul className="mt-8 flex flex-col gap-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-pretty leading-relaxed text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.note && (
                <p className="mt-6 rounded-md border border-border bg-secondary/50 p-3 text-sm leading-relaxed text-muted-foreground">
                  {tier.note}
                </p>
              )}
              <button
                onClick={() => handleCta(tier)}
                className={cn(
                  "font-heading mt-8 inline-flex h-12 items-center justify-center rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors active:scale-[0.97]",
                  tier.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : "border border-border bg-transparent text-foreground hover:bg-secondary"
                )}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <DriverSignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        plan={selectedPlan}
      />
    </>
  );
}
