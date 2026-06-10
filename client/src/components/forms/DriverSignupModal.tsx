/**
 * DriverSignupModal — Driver account creation form.
 *
 * On submit:
 *  1. Creates a Supabase auth user with role = "driver"
 *  2. The DB trigger auto-creates a profiles row
 *  3. Creates a driver_profiles row
 *  4. Creates a subscriptions row:
 *     - Founders Special: trialing, 30-day trial, $14.50/mo
 *     - Standard: active, $29/mo
 *  5. If a referral code was provided, records the affiliate referral
 */

import { useState } from "react";
import { X, Truck, Eye, EyeOff, Check, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  upsertDriverProfile,
  getAffiliateByCode,
  recordAffiliateReferral,
} from "@/lib/db";
import { getStoredReferralCode, clearStoredReferralCode } from "@/hooks/useReferralCode";
import { startStripeCheckout } from "@/lib/stripeCheckout";
import {
  TRUCK_MAKES,
  TRUCK_MODELS_BY_MAKE,
  TRUCK_TYPES,
  TRUCK_YEARS,
  SERVICE_AREA_CITIES,
  DRIVER_TAGLINE_EXAMPLES,
} from "@/lib/truckData";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface DriverSignupModalProps {
  open: boolean;
  onClose: () => void;
  plan: "founders" | "standard";
}

