/**
 * PaymentSuccess — /payment-success
 *
 * Drivers land here after completing Stripe Checkout.
 * URL: /payment-success?plan=founders|standard
 *
 * Shows:
 *  - Confirmation banner with plan details
 *  - Numbered next-steps checklist
 *  - CTAs to dashboard and profile setup
 */

import { useEffect, useState } from "react";
import { useSearch, useLocation } from "wouter";
import {
  CheckCircle2,
  Truck,
  ArrowRight,
  Star,
  Shield,
  Bell,
  UserCircle,
  LayoutDashboard,
  Phone,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { clearPendingCheckout } from "@/lib/pendingCheckout";
import type { PlanKey } from "@/lib/planTypes";

const PLAN_DETAILS: Record<PlanKey, { label: string; price: string; trialNote: string | null; bonusNote: string | null }> = {
  founders: {
    label: "Founders Special",
    price: "$14.50/month",
    trialNote: "Your 30-day free trial is active. You won't be charged until the trial ends.",
    bonusNote: null,
  },
  standard: {
    label: "Standard Plan",
    price: "$29.00/month",
    trialNote: null,
    bonusNote: null,
  },
  founders_annual: {
    label: "Founders Annual",
    price: "$299.00/year",
    trialNote: null,
    bonusNote:
      "You're one of our founding dudes! Your profile gets priority placement on the homepage for the next 12 months, and you'll be featured in our next driver email blast.",
  },
};

const NEXT_STEPS = [
  {
    icon: UserCircle,
    title: "Complete Your Profile",
    desc: "Add your truck photo, bio, and service area so customers can find and trust you.",
    cta: "Complete Profile",
    href: "/dashboard?setup=profile",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Bell,
    title: "Turn On Notifications",
    desc: "Enable browser or email notifications so you never miss a new job request in your area.",
    cta: null,
    href: null,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: Star,
    title: "Browse Open Requests",
    desc: "Head to your dashboard and click Browse Jobs to see move requests near you right now.",
    cta: "Browse Jobs",
    href: "/dashboard",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "Background Check",
    desc: "Our team will reach out within 24–48 hours to complete your background verification before you go live.",
    cta: null,
    href: null,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    icon: Phone,
    title: "Questions? We're Here.",
    desc: "Call or text us at +1 855-706-4191 — our driver support team is available 7 days a week.",
    cta: "Call Now",
    href: "tel:+18557064191",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

export default function PaymentSuccess() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const { user, profile } = useAuth();
  const [confetti, setConfetti] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [syncOk, setSyncOk] = useState(false);
  const [redirectIn, setRedirectIn] = useState<number | null>(null);

  const params = new URLSearchParams(search);
  const planKey = (params.get("plan") ?? "founders") as PlanKey;
  const sessionId = params.get("session_id");
  const plan = PLAN_DETAILS[planKey] ?? PLAN_DETAILS.founders;

  // Activate subscription in Supabase after Stripe payment
  useEffect(() => {
    let cancelled = false;

    const syncSubscription = async () => {
      try {
        const res = await fetch("/api/stripe/confirm-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            email: profile?.email,
            sessionId: sessionId ?? undefined,
          }),
        });
        if (res.ok) {
          if (!cancelled) {
            setSyncOk(true);
            clearPendingCheckout();
          }
        } else {
          const body = await res.json().catch(() => ({}));
          console.error("[PaymentSuccess] subscription sync failed:", body.error);
        }
      } catch (err) {
        console.error("[PaymentSuccess] subscription sync failed:", err);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    };

    void syncSubscription();
    return () => {
      cancelled = true;
    };
  }, [user?.id, profile?.email, sessionId]);

  // Auto-redirect to profile setup after successful payment
  useEffect(() => {
    if (syncing || !syncOk) return;

    setRedirectIn(3);
    const interval = setInterval(() => {
      setRedirectIn((n) => {
        if (n === null || n <= 1) {
          clearInterval(interval);
          navigate("/dashboard?setup=profile");
          return 0;
        }
        return n - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [syncing, syncOk, navigate]);

  // Trigger confetti animation on mount
  useEffect(() => {
    setConfetti(true);
    const t = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Driver";

  return (
    <div className="min-h-screen bg-background">
      {/* Confetti dots */}
      {confetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute size-2 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444"][i % 5],
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${0.6 + Math.random() * 0.8}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="size-4" />
            </span>
            <span className="font-heading text-sm font-bold uppercase leading-[0.95] tracking-wide text-foreground">
              Dude With
              <br />A Truck
            </span>
          </a>
          <a
            href="/dashboard?setup=profile"
            className="font-heading inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            <LayoutDashboard className="size-4" />
            Complete Profile
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        {/* Success banner */}
        <div className="mb-12 flex flex-col items-center gap-6 text-center">
          {/* Check icon */}
          <div className="relative flex size-24 items-center justify-center rounded-full bg-green-400/10 ring-8 ring-green-400/5">
            <CheckCircle2 className="size-12 text-green-400" />
          </div>

          <div>
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-green-400">
              Payment Confirmed
            </p>
            <h1 className="font-heading mt-2 text-4xl font-bold uppercase tracking-tight text-foreground lg:text-5xl">
              You're In, {firstName}!
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Welcome to Dude With A Truck. Your driver account is set up and your subscription is
              active. Next up: finish your profile so customers can book you.
            </p>
            {syncing && (
              <p className="mt-3 text-sm text-muted-foreground">Activating your subscription…</p>
            )}
            {!syncing && syncOk && redirectIn !== null && redirectIn > 0 && (
              <p className="mt-3 text-sm text-primary">
                Redirecting to profile setup in {redirectIn}…
              </p>
            )}
          </div>

          {/* Plan confirmation pill */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 px-6 py-4 text-left w-full max-w-sm">
            <p className="font-heading text-xs font-semibold uppercase tracking-widest text-primary">
              Your Plan
            </p>
            <p className="font-heading mt-1 text-2xl font-bold uppercase text-foreground">
              {plan.label}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{plan.price}</p>
            {plan.trialNote && (
              <p className="mt-3 rounded-md border border-green-400/20 bg-green-400/5 px-3 py-2 text-xs leading-relaxed text-green-400">
                {plan.trialNote}
              </p>
            )}
            {plan.bonusNote && (
              <p className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs leading-relaxed text-primary">
                {plan.bonusNote}
              </p>
            )}
          </div>
        </div>

        {/* Next steps */}
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            What's Next
          </p>
          <h2 className="font-heading mt-2 text-3xl font-bold uppercase tracking-tight text-foreground">
            Your First 5 Steps
          </h2>
          <p className="mt-3 text-muted-foreground">
            Follow these steps to get verified, visible, and earning as fast as possible.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {NEXT_STEPS.map((step, i) => (
              <div
                key={step.title}
                className="flex items-start gap-5 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/20 hover:bg-secondary/30"
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <span className="font-heading text-xs font-bold text-muted-foreground/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-md",
                      step.bg
                    )}
                  >
                    <step.icon className={cn("size-5", step.color)} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold uppercase tracking-wide text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                  {step.cta && step.href && (
                    <a
                      href={step.href}
                      className="font-heading mt-3 inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-primary hover:underline"
                    >
                      {step.cta}
                      <ArrowRight className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 flex flex-col items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <Truck className="size-10 text-primary" />
          <h3 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
            Ready to Roll?
          </h3>
          <p className="max-w-sm text-muted-foreground">
            Your dashboard is live. Browse open requests and claim your first job today.
          </p>
          <a
            href="/dashboard?setup=profile"
            className="font-heading inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-7 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/80 transition-colors active:scale-[0.97]"
          >
            Complete My Profile
            <ArrowRight className="size-4" />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background mt-8">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center lg:px-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Dude With A Truck. All rights reserved.
            <span className="mx-2">·</span>
            <a href="/" className="hover:text-foreground">Back to site</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
