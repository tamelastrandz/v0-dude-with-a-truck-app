import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Truck,
  MapPin,
  DollarSign,
  ShieldCheck,
  CalendarClock,
  UserPlus,
  Share2,
  ClipboardCheck,
  Wallet,
  Check,
  Package,
  Boxes,
  Car,
  Hammer,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ReferralForm } from "./referral-form"

export const metadata: Metadata = {
  title: "Earn Referrals — Dude With A Truck Referral Partner Program",
  description:
    "We're launching Dude With A Truck in Atlanta and Houston. Refer local truck owners and earn $10 for every qualified driver who signs up, passes a background check, and gets approved.",
}

const heroBadges = [
  { icon: MapPin, label: "Atlanta + Houston rollout" },
  { icon: DollarSign, label: "$10 per approved referral" },
  { icon: ShieldCheck, label: "Background check required" },
  { icon: CalendarClock, label: "Monthly payouts" },
]

const steps = [
  { num: "01", icon: UserPlus, title: "Sign Up", desc: "Create your free referral partner account." },
  { num: "02", icon: Share2, title: "Share Your Link", desc: "Send your referral link to dudes with trucks in your network." },
  { num: "03", icon: ClipboardCheck, title: "They Apply", desc: "Your referral signs up, lists their truck, and completes the approval process." },
  { num: "04", icon: Wallet, title: "You Get Paid", desc: "Earn $10 once they pass the background check and are approved." },
]

const whoToRefer = [
  { icon: Truck, label: "Pickup Truck Owners" },
  { icon: Package, label: "Box Truck Owners" },
  { icon: Car, label: "Cargo Van Owners" },
  { icon: Boxes, label: "Trailer Owners" },
  { icon: Truck, label: "Movers" },
  { icon: Package, label: "Delivery Guys" },
  { icon: Hammer, label: "Handymen With Trucks" },
  { icon: Zap, label: "Side Hustlers" },
]

const earlyBenefits = [
  "Get in before the app expands city by city",
  "Build your referral network early",
  "Help local dudes turn their trucks into income",
  "Simple payout structure",
  "No selling required — just share your link",
]

const faqs = [
  {
    q: "How much do I earn?",
    a: "You earn $10 for every qualified driver you refer who signs up, passes the background check, and is approved.",
  },
  { q: "When do I get paid?", a: "Referral payouts are reviewed and paid once per month." },
  { q: "Can I refer myself?", a: "No. Self-referrals do not qualify." },
  {
    q: "Do drivers need to pay to join?",
    a: "Drivers may be offered a launch promotion or trial. Referral payout eligibility depends on approval rules set by Dude With A Truck.",
  },
  { q: "What cities are you launching in?", a: "We are starting with Atlanta Metro and Houston Metro." },
  {
    q: "Do referred drivers need a background check?",
    a: "Yes. Every driver must pass a background check before being approved.",
  },
]

const eligibilityRules = [
  "Sign up through your referral link",
  "Own or have access to a truck, van, trailer, or hauling vehicle",
  "Complete the driver application",
  "Pass a background check",
  "Be approved by Dude With A Truck",
]