export function DriverSignupModal({ open, onClose, plan }: DriverSignupModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1 — Account info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  // Pre-fill referral code from ?ref= URL param (stored in sessionStorage)
  const [referralCode, setReferralCode] = useState(() => getStoredReferralCode() ?? "");

  // Step 2 — Truck info
  const [truckMake, setTruckMake] = useState("");
  const [truckModel, setTruckModel] = useState("");
  const [truckYear, setTruckYear] = useState("");
  const [truckType, setTruckType] = useState("pickup");
  const [serviceArea, setServiceArea] = useState("");
  const [bio, setBio] = useState("");

  const { signIn } = useAuth();
  const [, navigate] = useLocation();

  if (!open) return null;

  const planLabel = plan === "founders" ? "Founders Special" : "Standard";
  const planPrice = plan === "founders" ? "$14.50/mo (after 30-day free trial)" : "$29/mo";

  const reset = () => {
    setStep(1);
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setReferralCode("");
    setTruckMake("");
    setTruckModel("");
    setTruckYear("");
    setTruckType("pickup");
    setServiceArea("");
    setBio("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) return;
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create auth user with role = "driver"
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "driver",
            phone: phone || null,
          },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        setLoading(false);
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        toast.error("Failed to create account. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Update profile role to "driver" (the trigger sets it from metadata,
      //    but we update explicitly to be safe)
      await (supabase
        .from("profiles") as any)
        .update({ role: "driver", phone: phone || null })
        .eq("id", userId);

      // 3. Create driver profile
      await upsertDriverProfile({
        user_id: userId,
        truck_make: truckMake || null,
        truck_model: truckModel || null,
        truck_year: truckYear ? parseInt(truckYear) : null,
        truck_type: truckType || null,
        truck_capacity: null,
        license_plate: null,
        service_area: serviceArea || null,
        service_radius_miles: 25,
        bio: bio || null,
        profile_photo_url: null,
        is_verified: false,
        is_active: true,
        rating: 0,
        total_jobs: 0,
      });

      // 4. Handle affiliate referral code (if provided)
      if (referralCode.trim()) {
        const { data: affiliate } = await getAffiliateByCode(referralCode.trim().toUpperCase());
        if (affiliate) {
          await recordAffiliateReferral(affiliate.id, userId, referralCode.trim().toUpperCase());
        }
      }

      // 5. Sign in the new user
      await signIn(email, password);

      // Clear the referral code from sessionStorage after successful signup
      clearStoredReferralCode();

      // 6. Launch Stripe Checkout for the selected subscription plan.
      //    The webhook (invoice.paid) will activate the subscription in Supabase
      //    after the driver completes payment.
      toast.success("Account created! Redirecting to secure payment…");
      handleClose();

      await startStripeCheckout({
        userId,
        email,
        fullName,
        planKey: plan,
      });

      // Navigate to dashboard — subscription will be activated by the webhook
      navigate("/dashboard");
    } catch (err) {
      console.error("[DriverSignup] Unexpected error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Truck className="size-4" />
              </span>
              <span className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">
                List My Truck
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Plan: <span className="font-semibold text-primary">{planLabel}</span> — {planPrice}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-border">
          {[
            { num: 1, label: "Account" },
            { num: 2, label: "Truck Info" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wide ${
                step === s.num ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full text-xs ${
                  step > s.num
                    ? "bg-primary text-primary-foreground"
                    : step === s.num
                    ? "border-2 border-primary text-primary"
                    : "border border-border text-muted-foreground"
                }`}
              >
                {step > s.num ? <Check className="size-3" /> : s.num}
              </span>
              {s.label}
            </div>
          ))}
        </div>

        {/* Form body */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {step === 1 ? (
            <form onSubmit={handleStep1} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Smith"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
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
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Referral Code (optional)
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="DUDE-XXXX"
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm uppercase text-foreground placeholder:normal-case placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Plan summary */}
              <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
                <p className="font-heading text-xs font-semibold uppercase tracking-widest text-primary">
                  {planLabel} Plan
                </p>
                {plan === "founders" ? (
                  <ul className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="size-3 text-primary" /> 30 days completely free</li>
                    <li className="flex items-center gap-2"><Check className="size-3 text-primary" /> Then $14.50/month — locked in forever</li>
                    <li className="flex items-center gap-2"><Check className="size-3 text-primary" /> Cancel anytime before trial ends</li>
                  </ul>
                ) : (
                  <ul className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2"><Check className="size-3 text-primary" /> $29/month, billed monthly</li>
                    <li className="flex items-center gap-2"><Check className="size-3 text-primary" /> Full platform access</li>
                    <li className="flex items-center gap-2"><Check className="size-3 text-primary" /> Cancel anytime</li>
                  </ul>
                )}
              </div>

              <button
                type="submit"
                className="font-heading mt-2 inline-flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/80"
              >
                Continue to Truck Info →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* ---- Vehicle Type ---- */}
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Vehicle Type *
                </label>
                <select
                  required
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select vehicle type…</option>
                  {TRUCK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* ---- Make / Model / Year ---- */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Make */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Make
                  </label>
                  <select
                    value={truckMake}
                    onChange={(e) => {
                      setTruckMake(e.target.value);
                      setTruckModel(""); // reset model when make changes
                    }}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select make…</option>
                    {TRUCK_MAKES.map((make) => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>

                {/* Model — filtered by make */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Model
                  </label>
                  <select
                    value={truckModel}
                    onChange={(e) => setTruckModel(e.target.value)}
                    disabled={!truckMake}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  >
                    <option value="">{truckMake ? "Select model…" : "Select make first"}</option>
                    {(TRUCK_MODELS_BY_MAKE[truckMake] ?? []).map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Year
                  </label>
                  <select
                    value={truckYear}
                    onChange={(e) => setTruckYear(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Year…</option>
                    {TRUCK_YEARS.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ---- Service Area ---- */}
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Service Area (City / Metro) *
                </label>
                <select
                  required
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select your city…</option>
                  {SERVICE_AREA_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* ---- About You + Tagline ---- */}
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Your Tagline (optional)
                </label>
                <p className="text-xs text-muted-foreground -mt-0.5">
                  A short, memorable line customers will see on your profile.
                </p>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={DRIVER_TAGLINE_EXAMPLES[Math.floor(Math.random() * DRIVER_TAGLINE_EXAMPLES.length)]}
                  maxLength={80}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {/* Quick-pick tagline suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {DRIVER_TAGLINE_EXAMPLES.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setBio(tag)}
                      className="rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-heading inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-transparent text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="font-heading inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
                >
                  {loading ? "Creating Account…" : plan === "founders" ? "Start Free Trial → Payment" : "Continue to Payment"}
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                By signing up you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
