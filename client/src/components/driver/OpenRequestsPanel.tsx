/**
 * OpenRequestsPanel â Browse & Claim open move requests.
 *
 * Features:
 *  - Lists all move_requests with status "new" or "matched"
 *  - Filter by urgency and search by city / item description
 *  - Sort by newest, urgency, or city
 *  - "Claim Job" button opens a quote modal
 *  - Quote modal lets the driver enter a price; shows the 30% platform fee
 *    and their net payout before confirming
 *  - On confirm, calls claimRequest() â creates booking + marks request "booked"
 *  - Success state shows booking confirmation card
 *  - Real-time refresh: re-fetches every 30 s so the list stays current
 */

import { useEffect, useState, useCallback, useRef } from "react";
import {
  MapPin,
  Clock,
  Package,
  Zap,
  ChevronDown,
  Search,
  RefreshCw,
  X,
  DollarSign,
  Truck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { getOpenRequests, claimRequest } from "@/lib/db";
import { calcDriverPayout, calcPlatformFee } from "../../../shared/const";
import type { MoveRequest, RequestUrgency } from "@/lib/database.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---- Types ----

interface OpenRequestsPanelProps {
  driverId: string;
  onJobClaimed?: () => void;
}

type SortKey = "newest" | "urgency" | "city";

const URGENCY_ORDER: Record<RequestUrgency, number> = {
  today: 0,
  tomorrow: 1,
  this_week: 2,
  flexible: 3,
};

const URGENCY_LABELS: Record<RequestUrgency, string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  this_week: "This Week",
  flexible: "Flexible",
};

