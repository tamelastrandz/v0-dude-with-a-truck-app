/**
 * AffiliateDashboard — /affiliate-dashboard
 *
 * Protected page for affiliate partners. Shows:
 *  - Referral link + one-click copy
 *  - Stats: total referrals, approved, pending, estimated earnings
 *  - Referral table with driver name, signup date, status
 *  - Payout history table
 *
 * Redirects to /referral-partner if not logged in or not an affiliate.
 *
 * Referral qualification rules:
 *  - is_payout_eligible = true  → "Approved" (driver passed background check)
 *  - is_payout_eligible = false → "Pending" (driver signed up, not yet approved)
 *  - No self-referrals (enforced at DB level via UNIQUE constraint on referred_driver_id)
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { getAffiliateDashboard } from "@/lib/db";
import type { Affiliate } from "@/lib/database.types";
import {
  Truck,
  Copy,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  LogOut,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BASE_URL = "https://dudewithatruck.app";

export default function AffiliateDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const [, navigate] = useLocation();

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Redirect if not logged in or not an affiliate
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/referral-partner");
      } else if (profile && profile.role !== "affiliate" && profile.role !== "admin") {
        navigate("/dashboard");
      }
    }
  }, [loading, user, profile, navigate]);

  // Load dashboard data
  useEffect(() => {
    if (!user || !profile) return;
    if (profile.role !== "affiliate" && profile.role !== "admin") return;

    const load = async () => {
      setDataLoading(true);
      const result = await getAffiliateDashboard(user.id);
      setAffiliate(result.affiliate);
      setReferrals(result.referrals);
      setPayouts(result.payouts);
      setDataLoading(false);
    };

    load();
  }, [user, profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const referralLink = affiliate
    ? `${BASE_URL}/join?ref=${affiliate.referral_code}`
    : "";

  const handleCopy = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  // Derived stats
  const approvedReferrals = referrals.filter((r) => r.is_payout_eligible);
  const pendingReferrals = referrals.filter((r) => !r.is_payout_eligible);
  const estimatedEarnings = approvedReferrals.length * 10;
  const paidOut = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);
  const pendingPayout = payouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Truck className="size-5 animate-pulse" />
          <span className="font-heading text-sm uppercase tracking-wide">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="size-4" />
            </span>
            <span className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">
              Dude With A Truck
            </span>
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {profile.full_name ?? profile.email}
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
              Referral Partner
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Page title */}
        <div className="mb-8">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            Affiliate Dashboard
          </p>
          <h1 className="font-heading mt-1 text-4xl font-bold uppercase tracking-tight text-foreground">
            Welcome back, {profile.full_name?.split(" ")[0] ?? "Partner"}
          </h1>
        </div>

        {dataLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="size-4 animate-spin" />
            Loading your dashboard…
          </div>
        ) : !affiliate ? (
          /* No affiliate record found */
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Users className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-4 font-heading text-lg font-bold uppercase text-foreground">
              Affiliate Account Not Found
            </p>
            <p className="mt-2 text-muted-foreground">
              Your account doesn't have an affiliate record yet. Please contact support or try
              signing up again.
            </p>
            <a
              href="/referral-partner"
              className="font-heading mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/80"
            >
              Sign Up as Partner
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* ---- Referral Link Card ---- */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
              <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
                Your Referral Link
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Share this link with drivers. When they sign up and get approved, you earn $10.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-md border border-border bg-background px-4 py-2.5 font-mono text-sm text-foreground break-all">
                  {referralLink}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "font-heading inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold uppercase tracking-wide transition-colors",
                      copied
                        ? "bg-green-500/20 text-green-400"
                        : "bg-primary text-primary-foreground hover:bg-primary/80"
                    )}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="size-4" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" /> Copy Link
                      </>
                    )}
                  </button>
                  <a
                    href={referralLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-transparent px-3 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Open referral link"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Your code:
                </span>
                <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-sm font-bold text-primary">
                  {affiliate.referral_code}
                </span>
              </div>
            </div>

            {/* ---- Stats Grid ---- */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  label: "Total Referrals",
                  value: referrals.length,
                  icon: Users,
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                },
                {
                  label: "Approved",
                  value: approvedReferrals.length,
                  icon: CheckCircle2,
                  color: "text-green-400",
                  bg: "bg-green-400/10",
                },
                {
                  label: "Pending",
                  value: pendingReferrals.length,
                  icon: Clock,
                  color: "text-yellow-400",
                  bg: "bg-yellow-400/10",
                },
                {
                  label: "Est. Earnings",
                  value: `$${estimatedEarnings.toFixed(2)}`,
                  icon: DollarSign,
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                  <div className={cn("flex size-9 items-center justify-center rounded-md", stat.bg)}>
                    <stat.icon className={cn("size-5", stat.color)} />
                  </div>
                  <p className={cn("font-heading mt-3 text-2xl font-bold uppercase", stat.color)}>
                    {stat.value}
                  </p>
                  <p className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* ---- Payout Summary ---- */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-green-400/20 bg-green-400/5 p-5">
                <p className="font-heading text-xs font-semibold uppercase tracking-widest text-green-400">
                  Total Paid Out
                </p>
                <p className="font-heading mt-2 text-3xl font-bold text-foreground">
                  ${paidOut.toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-5">
                <p className="font-heading text-xs font-semibold uppercase tracking-widest text-yellow-400">
                  Pending Payout
                </p>
                <p className="font-heading mt-2 text-3xl font-bold text-foreground">
                  ${pendingPayout.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Processed within 5 business days of driver approval.
                </p>
              </div>
            </div>

            {/* ---- Referrals Table ---- */}
            <div>
              <h2 className="font-heading mb-4 text-xl font-bold uppercase tracking-wide text-foreground">
                Your Referrals
              </h2>
              {referrals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
                  <Users className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-heading font-bold uppercase text-foreground">
                    No Referrals Yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Share your referral link to start earning.
                  </p>
                  <button
                    onClick={handleCopy}
                    className="font-heading mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/80"
                  >
                    <Copy className="size-3.5" /> Copy My Link
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-secondary/50">
                      <tr>
                        {["Driver", "Email", "Signed Up", "Status", "Payout"].map((h) => (
                          <th
                            key={h}
                            className="font-heading px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {referrals.map((ref: any) => {
                        const isApproved = ref.is_payout_eligible;
                        const hasPayout = payouts.some(
                          (p: any) => p.referral_id === ref.id && p.status === "paid"
                        );
                        return (
                          <tr key={ref.id} className="hover:bg-secondary/30">
                            <td className="px-4 py-3 font-medium text-foreground">
                              {ref.profiles?.full_name ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {ref.profiles?.email ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {ref.profiles?.created_at
                                ? new Date(ref.profiles.created_at).toLocaleDateString()
                                : new Date(ref.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
                                  isApproved
                                    ? "bg-green-400/10 text-green-400"
                                    : "bg-yellow-400/10 text-yellow-400"
                                )}
                              >
                                {isApproved ? "Approved" : "Pending"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {hasPayout ? (
                                <span className="text-green-400 font-semibold">$10 Paid</span>
                              ) : isApproved ? (
                                <span className="text-yellow-400">$10 Queued</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ---- Payout History ---- */}
            <div>
              <h2 className="font-heading mb-4 text-xl font-bold uppercase tracking-wide text-foreground">
                Payout History
              </h2>
              {payouts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                  <DollarSign className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-heading font-bold uppercase text-foreground">
                    No Payouts Yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Payouts appear here once a referred driver is approved.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-secondary/50">
                      <tr>
                        {["Amount", "Status", "Method", "Reference", "Date"].map((h) => (
                          <th
                            key={h}
                            className="font-heading px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {payouts.map((payout: any) => (
                        <tr key={payout.id} className="hover:bg-secondary/30">
                          <td className="px-4 py-3 font-semibold text-primary">
                            ${payout.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
                                payout.status === "paid"
                                  ? "bg-green-400/10 text-green-400"
                                  : payout.status === "pending"
                                  ? "bg-yellow-400/10 text-yellow-400"
                                  : "bg-secondary text-muted-foreground"
                              )}
                            >
                              {payout.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">
                            {payout.payment_method ?? "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {payout.payment_ref ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {payout.payout_date
                              ? new Date(payout.payout_date).toLocaleDateString()
                              : "Pending"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Qualification reminder */}
            <div className="rounded-xl border border-border bg-secondary/30 p-5 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Payout Qualification Rules</p>
              <ul className="mt-2 flex flex-col gap-1 list-disc list-inside">
                <li>Driver must sign up using your referral link</li>
                <li>Driver must pass the background check and be marked <strong className="text-foreground">Approved</strong></li>
                <li>Self-referrals are not permitted and will be disqualified</li>
                <li>$10 payout is issued within 5 business days of driver approval</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
