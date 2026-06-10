/**
 * Dashboard — Role-based dashboard.
 *
 * - Customers: see their move requests
 * - Drivers: see their subscription status, bookings, and open requests
 * - Affiliates: see their referral stats and payouts
 * - Redirects to home if not logged in
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Truck,
  Package,
  Star,
  Clock,
  LogOut,
  Home,
  Users,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import {
  getCustomerRequests,
  getDriverBookings,
  getUserSubscription,
  getAffiliateByUserId,
  getAffiliatePayouts,
} from "@/lib/db";
import type { MoveRequest, Subscription, Affiliate, AffiliatePayout } from "@/lib/database.types";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const [, navigate] = useLocation();

  // Data states
  const [requests, setRequests] = useState<MoveRequest[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  // Load role-specific data
  useEffect(() => {
    if (!user || !profile) return;

    const loadData = async () => {
      setDataLoading(true);
      try {
        if (profile.role === "customer") {
          const { data } = await getCustomerRequests(user.id);
          setRequests(data ?? []);
        } else if (profile.role === "driver") {
          const [subRes, bookRes] = await Promise.all([
            getUserSubscription(user.id),
            getDriverBookings(user.id),
          ]);
          setSubscription(subRes.data);
          setBookings(bookRes.data ?? []);
        } else if (profile.role === "affiliate") {
          const { data: aff } = await getAffiliateByUserId(user.id);
          setAffiliate(aff);
          if (aff) {
            const { data: po } = await getAffiliatePayouts(aff.id);
            setPayouts(po ?? []);
          }
        }
      } catch (err) {
        console.error("[Dashboard] Error loading data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user, profile]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out.");
    navigate("/");
  };

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

  const statusColors: Record<string, string> = {
    new: "text-blue-400 bg-blue-400/10",
    matched: "text-yellow-400 bg-yellow-400/10",
    booked: "text-purple-400 bg-purple-400/10",
    completed: "text-green-400 bg-green-400/10",
    canceled: "text-red-400 bg-red-400/10",
    trialing: "text-blue-400 bg-blue-400/10",
    active: "text-green-400 bg-green-400/10",
    past_due: "text-yellow-400 bg-yellow-400/10",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
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
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                statusColors[profile.role] ?? "bg-secondary text-foreground"
              }`}
            >
              {profile.role}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Welcome */}
        <div className="mb-10">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            Dashboard
          </p>
          <h1 className="font-heading mt-2 text-4xl font-bold uppercase tracking-tight text-foreground">
            Welcome back, {profile.full_name?.split(" ")[0] ?? "there"}
          </h1>
        </div>

        {/* ---- CUSTOMER DASHBOARD ---- */}
        {profile.role === "customer" && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-foreground">
                Your Move Requests
              </h2>
              <a
                href="/"
                className="font-heading inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-primary hover:underline"
              >
                New Request <ChevronRight className="size-4" />
              </a>
            </div>

            {dataLoading ? (
              <div className="text-muted-foreground">Loading requests…</div>
            ) : requests.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Package className="mx-auto size-10 text-muted-foreground" />
                <p className="mt-4 font-heading text-lg font-bold uppercase text-foreground">
                  No Requests Yet
                </p>
                <p className="mt-2 text-muted-foreground">
                  Head back to the homepage to request a dude.
                </p>
                <a
                  href="/"
                  className="font-heading mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/80"
                >
                  <Home className="size-4" />
                  Go Home
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-border bg-card p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-heading font-bold uppercase tracking-wide text-foreground">
                          {req.pickup_city} → {req.dropoff_city}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {req.item_description}
                        </p>
                        {req.preferred_date && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            {new Date(req.preferred_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                          statusColors[req.status] ?? "bg-secondary text-foreground"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- DRIVER DASHBOARD ---- */}
        {profile.role === "driver" && (
          <div className="flex flex-col gap-8">
            {/* Subscription card */}
            {subscription && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
                      Subscription
                    </p>
                    <p className="font-heading mt-1 text-2xl font-bold uppercase text-foreground">
                      {subscription.plan_name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ${subscription.monthly_price}/month
                    </p>
                    {subscription.status === "trialing" && subscription.trial_end_date && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Free trial ends:{" "}
                        <span className="font-semibold text-foreground">
                          {new Date(subscription.trial_end_date).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      statusColors[subscription.status] ?? "bg-secondary text-foreground"
                    }`}
                  >
                    {subscription.status}
                  </span>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Total Jobs", value: bookings.length, icon: Package },
                {
                  label: "Completed",
                  value: bookings.filter((b: any) => b.status === "completed").length,
                  icon: Star,
                },
                {
                  label: "Pending",
                  value: bookings.filter((b: any) => b.status === "pending").length,
                  icon: Clock,
                },
                {
                  label: "Earnings",
                  value: `$${bookings
                    .filter((b: any) => b.status === "completed")
                    .reduce((sum: number, b: any) => sum + (b.driver_payout ?? 0), 0)
                    .toFixed(0)}`,
                  icon: DollarSign,
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                  <stat.icon className="size-5 text-primary" />
                  <p className="font-heading mt-3 text-2xl font-bold uppercase text-foreground">
                    {stat.value}
                  </p>
                  <p className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Bookings */}
            <div>
              <h2 className="font-heading mb-4 text-xl font-bold uppercase tracking-wide text-foreground">
                Your Bookings
              </h2>
              {dataLoading ? (
                <div className="text-muted-foreground">Loading bookings…</div>
              ) : bookings.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <Truck className="mx-auto size-10 text-muted-foreground" />
                  <p className="mt-4 font-heading text-lg font-bold uppercase text-foreground">
                    No Bookings Yet
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    Customer requests will appear here once you&apos;re matched.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="rounded-xl border border-border bg-card p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-heading font-bold uppercase tracking-wide text-foreground">
                            {booking.move_requests?.pickup_city} →{" "}
                            {booking.move_requests?.dropoff_city}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {booking.move_requests?.item_description}
                          </p>
                          {booking.quoted_price && (
                            <p className="mt-2 text-sm font-semibold text-primary">
                              ${booking.quoted_price} quoted · ${booking.driver_payout} your cut
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                            statusColors[booking.status] ?? "bg-secondary text-foreground"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- AFFILIATE DASHBOARD ---- */}
        {profile.role === "affiliate" && (
          <div className="flex flex-col gap-8">
            {affiliate ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    {
                      label: "Referral Code",
                      value: affiliate.referral_code,
                      icon: Users,
                    },
                    {
                      label: "Total Referrals",
                      value: affiliate.total_referrals,
                      icon: Users,
                    },
                    {
                      label: "Total Earned",
                      value: `$${affiliate.total_earned.toFixed(2)}`,
                      icon: DollarSign,
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                      <stat.icon className="size-5 text-primary" />
                      <p className="font-heading mt-3 text-2xl font-bold uppercase text-foreground">
                        {stat.value}
                      </p>
                      <p className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Payouts */}
                <div>
                  <h2 className="font-heading mb-4 text-xl font-bold uppercase tracking-wide text-foreground">
                    Payout History
                  </h2>
                  {dataLoading ? (
                    <div className="text-muted-foreground">Loading payouts…</div>
                  ) : payouts.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-8 text-center">
                      <DollarSign className="mx-auto size-8 text-muted-foreground" />
                      <p className="mt-3 font-heading font-bold uppercase text-foreground">
                        No Payouts Yet
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You earn $10 for each driver who becomes a paid subscriber.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {payouts.map((payout) => (
                        <div
                          key={payout.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-card p-5"
                        >
                          <div>
                            <p className="font-heading font-bold uppercase text-foreground">
                              ${payout.amount.toFixed(2)} Payout
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payout.payout_date
                                ? new Date(payout.payout_date).toLocaleDateString()
                                : "Pending"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                              statusColors[payout.status] ?? "bg-secondary text-foreground"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <Users className="mx-auto size-10 text-muted-foreground" />
                <p className="mt-4 font-heading text-lg font-bold uppercase text-foreground">
                  Affiliate Account Not Set Up
                </p>
                <p className="mt-2 text-muted-foreground">
                  Contact support to get your referral code.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
