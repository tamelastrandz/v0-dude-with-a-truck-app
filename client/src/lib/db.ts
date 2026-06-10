/**
 * Database helper functions.
 *
 * Each function wraps a Supabase query and returns a typed result.
 * Import these throughout the app instead of writing raw Supabase queries.
 *
 * Note: We use `as any` casts on Supabase insert/update calls because the
 * auto-generated Database generic type map causes TypeScript to infer `never`
 * for table-specific insert/update payloads in some versions of @supabase/supabase-js.
 * The runtime behaviour is fully correct.
 *
 * Sections:
 *  - Profiles
 *  - Driver Profiles
 *  - Subscriptions
 *  - Move Requests
 *  - Bookings
 *  - Payments
 *  - Affiliates
 *  - Affiliate Referrals
 *  - Affiliate Payouts
 *  - Admin helpers
 */

import { supabase } from "./supabase";
import type {
  Profile,
  DriverProfile,
  Subscription,
  MoveRequest,
  Booking,
  Payment,
  Affiliate,
  AffiliateReferral,
  AffiliatePayout,
  SubscriptionStatus,
} from "./database.types";

// Helper: add N days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================================
// PROFILES
// ============================================================

/** Fetch a single profile by user ID */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { data: data as Profile | null, error };
}

/** Update a user's profile fields */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, "id" | "created_at">>
) {
  const { data, error } = await (supabase
    .from("profiles") as any)
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  return { data: data as Profile | null, error };
}

// ============================================================
// DRIVER PROFILES
// ============================================================

/** Fetch driver profile by user ID */
export async function getDriverProfile(userId: string) {
  const { data, error } = await supabase
    .from("driver_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  return { data: data as DriverProfile | null, error };
}

/** Create or update a driver profile */
export async function upsertDriverProfile(
  profile: Omit<DriverProfile, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await (supabase
    .from("driver_profiles") as any)
    .upsert(profile, { onConflict: "user_id" })
    .select()
    .single();
  return { data: data as DriverProfile | null, error };
}

/** List all active drivers (for public directory) */
export async function listActiveDrivers() {
  const { data, error } = await supabase
    .from("driver_profiles")
    .select("*, profiles(*)")
    .eq("is_active", true)
    .order("rating", { ascending: false });
  return { data, error };
}

// ============================================================
// SUBSCRIPTIONS
// ============================================================

/**
 * Create a Founders Special subscription for a new driver.
 * - 30-day free trial
 * - $14.50/month after trial
 * - status: "trialing"
 */
export async function createFoundersSubscription(userId: string) {
  const now = new Date();
  const trialEnd = addDays(now, 30);

  const payload = {
    user_id: userId,
    plan_name: "Founders Special",
    monthly_price: 14.5,
    status: "trialing" as SubscriptionStatus,
    trial_start_date: now.toISOString(),
    trial_end_date: trialEnd.toISOString(),
  };

  const { data, error } = await (supabase
    .from("subscriptions") as any)
    .insert(payload)
    .select()
    .single();

  return { data: data as Subscription | null, error };
}

/**
 * Create a Standard subscription for a driver.
 * - No trial
 * - $29/month
 * - status: "active"
 */
export async function createStandardSubscription(userId: string) {
  const now = new Date();
  const periodEnd = addDays(now, 30);

  const payload = {
    user_id: userId,
    plan_name: "Standard",
    monthly_price: 29.0,
    status: "active" as SubscriptionStatus,
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
  };

  const { data, error } = await (supabase
    .from("subscriptions") as any)
    .insert(payload)
    .select()
    .single();

  return { data: data as Subscription | null, error };
}

/** Get the active subscription for a user */
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return { data: data as Subscription | null, error };
}

/** Update subscription status (e.g. trialing → active after first payment) */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus
) {
  const { data, error } = await (supabase
    .from("subscriptions") as any)
    .update({ status })
    .eq("id", subscriptionId)
    .select()
    .single();
  return { data: data as Subscription | null, error };
}

// ============================================================
// MOVE REQUESTS
// ============================================================

/** Submit a new customer move request */
export async function createMoveRequest(
  request: Omit<MoveRequest, "id" | "created_at" | "updated_at" | "status">
) {
  const { data, error } = await (supabase
    .from("move_requests") as any)
    .insert({ ...request, status: "new" })
    .select()
    .single();
  return { data: data as MoveRequest | null, error };
}

/** Get all requests for a customer */
export async function getCustomerRequests(customerId: string) {
  const { data, error } = await supabase
    .from("move_requests")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return { data: data as MoveRequest[] | null, error };
}

/** Get open requests visible to drivers */
export async function getOpenRequests() {
  const { data, error } = await supabase
    .from("move_requests")
    .select("*")
    .in("status", ["new", "matched"])
    .order("created_at", { ascending: false });
  return { data: data as MoveRequest[] | null, error };
}

/** Update a request's status */
export async function updateRequestStatus(
  requestId: string,
  status: MoveRequest["status"]
) {
  const { data, error } = await (supabase
    .from("move_requests") as any)
    .update({ status })
    .eq("id", requestId)
    .select()
    .single();
  return { data: data as MoveRequest | null, error };
}

// ============================================================
// BOOKINGS
// ============================================================

