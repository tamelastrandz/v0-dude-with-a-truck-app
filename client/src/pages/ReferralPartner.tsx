/**
 * ReferralPartner — /referral-partner
 *
 * Public-facing referral partner signup page.
 *
 * On submit:
 *  1. Calls signUpAffiliate() which:
 *     - Creates Supabase auth user
 *     - Sets profiles.role = "affiliate"
 *     - Generates unique referral code (DUDE-XXXX)
 *     - Creates affiliates row
 *  2. Signs the user in
 *  3. Redirects to /affiliate-dashboard
 *
 * Design: preserves the existing dark Oswald/Geist theme.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import {
  Truck,
  DollarSign,
  Users,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Star,
  Shield,
  Zap,
} from "lucide-react";
import { signUpAffiliate } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const perks = [
  {
    icon: DollarSign,
    title: "$10 Per Driver",
    desc: "Earn a one-time $10 payout for every driver you refer who gets approved and goes active.",
  },
  {
    icon: Users,
    title: "No Limit on Referrals",
    desc: "Refer as many drivers as you want. There's no cap on how much you can earn.",
  },
  {
    icon: Zap,
    title: "Instant Referral Link",
    desc: "Get your unique link the moment you sign up. Share it anywhere — social, text, email.",
  },
  {
    icon: Shield,
    title: "Transparent Tracking",
    desc: "See every referral, approval status, and payout in your dashboard in real time.",
  },
];

const faqs = [
  {
    q: "When do I get paid?",
    a: "You earn $10 after your referred driver signs up, passes the background check, and their account is marked approved. Payouts are processed manually — typically within 5 business days of approval.",
  },
  {
    q: "Can I refer myself?",
    a: "No. Self-referrals are not allowed and will be automatically disqualified.",
  },
  {
    q: "Is there a limit to how many drivers I can refer?",
    a: "No limit at all. Refer 1 or 100 — you earn $10 for every approved driver.",
  },
  {
    q: "How do I share my referral link?",
    a: "After signing up, you'll get a unique link like dudewithatruck.app/join?ref=DUDE-XXXX. Share it on social media, text it to friends, or post it anywhere drivers might see it.",
  },
  {
    q: "What counts as an 'approved' driver?",
    a: "A driver must complete signup, pass the background check, and have their account status set to approved by our team. Trial-only signups that never activate do not qualify.",
  },
];

export default function ReferralPartner() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please agree to the terms to continue.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { userId, referralCode, error } = await signUpAffiliate({
      email,
      password,
      fullName,
      phone: phone || undefined,
      payoutEmail: payoutEmail || email,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Sign in the new user so they land on the dashboard authenticated
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      toast.error("Account created but sign-in failed. Please log in manually.");
      setLoading(false);
      navigate("/");
      return;
    }

    toast.success(`Welcome! Your referral code is ${referralCode}. Let's get you set up.`);
    setLoading(false);
    navigate("/affiliate-dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
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
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to site
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border bg-card/20">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                <Star className="size-3 fill-primary" />
                Referral Partner Program
              </div>
              <h1 className="font-heading mt-5 text-balance text-5xl font-bold uppercase leading-[0.92] tracking-tight text-foreground lg:text-6xl">
                Refer Drivers.
                <br />
                <span className="text-primary">Get Paid $10</span>
                <br />
                Per Approval.
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                Know someone with a truck? Send them your referral link. When they sign up and get
                approved, you earn $10 — no cap, no expiration, no hassle.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  "$10 per approved driver",
                  "Unlimited referrals",
                  "Instant referral link",
                  "Real-time dashboard",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="size-4 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: signup form */}
            <div
              id="signup"
              className="rounded-xl border border-border bg-card p-8 shadow-2xl"
            >
              <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
                Create Your Partner Account
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Free to join. Get your referral link instantly.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Payout email */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Payout Email (PayPal / Venmo)
                  </label>
                  <input
                    type="email"
                    value={payoutEmail}
                    onChange={(e) => setPayoutEmail(e.target.value)}
                    placeholder="Same as above, or your PayPal email"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use your account email.
                  </p>
                </div>

                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 size-4 accent-primary"
                  />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    I agree to the{" "}
                    <span className="text-primary underline underline-offset-2">
                      Referral Partner Terms
                    </span>
                    . I understand payouts are issued only after a referred driver is approved, and
                    self-referrals are not permitted.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !agreed}
                  className="font-heading mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50 active:scale-[0.97]"
                >
                  {loading ? "Creating Account…" : "Get My Referral Link"}
                  <ArrowRight className="size-4" />
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <a href="/affiliate-dashboard" className="text-primary hover:underline">
                    Go to dashboard
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="font-heading mt-3 text-4xl font-bold uppercase tracking-tight text-foreground">
            Three Steps to Your First Payout
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Sign Up Free",
                desc: "Create your partner account and get a unique referral link instantly. No cost, no commitment.",
              },
              {
                num: "02",
                title: "Share Your Link",
                desc: "Send your link to anyone with a truck. Post it on social, text it, or drop it in a Facebook group.",
              },
              {
                num: "03",
                title: "Collect $10",
                desc: "When your referred driver gets approved, $10 lands in your payout queue. We send it within 5 business days.",
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-5">
                <span className="font-heading shrink-0 text-4xl font-bold leading-none text-primary/30">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks grid */}
      <section className="border-b border-border bg-card/20">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            Why Partner With Us
          </p>
          <h2 className="font-heading mt-3 text-4xl font-bold uppercase tracking-tight text-foreground">
            Built for Real Earners
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {perks.map((perk) => (
              <div key={perk.title} className="flex flex-col gap-4 bg-card p-8 hover:bg-secondary transition-colors">
                <span className="flex size-11 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <perk.icon className="size-5" />
                </span>
                <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                  {perk.title}
                </h3>
                <p className="text-pretty leading-relaxed text-muted-foreground">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            FAQ
          </p>
          <h2 className="font-heading mt-3 text-4xl font-bold uppercase tracking-tight text-foreground">
            Common Questions
          </h2>
          <div className="mt-10 flex flex-col divide-y divide-border">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-start justify-between gap-4 text-left"
                >
                  <span className="font-heading font-semibold uppercase tracking-wide text-foreground">
                    {faq.q}
                  </span>
                  <span className="mt-0.5 shrink-0 text-primary text-lg leading-none">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary/5 border-b border-primary/20">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8">
          <h2 className="font-heading text-4xl font-bold uppercase tracking-tight text-foreground">
            Ready to Start Earning?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Sign up above and get your referral link in under 60 seconds.
          </p>
          <a
            href="#signup"
            className="font-heading mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            Get My Referral Link
            <ArrowRight className="size-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
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
