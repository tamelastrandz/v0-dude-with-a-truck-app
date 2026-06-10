/**
 * AdminDashboard — Admin-only panel.
 *
 * Tabs:
 *  - Drivers: list all driver profiles + subscription status
 *  - Customers: list all customer profiles
 *  - Requests: list all move requests
 *  - Bookings: list all bookings
 *  - Affiliate Payouts: list pending payouts, mark as paid
 *
 * Access is restricted to users with role = "admin".
 * RLS in Supabase enforces this at the database level as well.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  adminListProfiles,
  adminListRequests,
  adminListBookings,
  adminListPendingPayouts,
  adminListSubscriptions,
  adminMarkPayoutPaid,
} from "@/lib/db";
import {
  Truck,
  Users,
  Package,
  DollarSign,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import type { Profile, MoveRequest } from "@/lib/database.types";

type Tab = "drivers" | "customers" | "requests" | "bookings" | "payouts";

export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("drivers");
  const [dataLoading, setDataLoading] = useState(false);

  // Data
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<MoveRequest[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/");
      } else if (profile && profile.role !== "admin") {
        navigate("/dashboard");
      }
    }
  }, [loading, user, profile, navigate]);

  // Load data for current tab
  useEffect(() => {
    if (!profile || profile.role !== "admin") return;
    loadTabData(tab);
  }, [tab, profile]);

  const loadTabData = async (t: Tab) => {
    setDataLoading(true);
    try {
      if (t === "drivers") {
        const [driversRes, subsRes] = await Promise.all([
          adminListProfiles("driver"),
          adminListSubscriptions(),
        ]);
        setDrivers(driversRes.data ?? []);
        setSubscriptions(subsRes.data ?? []);
      } else if (t === "customers") {
        const { data } = await adminListProfiles("customer");
        setCustomers(data ?? []);
      } else if (t === "requests") {
        const { data } = await adminListRequests();
        setRequests(data ?? []);
      } else if (t === "bookings") {
        const { data } = await adminListBookings();
        setBookings(data ?? []);
      } else if (t === "payouts") {
        const { data } = await adminListPendingPayouts();
        setPayouts(data ?? []);
      }
    } catch (err) {
      console.error("[Admin] Error loading data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleMarkPaid = async (payoutId: string) => {
    const ref = prompt("Enter payment reference (e.g. PayPal transaction ID):");
    if (!ref) return;
    const method = prompt("Payment method (paypal / venmo / bank_transfer):");
    if (!method) return;

    const { error } = await adminMarkPayoutPaid(payoutId, ref, method);
    if (error) {
      toast.error("Failed to update payout.");
      return;
    }
    toast.success("Payout marked as paid.");
    loadTabData("payouts");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Truck className="size-6 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  if (profile.role !== "admin") {
    return null;
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "drivers", label: "Drivers", icon: Truck },
    { id: "customers", label: "Customers", icon: Users },
    { id: "requests", label: "Requests", icon: Package },
    { id: "bookings", label: "Bookings", icon: ChevronDown },
    { id: "payouts", label: "Payouts", icon: DollarSign },
  ];

  const statusColors: Record<string, string> = {
    new: "text-blue-400 bg-blue-400/10",
    matched: "text-yellow-400 bg-yellow-400/10",
    booked: "text-purple-400 bg-purple-400/10",
    completed: "text-green-400 bg-green-400/10",
    canceled: "text-red-400 bg-red-400/10",
    trialing: "text-blue-400 bg-blue-400/10",
    active: "text-green-400 bg-green-400/10",
    pending: "text-yellow-400 bg-yellow-400/10",
    paid: "text-green-400 bg-green-400/10",
    failed: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <span className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">
                Admin Panel
              </span>
              <p className="text-xs text-muted-foreground">Dude With A Truck</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
              View Site
            </a>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Page title */}
        <div className="mb-8">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            Admin
          </p>
          <h1 className="font-heading mt-1 text-4xl font-bold uppercase tracking-tight text-foreground">
            Control Panel
          </h1>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`font-heading flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {dataLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="size-4 animate-pulse" />
            Loading…
          </div>
        ) : (
          <>
            {/* DRIVERS */}
            {tab === "drivers" && (
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      {["Name", "Email", "Plan", "Sub Status", "Joined"].map((h) => (
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
                    {drivers.map((driver) => {
                      const sub = subscriptions.find((s: any) => s.user_id === driver.id);
                      return (
                        <tr key={driver.id} className="hover:bg-secondary/30">
                          <td className="px-4 py-3 font-medium text-foreground">
                            {driver.full_name ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{driver.email}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {sub?.plan_name ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {sub ? (
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                                  statusColors[sub.status] ?? "bg-secondary text-foreground"
                                }`}
                              >
                                {sub.status}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(driver.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                    {drivers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No drivers yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* CUSTOMERS */}
            {tab === "customers" && (
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      {["Name", "Email", "Phone", "Joined"].map((h) => (
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
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {c.full_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.phone ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          No customers yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* REQUESTS */}
            {tab === "requests" && (
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      {["Customer", "Route", "Items", "Urgency", "Status", "Date"].map((h) => (
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
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3 text-foreground">{req.customer_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {req.pickup_city} → {req.dropoff_city}
                        </td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                          {req.item_description}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{req.urgency}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                              statusColors[req.status] ?? "bg-secondary text-foreground"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No requests yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* BOOKINGS */}
            {tab === "bookings" && (
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      {["Route", "Driver", "Quoted", "Platform Fee", "Driver Payout", "Status"].map((h) => (
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
                    {bookings.map((b: any) => (
                      <tr key={b.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3 text-foreground">
                          {b.move_requests?.pickup_city} → {b.move_requests?.dropoff_city}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {b.profiles?.full_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {b.quoted_price ? `$${b.quoted_price}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {b.platform_fee ? `$${b.platform_fee}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {b.driver_payout ? `$${b.driver_payout}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                              statusColors[b.status] ?? "bg-secondary text-foreground"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No bookings yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAYOUTS */}
            {tab === "payouts" && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Pending affiliate payouts. Each payout is $10 per converted driver.
                </p>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-secondary/50">
                      <tr>
                        {["Affiliate", "Amount", "Status", "Created", "Action"].map((h) => (
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
                      {payouts.map((p: any) => (
                        <tr key={p.id} className="hover:bg-secondary/30">
                          <td className="px-4 py-3 text-foreground">
                            {p.affiliates?.profiles?.full_name ?? p.affiliates?.profiles?.email ?? "—"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-primary">
                            ${p.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                                statusColors[p.status] ?? "bg-secondary text-foreground"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            {p.status === "pending" && (
                              <button
                                onClick={() => handleMarkPaid(p.id)}
                                className="font-heading rounded-md bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/80"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {payouts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            No pending payouts.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
