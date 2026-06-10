/**
 * TypeScript types generated from the Supabase schema.
 * These match the tables defined in supabase/schema.sql.
 *
 * To regenerate from a live project run:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > client/src/lib/database.types.ts
 */

export type UserRole = "customer" | "driver" | "admin" | "affiliate";
export type RequestStatus = "new" | "matched" | "booked" | "completed" | "canceled";
export type RequestUrgency = "today" | "tomorrow" | "this_week" | "flexible";
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "canceled";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "paused";
export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "refunded";
export type PaymentType = "booking_payment" | "subscription_payment" | "driver_payout" | "affiliate_payout";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

// ---- Row types ----

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  referral_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  truck_make: string | null;
  truck_model: string | null;
  truck_year: number | null;
  truck_type: string | null;
  truck_capacity: string | null;
  license_plate: string | null;
  service_area: string | null;
  service_radius_miles: number | null;
  bio: string | null;
  profile_photo_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  rating: number | null;
  total_jobs: number | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  monthly_price: number;
  status: SubscriptionStatus;
  trial_start_date: string | null;
  trial_end_date: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoveRequest {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  pickup_address: string | null;
  pickup_city: string;
  pickup_zip: string;
  dropoff_address: string | null;
  dropoff_city: string;
  dropoff_zip: string;
  item_description: string;
  preferred_date: string | null;
  urgency: RequestUrgency;
  estimated_weight: string | null;
  special_notes: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  request_id: string;
  driver_id: string;
  status: BookingStatus;
  quoted_price: number | null;
  platform_fee: number | null;
  driver_payout: number | null;
  completion_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string | null;
  subscription_id: string | null;
  payer_id: string | null;
  payee_id: string | null;
  amount: number;
  currency: string;
  payment_type: PaymentType;
  status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  is_active: boolean;
  total_referrals: number;
  total_earned: number;
  payout_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface AffiliateReferral {
  id: string;
  affiliate_id: string;
  referred_driver_id: string;
  referral_code_used: string;
  is_payout_eligible: boolean;
  first_paid_at: string | null;
  created_at: string;
}

export interface AffiliatePayout {
  id: string;
  affiliate_id: string;
  referral_id: string;
  amount: number;
  status: PayoutStatus;
  payout_date: string | null;
  payment_method: string | null;
  payment_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Database type map (for createClient<Database>) ----

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      driver_profiles: {
        Row: DriverProfile;
        Insert: Omit<DriverProfile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DriverProfile, "id" | "created_at">>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subscription, "id" | "created_at">>;
      };
      move_requests: {
        Row: MoveRequest;
        Insert: Omit<MoveRequest, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<MoveRequest, "id" | "created_at">>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Booking, "id" | "created_at">>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Payment, "id" | "created_at">>;
      };
      affiliates: {
        Row: Affiliate;
        Insert: Omit<Affiliate, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Affiliate, "id" | "created_at">>;
      };
      affiliate_referrals: {
        Row: AffiliateReferral;
        Insert: Omit<AffiliateReferral, "id" | "created_at">;
        Update: Partial<Omit<AffiliateReferral, "id" | "created_at">>;
      };
      affiliate_payouts: {
        Row: AffiliatePayout;
        Insert: Omit<AffiliatePayout, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<AffiliatePayout, "id" | "created_at">>;
      };
    };
  };
}