const URGENCY_COLORS: Record<RequestUrgency, string> = {
  today: "text-red-400 bg-red-400/10 border-red-400/20",
  tomorrow: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  this_week: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  flexible: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

// ---- Claim Modal ----

interface ClaimModalProps {
  request: MoveRequest;
  driverId: string;
  onSuccess: (requestId: string) => void;
  onClose: () => void;
}

function ClaimModal({ request, driverId, onSuccess, onClose }: ClaimModalProps) {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const numericPrice = parseFloat(price) || 0;
  const platformFee = calcPlatformFee(numericPrice);
  const driverPayout = calcDriverPayout(numericPrice);
  const isValid = numericPrice >= 1;

  const handleConfirm = async () => {
    if (!isValid) return;
    setLoading(true);
    const { booking, error } = await claimRequest(request.id, driverId, numericPrice);
    setLoading(false);
    if (error || !booking) {
      toast.error(error?.message ?? "Failed to claim job. Please try again.");
      return;
    }
    setConfirmed(true);
    onSuccess(request.id);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="font-heading text-xs font-semibold uppercase tracking-widest text-primary">
              {confirmed ? "Job Claimed!" : "Claim This Job"}
            </p>
            <h3 className="font-heading mt-1 text-xl font-bold uppercase tracking-tight text-foreground">
              {request.pickup_city} â {request.dropoff_city}
            </h3>
          </div>
          {!confirmed && (
            <button
              onClick={onClose}
              className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="p-6">
          {confirmed ? (
            /* ---- Success state ---- */
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-400/10">
                <CheckCircle2 className="size-8 text-green-400" />
              </div>
              <div>
                <p className="font-heading text-lg font-bold uppercase text-foreground">
                  You're Booked!
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This job is now confirmed in your bookings. The customer will be notified.
                </p>
              </div>
              <div className="w-full rounded-lg border border-border bg-secondary/40 p-4 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quoted price</span>
                  <span className="font-semibold text-foreground">${numericPrice.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform fee (15%)</span>
                  <span className="text-muted-foreground">â${platformFee.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-bold">
                  <span className="text-foreground">Your payout</span>
                  <span className="text-primary">${driverPayout.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="font-heading inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/80"
              >
                View My Bookings <ArrowRight className="size-4" />
              </button>
            </div>
          ) : (
            /* ---- Quote form ---- */
            <div className="flex flex-col gap-5">
              {/* Job summary */}
              <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
                <p className="font-semibold text-foreground">{request.item_description}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {request.pickup_city} ({request.pickup_zip}) â {request.dropoff_city} ({request.dropoff_zip})
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="size-3" />
                    {URGENCY_LABELS[request.urgency]}
                  </span>
                  {request.preferred_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(request.preferred_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {request.special_notes && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Notes:</span>{" "}
                    {request.special_notes}
                  </p>
                )}
              </div>

              {/* Price input */}
              <div className="flex flex-col gap-2">
                <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Your Quote (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="number"
                    min="1"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="h-12 w-full rounded-md border border-input bg-background pl-9 pr-4 text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Payout breakdown â shown once a valid price is entered */}
              {isValid && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="font-heading text-xs font-semibold uppercase tracking-widest text-primary">
                    Payout Breakdown
                  </p>
                  <div className="mt-3 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer pays</span>
                      <span className="font-semibold text-foreground">${numericPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform fee (15%)</span>
                      <span className="text-muted-foreground">â${platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-bold">
                      <span className="text-foreground">Your payout</span>
                      <span className="text-primary text-base">${driverPayout.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="font-heading flex-1 rounded-lg border border-border bg-transparent py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!isValid || loading}
                  className="font-heading flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/80 disabled:opacity-40"
                >
                  {loading ? "Claimingâ¦" : "Confirm & Claim"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Request Card ----

interface RequestCardProps {
  request: MoveRequest;
  onClaim: (request: MoveRequest) => void;
  claimed: boolean;
}

function RequestCard({ request, onClaim, claimed }: RequestCardProps) {
  const urgencyStyle = URGENCY_COLORS[request.urgency] ?? "";

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border bg-card p-5 transition-all",
        claimed
          ? "border-green-400/30 bg-green-400/5 opacity-60"
          : "border-border hover:border-primary/30 hover:bg-secondary/40"
      )}
    >
      {/* Top row: route + urgency badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-wide text-foreground">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span className="truncate">
              {request.pickup_city}
              <span className="mx-1 text-muted-foreground">â</span>
              {request.dropoff_city}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {request.pickup_zip} â {request.dropoff_zip}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
            urgencyStyle
          )}
        >
          {URGENCY_LABELS[request.urgency]}
        </span>
      </div>

      {/* Item description */}
      <div className="flex items-start gap-2 text-sm">
        <Package className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-foreground line-clamp-2">{request.item_description}</p>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        {request.preferred_date && (
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {new Date(request.preferred_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {new Date(request.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        {request.customer_name && (
          <span className="flex items-center gap-1 font-medium text-foreground/70">
            {request.customer_name}
          </span>
        )}
      </div>

      {/* Special notes */}
      {request.special_notes && (
        <div className="flex items-start gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-yellow-400" />
          {request.special_notes}
        </div>
      )}

      {/* CTA */}
      {claimed ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
          <CheckCircle2 className="size-4" />
          Job Claimed
        </div>
      ) : (
        <button
          onClick={() => onClaim(request)}
          className="font-heading inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/80 active:scale-[0.97]"
        >
          <Truck className="size-4" />
          Claim This Job
        </button>
      )}
    </div>
  );
}

// ---- Main Panel ----

export function OpenRequestsPanel({ driverId, onJobClaimed }: OpenRequestsPanelProps) {
  const [requests, setRequests] = useState<MoveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<RequestUrgency | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [claimingRequest, setClaimingRequest] = useState<MoveRequest | null>(null);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRequests = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const { data, error } = await getOpenRequests();
    if (!silent) setLoading(false);
    else setRefreshing(false);
    if (error) {
      if (!silent) toast.error("Failed to load requests.");
      return;
    }
    setRequests(data ?? []);
  }, []);

  // Initial load + 30-second polling
  useEffect(() => {
    fetchRequests();
    intervalRef.current = setInterval(() => fetchRequests(true), 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchRequests]);

  const handleClaimSuccess = (requestId: string) => {
    setClaimedIds((prev) => new Set(prev).add(requestId));
    onJobClaimed?.();
    toast.success("Job claimed! See Active Jobs.");
  };

  // ---- Filtering & sorting ----
  const filtered = requests
    .filter((r) => {
      if (urgencyFilter !== "all" && r.urgency !== urgencyFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.pickup_city.toLowerCase().includes(q) ||
          r.dropoff_city.toLowerCase().includes(q) ||
          r.item_description.toLowerCase().includes(q) ||
          (r.pickup_zip ?? "").includes(q) ||
          (r.dropoff_zip ?? "").includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sort === "urgency") {
        return URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
      }
      if (sort === "city") {
        return a.pickup_city.localeCompare(b.pickup_city);
      }
      return 0;
    });

  const urgencies: (RequestUrgency | "all")[] = ["all", "today", "tomorrow", "this_week", "flexible"];

  return (
    <>
      {/* Panel */}
      <div className="flex flex-col gap-6">
        {/* Panel header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-foreground">
              Open Requests
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {loading ? "Loadingâ¦" : `${filtered.length} available job${filtered.length !== 1 ? "s" : ""}`}
              {requests.length > 0 && filtered.length !== requests.length && (
                <span className="ml-1 text-muted-foreground/60">
                  (filtered from {requests.length})
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => fetchRequests(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 self-start rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:self-auto"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, ZIP, or itemâ¦"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-2 self-start text-sm text-muted-foreground hover:text-foreground"
          >
            <SlidersHorizontal className="size-4" />
            Filters & Sort
            <ChevronDown
              className={cn("size-4 transition-transform", filtersOpen && "rotate-180")}
            />
          </button>

          {filtersOpen && (
            <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-secondary/30 p-4">
              {/* Urgency filter */}
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Urgency
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {urgencies.map((u) => (
                    <button
                      key={u}
                      onClick={() => setUrgencyFilter(u)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
                        urgencyFilter === u
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}
                    >
                      {u === "all" ? "All" : URGENCY_LABELS[u]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex flex-col gap-1.5">
                <label className="font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sort By
                </label>
                <div className="flex gap-1.5">
                  {(["newest", "urgency", "city"] as SortKey[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
                        sort === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}
                    >
                      {s === "newest" ? "Newest" : s === "urgency" ? "Urgency" : "City"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Request cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <Package className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-heading text-lg font-bold uppercase text-foreground">
                {search || urgencyFilter !== "all" ? "No Matching Requests" : "No Open Requests"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search || urgencyFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Check back soon â new requests come in throughout the day."}
              </p>
            </div>
            {(search || urgencyFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setUrgencyFilter("all");
                }}
                className="font-heading text-sm font-semibold uppercase tracking-wide text-primary hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onClaim={setClaimingRequest}
                claimed={claimedIds.has(req.id)}
              />
            ))}
          </div>
        )}

        {/* Auto-refresh notice */}
        {!loading && requests.length > 0 && (
          <p className="text-center text-xs text-muted-foreground/50">
            List refreshes automatically every 30 seconds.
          </p>
        )}
      </div>

      {/* Claim modal */}
      {claimingRequest && (
        <ClaimModal
          request={claimingRequest}
          driverId={driverId}
          onSuccess={handleClaimSuccess}
          onClose={() => setClaimingRequest(null)}
        />
      )}
    </>
  );
}
