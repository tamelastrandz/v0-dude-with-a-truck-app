-- =============================================================================
-- DUDE WITH A TRUCK — Supabase SQL Schema
-- =============================================================================
-- Run this entire file in the Supabase SQL Editor to set up your database.
-- Tables: profiles, driver_profiles, move_requests, bookings, payments,
--         subscriptions, affiliates, affiliate_referrals, affiliate_payouts
-- =============================================================================

-- Enable UUID extension (already enabled on Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. PROFILES
-- Extends Supabase auth.users with role and contact info.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('customer', 'driver', 'admin', 'affiliate')),
  avatar_url    TEXT,
  city          TEXT,
  state         TEXT,
  zip           TEXT,
  referral_code TEXT UNIQUE, -- affiliate referral code used at signup
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Automatically create a profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 2. DRIVER PROFILES
-- Extended info for drivers, including truck details and verification status.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  truck_make          TEXT,
  truck_model         TEXT,
  truck_year          INTEGER,
  truck_type          TEXT,   -- e.g. "pickup", "box truck", "flatbed"
  truck_capacity      TEXT,   -- e.g. "1/2 ton", "1 ton"
  license_plate       TEXT,
  service_area        TEXT,   -- city / metro description
  service_radius_miles INTEGER DEFAULT 25,
  bio                 TEXT,
  profile_photo_url   TEXT,
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  featured_until      TIMESTAMPTZ,
  featured_sort       INTEGER,
  rating              NUMERIC(3,2) DEFAULT 0.0,
  total_jobs          INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TRIGGER driver_profiles_updated_at
  BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 3. SUBSCRIPTIONS
-- Tracks driver subscription plans (Founders Special, Standard, etc.).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_key            TEXT,
  plan_name           TEXT NOT NULL,           -- "Founders Special" | "Standard" | "Founders Annual"
  billing_interval    TEXT NOT NULL DEFAULT 'month'
                        CHECK (billing_interval IN ('month', 'year')),
  monthly_price       NUMERIC(10,2) NOT NULL,  -- per billing period (14.50 | 29.00 | 299.00)
  status              TEXT NOT NULL DEFAULT 'trialing'
                        CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'paused')),
  trial_start_date    TIMESTAMPTZ,
  trial_end_date      TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  stripe_customer_id   TEXT,
  stripe_subscription_id TEXT,
  canceled_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 4. MOVE REQUESTS
-- Customer requests for truck/moving help.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.move_requests (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Contact info (stored directly so guest requests are also supported)
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  -- Pickup location
  pickup_address   TEXT,
  pickup_city      TEXT NOT NULL,
  pickup_zip       TEXT NOT NULL,
  -- Dropoff location
  dropoff_address  TEXT,
  dropoff_city     TEXT NOT NULL,
  dropoff_zip      TEXT NOT NULL,
  -- Job details
  item_description TEXT NOT NULL,
  preferred_date   DATE,
  urgency          TEXT NOT NULL DEFAULT 'flexible'
                     CHECK (urgency IN ('today', 'tomorrow', 'this_week', 'flexible')),
  estimated_weight TEXT,
  special_notes    TEXT,
  -- Status lifecycle: new → matched → booked → completed | canceled
  status           TEXT NOT NULL DEFAULT 'new'
                     CHECK (status IN ('new', 'matched', 'booked', 'completed', 'canceled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER move_requests_updated_at
  BEFORE UPDATE ON public.move_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 5. BOOKINGS
-- Links a move request to a specific driver with pricing details.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id          UUID NOT NULL REFERENCES public.move_requests(id) ON DELETE CASCADE,
  driver_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'canceled')),
  quoted_price        NUMERIC(10,2),
  platform_fee        NUMERIC(10,2),  -- platform takes 30% (see shared/const.ts)
  driver_payout       NUMERIC(10,2),  -- quoted_price - platform_fee
  completion_notes    TEXT,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 6. PAYMENTS
-- Records payment transactions (customer payments, driver payouts).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id          UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  subscription_id     UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payer_id            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  payee_id            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'usd',
  payment_type        TEXT NOT NULL
                        CHECK (payment_type IN ('booking_payment', 'subscription_payment', 'driver_payout', 'affiliate_payout')),
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_charge_id    TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 7. AFFILIATES
-- Affiliate accounts with their unique referral code.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.affiliates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code   TEXT NOT NULL UNIQUE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  total_referrals INTEGER DEFAULT 0,
  total_earned    NUMERIC(10,2) DEFAULT 0.00,
  payout_email    TEXT,   -- PayPal / Venmo / bank email for payouts
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TRIGGER affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 8. AFFILIATE REFERRALS
-- Tracks which affiliate referred which driver.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id        UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_driver_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code_used  TEXT NOT NULL,
  -- Payout becomes eligible only after the driver makes their first paid subscription payment
  is_payout_eligible  BOOLEAN NOT NULL DEFAULT FALSE,
  first_paid_at       TIMESTAMPTZ,   -- when the driver's first real payment cleared
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referred_driver_id)  -- a driver can only be referred once
);