export default function ReferralPartnerPage() {
  return (
    <main className="bg-background">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-bold uppercase leading-[0.95] tracking-wide text-foreground">
              Dude With
              <br />A Truck
            </span>
          </Link>
          <Link
            href="/"
            className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/referral-hero.png"
            alt="Two dudes with a truck shaking hands at dusk"
            fill
            priority
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        </div>

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-28 pb-16 text-center lg:items-start lg:px-8 lg:text-left">
          <span className="font-heading mx-auto inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary lg:mx-0">
            <Zap className="size-3.5" aria-hidden="true" />
            Referral Partner Program
          </span>

          <h1 className="font-heading mt-6 max-w-3xl text-balance text-5xl font-bold uppercase leading-[0.92] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Know Dudes With Trucks? <span className="text-primary">Get Paid.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-pretty text-lg leading-relaxed lg:mx-0" style={{ color: "#ededed" }}>
            We&apos;re launching Dude With A Truck in Atlanta and Houston. Refer local truck owners
            and earn $10 for every qualified driver who signs up, passes their background check, and
            gets approved.
          </p>

          <div className="mt-9 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <a
              href="#signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "font-heading h-13 gap-2 px-7 text-base font-semibold uppercase tracking-wide",
              )}
            >
              Become a Referral Partner
              <ArrowRight className="size-5" aria-hidden="true" />
            </a>
            <Link
              href="/#pricing"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "font-heading h-13 border-border bg-transparent px-7 text-base font-semibold uppercase tracking-wide text-foreground hover:bg-secondary",
              )}
            >
              List My Truck
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
            {heroBadges.map((badge) => (
              <li
                key={badge.label}
                className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-foreground backdrop-blur"
              >
                <badge.icon className="size-4 text-primary" aria-hidden="true" />
                {badge.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
              How It Works
            </p>
            <h2 className="font-heading mt-4 text-balance text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-5xl">
              Four Steps To Get Paid
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="rounded-xl border border-border bg-card p-7">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-3xl font-bold text-border">{step.num}</span>
                </div>
                <h3 className="font-heading mt-5 text-xl font-bold uppercase tracking-wide text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who To Refer */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
              Who To Refer
            </p>
            <h2 className="font-heading mt-4 text-balance text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-5xl">
              Anybody With Wheels & A Work Ethic
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {whoToRefer.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payout Rules */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
              The Fine Print
            </p>
            <h2 className="font-heading mt-4 text-balance text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-5xl">
              Payout Rules
            </h2>
          </div>

          <div className="mt-12 space-y-6">
            <div className="rounded-xl border border-border bg-card p-7">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-primary">
                Referral Payout
              </h3>
              <p className="mt-2 leading-relaxed text-foreground">
                $10 one-time payout per approved driver.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-7">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-primary">
                Payout Eligibility
              </h3>
              <p className="mt-2 text-muted-foreground">The referred driver must:</p>
              <ul className="mt-4 space-y-3">
                {eligibilityRules.map((rule) => (
                  <li key={rule} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="leading-relaxed text-foreground">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-7">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-primary">
                Payout Schedule
              </h3>
              <p className="mt-2 leading-relaxed text-foreground">
                Referral payouts are reviewed and paid once per month.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-7">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-primary">
                No Double Dipping
              </h3>
              <ul className="mt-3 space-y-2 leading-relaxed text-foreground">
                <li>You cannot refer yourself.</li>
                <li>Duplicate, fake, or incomplete applications do not qualify.</li>
                <li>Fraudulent referrals are removed from the program.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Early */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
                Why Join Early
              </p>
              <h2 className="font-heading mt-4 text-balance text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-5xl">
                Early Partners Win First.
              </h2>
            </div>
            <ul className="space-y-4">
              {earlyBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-lg leading-relaxed text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
              Become a Partner
            </p>
            <h2 className="font-heading mt-4 text-balance text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-5xl">
              Grab Your Referral Link
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              Sign up free, get your unique link, and start earning $10 for every approved dude with
              a truck.
            </p>
          </div>

          <div className="mt-12">
            <ReferralForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-24 lg:px-8">
          <div className="text-center">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
              Questions
            </p>
            <h2 className="font-heading mt-4 text-balance text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-5xl">
              FAQ
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-border bg-card p-6 [&_summary]:cursor-pointer"
              >
                <summary className="font-heading flex items-center justify-between gap-4 text-lg font-bold uppercase tracking-wide text-foreground marker:content-none">
                  {faq.q}
                  <span className="text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="size-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">
              Dude With A Truck
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6" aria-label="Footer">
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Home
            </Link>
            <a href="#signup" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Earn Referrals
            </a>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Dude With A Truck
          </p>
        </div>
      </footer>
    </main>
  )
}
