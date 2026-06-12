/**
 * Pricing — Driver subscription tiers.
 */

import { Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DriverSignupModal } from "@/components/forms/DriverSignupModal";
import type { PlanKey } from "@/lib/planTypes";
import { FOUNDERS_ANNUAL_LIMIT } from "@/lib/planTypes";

const tiers = [
  {
    name: "Founders Annual",
    price: "$299",
    cadence: "/year",
    desc: "Lock in founding-member status for a full year. Only 50 spots — when they're gone, they're gone.",
    features: [
      "Everything in Standard",
      "Priority placement on the homepage for 1 year",
      "Featured in our driver email blast",
      "Founding Dude badge on your profile",
      "Background check included",
    ],
    note: "Limited to the first 50 founding dudes. Homepage priority runs 12 months from signup.",
    cta: "Claim Founders Spot — $299/yr",
    highlight: true,
    isDriverSignup: true,
    planKey: "founders_annual" as PlanKey,
    badge: "Limited — 50 Spots",
  },
  {
    name: "Standard",
    price: "$29",
    cadence: "/month",
    desc: "Full access to the platform at the standard monthly rate. No contracts, cancel anytime.",
    features: [
      "Full driver profile listing",
      "Unlimited customer leads",
      "Placement in driver search",
      "Email & phone support",
      "Background check included",
      "Start earning immediately",
    ],
    note: null,
    cta: "List My Truck — $29/mo",
    highlight: false,
    isDriverSignup: true,
    planKey: "standard" as PlanKey,
    badge: null,
  },
];

type SpotsInfo = {
  remaining: number;
  soldOut: boolean;
};

export function Pricing() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("founders_annual");
  const [spots, setSpots] = useState<SpotsInfo>({ remaining: FOUNDERS_ANNUAL_LIMIT, soldOut: false });

  useEffect(() => {
    fetch("/api/stripe/founders-annual-spots")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSpots({ remaining: data.remaining, soldOut: data.soldOut });
        }
      })
      .catch(() => {
        /* keep default count */
      });
  }, []);

  const handleCta = (tier: (typeof tiers)[number]) => {
    if (tier.planKey === "founders_annual" && spots.soldOut) {
      return;
    }
    if (tier.isDriverSignup) {
      setSelectedPlan(tier.planKey);
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
          Join the platform and start getting paid for moves in your area. Grab a Founders Annual
          spot for homepage priority — only {FOUNDERS_ANNUAL_LIMIT} available.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {tiers.map((tier) => {
            const isFoundersAnnual = tier.planKey === "founders_annual";
            const soldOut = isFoundersAnnual && spots.soldOut;

            return (
              <div
                key={tier.name}
                className={cn(
                  "flex flex-col rounded-xl border p-8",
                  tier.highlight ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                )}
              >
                {tier.badge && (
                  <span
                    className={cn(
                      "font-heading mb-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest",
                      soldOut
                        ? "bg-secondary text-muted-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {soldOut ? (
                      "Sold Out"
                    ) : (
                      <>
                        <Sparkles className="size-3.5" aria-hidden="true" />
                        {tier.badge}
                        {isFoundersAnnual && spots.remaining < FOUNDERS_ANNUAL_LIMIT && (
                          <span className="opacity-90">· {spots.remaining} left</span>
                        )}
                      </>
                    )}
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
                  disabled={soldOut}
                  className={cn(
                    "font-heading mt-8 inline-flex h-12 items-center justify-center rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
                    tier.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary/80"
                      : "border border-border bg-transparent text-foreground hover:bg-secondary"
                  )}
                >
                  {soldOut ? "Sold Out — Join Waitlist Soon" : tier.cta}
                </button>
              </div>
            );
          })}
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