-- =============================================================================
-- 9. AFFILIATE PAYOUTS
-- Records $10 payouts to affiliates per converted driver.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id    UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_id     UUID NOT NULL REFERENCES public.affiliate_referrals(id) ON DELETE CASCADE,
  amount          NUMERIC(10,2) NOT NULL DEFAULT 10.00,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  payout_date     TIMESTAMPTZ,
  payment_method  TEXT,   -- "paypal", "venmo", "bank_transfer"
  payment_ref     TEXT,   -- external transaction reference
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER affiliate_payouts_updated_at
  BEFORE UPDATE ON public.affiliate_payouts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ---- PROFILES ----
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE USING (public.is_admin());

-- ---- DRIVER PROFILES ----
CREATE POLICY "Drivers can manage their own driver profile"
  ON public.driver_profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND id = user_id)
  );

CREATE POLICY "Anyone can view active driver profiles"
  ON public.driver_profiles FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage all driver profiles"
  ON public.driver_profiles FOR ALL USING (public.is_admin());

-- ---- SUBSCRIPTIONS ----
CREATE POLICY "Drivers can view their own subscription"
  ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions FOR ALL USING (public.is_admin());

-- ---- MOVE REQUESTS ----
CREATE POLICY "Customers can view their own requests"
  ON public.move_requests FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can insert requests"
  ON public.move_requests FOR INSERT WITH CHECK (TRUE); -- allow guest requests too

CREATE POLICY "Drivers can view new/matched requests"
  ON public.move_requests FOR SELECT USING (
    status IN ('new', 'matched') AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'driver')
  );

CREATE POLICY "Admins can manage all requests"
  ON public.move_requests FOR ALL USING (public.is_admin());

-- ---- BOOKINGS ----
CREATE POLICY "Drivers can view their own bookings"
  ON public.bookings FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Customers can view bookings for their requests"
  ON public.bookings FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.move_requests mr
      WHERE mr.id = request_id AND mr.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL USING (public.is_admin());

CREATE POLICY "Drivers can insert their own bookings"
  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update their own bookings"
  ON public.bookings FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can mark requests booked"
  ON public.move_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'driver')
  );

-- ---- CONVERSATIONS & MESSAGES ----
CREATE TABLE IF NOT EXISTS public.conversations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id   UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body             TEXT NOT NULL,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking parties can view conversations"
  ON public.conversations FOR SELECT USING (
    auth.uid() = customer_id OR auth.uid() = driver_id
  );

CREATE POLICY "Booking parties can create conversations"
  ON public.conversations FOR INSERT WITH CHECK (
    auth.uid() = customer_id OR auth.uid() = driver_id
  );

CREATE POLICY "Conversation participants can view messages"
  ON public.messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = auth.uid() OR c.driver_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.customer_id = auth.uid() OR c.driver_id = auth.uid())
    )
  );

-- ---- PAYMENTS ----
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT USING (
    auth.uid() = payer_id OR auth.uid() = payee_id
  );

CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL USING (public.is_admin());

-- ---- AFFILIATES ----
CREATE POLICY "Affiliates can view their own record"
  ON public.affiliates FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affiliate record"
  ON public.affiliates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Affiliates can update their own record"
  ON public.affiliates FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all affiliates"
  ON public.affiliates FOR ALL USING (public.is_admin());

-- ---- AFFILIATE REFERRALS ----
CREATE POLICY "Affiliates can view their own referrals"
  ON public.affiliate_referrals FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_id AND user_id = auth.uid())
  );

CREATE POLICY "Drivers can record their own affiliate referral"
  ON public.affiliate_referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_driver_id);

CREATE POLICY "Admins can manage all referrals"
  ON public.affiliate_referrals FOR ALL USING (public.is_admin());

-- ---- AFFILIATE PAYOUTS ----
CREATE POLICY "Affiliates can view their own payouts"
  ON public.affiliate_payouts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all payouts"
  ON public.affiliate_payouts FOR ALL USING (public.is_admin());

-- =============================================================================
-- INDEXES for common query patterns
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_id ON public.driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_is_active ON public.driver_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_key ON public.subscriptions(plan_key) WHERE plan_key = 'founders_annual';
CREATE INDEX IF NOT EXISTS idx_driver_profiles_featured ON public.driver_profiles(is_featured, featured_until) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_move_requests_customer_id ON public.move_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_move_requests_status ON public.move_requests(status);
CREATE INDEX IF NOT EXISTS idx_bookings_request_id ON public.bookings(request_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON public.bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_conversations_booking_id ON public.conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON public.affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_driver_id ON public.affiliate_referrals(referred_driver_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);
