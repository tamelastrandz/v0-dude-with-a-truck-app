import { Check, MapPin } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const tiers = [
  {
    name: "Customer Access",
    price: "$2",
    cadence: "per access",
    desc: "Browse the full roster of vetted dudes and book the right one for your move.",
    cta: "Find a Dude",
    href: "#crew",
    highlight: false,
    note: "The $2 is for listing access only. The cost to hire your dude is separate, and all payments are handled securely through the app.",
    features: [
      "Full access to all listings",
      "View ratings, trucks & reviews",
      "Direct booking & messaging",
      "Background-checked crew only",
    ],
  },
  {
    name: "Affiliate Dude",
    price: "$29",
    cadence: "per month",
    desc: "List your truck, get found by customers, and earn for every dude you bring on.",
    cta: "List My Truck",
    href: "#",
    highlight: true,
    note: undefined,
    features: [
      "Your own driver profile & photos",
      "Show up in local search results",
      "Earn $10 per referred dude",
      "Background check included",
      "Cancel anytime",
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="text-center">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="font-heading mt-4 text-balance text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-6xl">
            Simple. Upfront. No Surprises.
          </h2>
          <p className="mx-auto mt-6 inline-flex items-center gap-2 text-pretty text-lg leading-relaxed text-muted-foreground">
            <MapPin className="size-5 text-primary" aria-hidden="true" />
            Now serving Atlanta, GA and Houston, TX
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-7 lg:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-xl border bg-card p-8 ${
                tier.highlight ? "border-primary" : "border-border"
              }`}
            >
              {tier.highlight && (
                <span className="font-heading absolute -top-3 left-8 rounded-md bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                  Earn $10 / Referral
                </span>
              )}
              <h3 className="font-heading text-2xl font-bold uppercase tracking-wide text-foreground">
                {tier.name}
              </h3>
              <div className="mt-4 flex items-end gap-2">
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

              <a
                href={tier.href}
                className={cn(
                  buttonVariants({ variant: tier.highlight ? "default" : "outline", size: "lg" }),
                  "font-heading mt-8 h-12 font-semibold uppercase tracking-wide",
                  tier.highlight
                    ? ""
                    : "border-border bg-transparent text-foreground hover:bg-secondary",
                )}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