/** Create a booking linking a request to a driver */
export async function createBooking(
  booking: Omit<Booking, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await (supabase
    .from("bookings") as any)
    .insert(booking)
    .select()
    .single();
  return { data: data as Booking | null, error };
}

/** Get all bookings for a driver */
export async function getDriverBookings(driverId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, move_requests(*)")
    .eq("driver_id", driverId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// ============================================================
// PAYMENTS
// ============================================================

/** Record a payment transaction */
export async function recordPayment(
  payment: Omit<Payment, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await (supabase
    .from("payments") as any)
    .insert(payment)
    .select()
    .single();
  return { data: data as Payment | null, error };
}

// ============================================================
// AFFILIATES
// ============================================================

/** Look up an affiliate by their referral code */
export async function getAffiliateByCode(code: string) {
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("referral_code", code)
    .eq("is_active", true)
    .single();
  return { data: data as Affiliate | null, error };
}

/** Get an affiliate record by user ID */
export async function getAffiliateByUserId(userId: string) {
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", userId)
    .single();
  return { data: data as Affiliate | null, error };
}

/** Create an affiliate account for a user */
export async function createAffiliate(
  userId: string,
  referralCode: string,
  payoutEmail?: string
) {
  const payload = {
    user_id: userId,
    referral_code: referralCode,
    payout_email: payoutEmail ?? null,
  };
  const { data, error } = await (supabase
    .from("affiliates") as any)
    .insert(payload)
    .select()
    .single();
  return { data: data as Affiliate | null, error };
}

// ============================================================
// AFFILIATE REFERRALS
// ============================================================

/**
 * Record that a driver signed up using an affiliate referral code.
 * Called during driver signup if a referral code was provided.
 */
export async function recordAffiliateReferral(
  affiliateId: string,
  referredDriverId: string,
  referralCode: string
) {
  const payload = {
    affiliate_id: affiliateId,
    referred_driver_id: referredDriverId,
    referral_code_used: referralCode,
    is_payout_eligible: false,
  };
  const { data, error } = await (supabase
    .from("affiliate_referrals") as any)
    .insert(payload)
    .select()
    .single();
  return { data: data as AffiliateReferral | null, error };
}

/**
 * Mark a referral as payout-eligible after the driver's first paid subscription payment.
 * This should be called from a webhook handler (e.g. Stripe webhook) when
 * a subscription payment succeeds for the first time.
 */
export async function markReferralPayoutEligible(referredDriverId: string) {
  const now = new Date().toISOString();
  const { data, error } = await (supabase
    .from("affiliate_referrals") as any)
    .update({ is_payout_eligible: true, first_paid_at: now })
    .eq("referred_driver_id", referredDriverId)
    .eq("is_payout_eligible", false)
    .select()
    .single();
  return { data: data as AffiliateReferral | null, error };
}

// ============================================================
// AFFILIATE PAYOUTS
// ============================================================

/**
 * Create a $10 payout record for an affiliate after their referred driver converts.
 * Status starts as "pending" — admin marks it "paid" after sending the payment.
 */
export async function createAffiliatePayout(
  affiliateId: string,
  referralId: string
) {
  const payload = {
    affiliate_id: affiliateId,
    referral_id: referralId,
    amount: 10.0,
    status: "pending",
  };
  const { data, error } = await (supabase
    .from("affiliate_payouts") as any)
    .insert(payload)
    .select()
    .single();
  return { data: data as AffiliatePayout | null, error };
}

/** Get all payouts for an affiliate */
export async function getAffiliatePayouts(affiliateId: string) {
  const { data, error } = await supabase
    .from("affiliate_payouts")
    .select("*, affiliate_referrals(*)")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });
  return { data: data as AffiliatePayout[] | null, error };
}

// ============================================================
// ADMIN HELPERS
// ============================================================
// These functions are intended for use in the admin dashboard only.
// They rely on the admin having the 'admin' role in their profile,
// which is enforced by RLS policies in the database.

/** Admin: list all profiles with optional role filter */
export async function adminListProfiles(role?: string) {
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (role) query = (query as any).eq("role", role);
  const { data, error } = await query;
  return { data: data as Profile[] | null, error };
}

/** Admin: list all move requests */
export async function adminListRequests() {
  const { data, error } = await supabase
    .from("move_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data as MoveRequest[] | null, error };
}

/** Admin: list all bookings with driver and request info */
export async function adminListBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, move_requests(*), profiles!bookings_driver_id_fkey(*)")
    .order("created_at", { ascending: false });
  return { data, error };
}

/** Admin: list all pending affiliate payouts */
export async function adminListPendingPayouts() {
  const { data, error } = await supabase
    .from("affiliate_payouts")
    .select("*, affiliates(*, profiles(*))")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return { data, error };
}

/** Admin: mark an affiliate payout as paid */
export async function adminMarkPayoutPaid(
  payoutId: string,
  paymentRef: string,
  paymentMethod: string
) {
  const { data, error } = await (supabase
    .from("affiliate_payouts") as any)
    .update({
      status: "paid",
      payout_date: new Date().toISOString(),
      payment_ref: paymentRef,
      payment_method: paymentMethod,
    })
    .eq("id", payoutId)
    .select()
    .single();
  return { data: data as AffiliatePayout | null, error };
}

/** Admin: list all subscriptions */
export async function adminListSubscriptions() {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });
  return { data, error };
}
