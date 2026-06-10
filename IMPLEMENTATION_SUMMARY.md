# Dude With A Truck — Full Implementation Summary

---

## 1. Database Tables Created

All tables live in the `public` schema of your Supabase project. Run `supabase/schema.sql` in the Supabase SQL Editor to create them.

| Table | Purpose | Key Columns |
|---|---|---|
| `profiles` | Extends `auth.users`. One row per user, auto-created by a DB trigger on signup. | `id` (FK → auth.users), `email`, `full_name`, `phone`, `role`, `referral_code` |
| `driver_profiles` | Truck details and service area for driver accounts. | `user_id` (FK → profiles), `truck_make`, `truck_model`, `truck_year`, `truck_type`, `service_area`, `is_verified`, `is_active`, `rating`, `total_jobs` |
| `subscriptions` | Driver subscription plan, trial dates, and billing status. | `user_id`, `plan_name`, `monthly_price`, `status`, `trial_start_date`, `trial_end_date`, `stripe_customer_id`, `stripe_subscription_id` |
| `move_requests` | Customer move/haul requests. Supports both guest and authenticated submissions. | `customer_id` (nullable FK), `customer_name`, `customer_phone`, `customer_email`, `pickup_city`, `pickup_zip`, `dropoff_city`, `dropoff_zip`, `item_description`, `preferred_date`, `urgency`, `status` |
| `bookings` | Links a move request to a driver with pricing breakdown. | `request_id`, `driver_id`, `status`, `quoted_price`, `platform_fee` (15%), `driver_payout`, `completed_at` |
| `payments` | All payment transactions (bookings, subscriptions, payouts). | `booking_id`, `subscription_id`, `payer_id`, `payee_id`, `amount`, `payment_type`, `status`, `stripe_payment_intent_id` |
| `affiliates` | Affiliate accounts with unique referral codes. | `user_id`, `referral_code`, `is_active`, `total_referrals`, `total_earned`, `payout_email` |
| `affiliate_referrals` | Tracks which affiliate referred which driver. Payout only triggers after first paid subscription payment. | `affiliate_id`, `referred_driver_id`, `referral_code_used`, `is_payout_eligible`, `first_paid_at` |
| `affiliate_payouts` | $10 payout records per converted driver. Admin marks them paid. | `affiliate_id`, `referral_id`, `amount` (default $10), `status`, `payout_date`, `payment_ref` |

### DB Triggers & Functions

| Name | Fires On | What It Does |
|---|---|---|
| `handle_new_user()` | `AFTER INSERT ON auth.users` | Auto-creates a `profiles` row from `raw_user_meta_data` (full_name, role) |
| `handle_updated_at()` | `BEFORE UPDATE` on every table | Sets `updated_at = NOW()` automatically |

### Indexes

Indexes are created on all foreign keys and frequently filtered columns: `profiles.role`, `subscriptions.status`, `move_requests.status`, `move_requests.customer_id`, `bookings.driver_id`, `affiliate_referrals.affiliate_id`, etc.

---

## 2. Auth Roles

Supabase Auth is used for authentication. Role assignment is stored in `profiles.role` (not in Supabase Auth metadata directly, though it is passed via `raw_user_meta_data` at signup and copied by the trigger).

| Role | How Assigned | Access |
|---|---|---|
| `customer` | Default for all signups via the Login/Signup modal | Submit move requests, view own requests at `/dashboard` |
| `driver` | Set during driver signup via `DriverSignupModal` | View subscription, bookings, browse & claim open requests at `/dashboard` |
| `admin` | Manually set in Supabase Table Editor (`profiles.role = 'admin'`) | Full read access to all data at `/admin` |
| `affiliate` | Manually set by admin + row inserted into `affiliates` table | View referral stats and payout history at `/dashboard` |

> **To create your first admin:** Sign up normally, then in Supabase → Table Editor → `profiles`, find your row and change `role` to `admin`.

---

## 3. Forms Connected to Supabase

### Driver Signup Form (`DriverSignupModal.tsx`)
**Triggered by:** "Claim Founders Rate" / "Get Started" buttons in the Pricing section, and "List My Truck" in the header.

**On submit (2-step form):**
1. Calls `supabase.auth.signUp()` with `role: "driver"` in metadata
2. DB trigger auto-creates `profiles` row
3. Updates `profiles.role = "driver"` explicitly
4. Calls `upsertDriverProfile()` → inserts into `driver_profiles`
5. Calls `createFoundersSubscription()` or `createStandardSubscription()` → inserts into `subscriptions`
   - **Founders Special:** `status = "trialing"`, `trial_start_date = now`, `trial_end_date = now + 30 days`, `monthly_price = 14.50`
   - **Standard:** `status = "active"`, `monthly_price = 29.00`
6. If a referral code was entered: looks up `affiliates` by code, calls `recordAffiliateReferral()` → inserts into `affiliate_referrals`
7. Signs the user in and redirects to `/dashboard`

### Customer Request Form (`CustomerRequestModal.tsx`)
**Triggered by:** "Find a Dude Near You" (Hero), "Get a Free Quote" (footer), and the hero CTA.

**On submit:**
1. Calls `createMoveRequest()` → inserts into `move_requests` with `status = "new"`
2. If the user is logged in, attaches their `customer_id`; guest submissions are also supported (nullable `customer_id`)
3. Shows a success confirmation state

### Login / Customer Signup Form (`AuthModal.tsx`)
**Triggered by:** "Log In" button in the header.

**Login tab:**
- Calls `supabase.auth.signInWithPassword()`
- On success, `AuthContext` updates via `onAuthStateChange`, redirects to `/dashboard`

**Sign Up tab:**
- Calls `supabase.auth.signUp()` with `role: "customer"`
- DB trigger auto-creates `profiles` row
- Shows "Check your email to confirm" message

### Claim Job Flow (`OpenRequestsPanel.tsx` + `ClaimModal`)
**Triggered by:** "Claim This Job" button on any open request card in the driver dashboard Browse Jobs tab.

**On confirm:**
1. Calls `claimRequest(requestId, driverId, quotedPrice)` which:
   - Inserts into `bookings` with `status = "confirmed"`, `platform_fee = 15%`, `driver_payout = quoted - fee`
   - Updates `move_requests.status = "booked"`
2. Shows success confirmation with payout breakdown

### Mark Complete Action (Driver Dashboard)
**Triggered by:** "Mark Complete" button on a confirmed booking in the Overview tab.

**On confirm:**
1. Calls `updateBookingStatus(bookingId, "completed", notes)`
2. Sets `completed_at = now` and optional `completion_notes`

---

## 4. Environment Variables

| Variable | Value | Where Used |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://cfkvfmdjbeyemencgbxx.supabase.co` | `client/src/lib/supabase.ts` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_c9Y0kf7TAMPbLilyo-15EA_XyXMT2A3` | `client/src/lib/supabase.ts` |

> **Current state:** Both values are hardcoded as fallbacks directly in `supabase.ts` so the app works in the Manus preview environment without a `.env` file. If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are set as environment variables (e.g. in Vercel), those will override the hardcoded values automatically.

> **For Vercel deployment:** Add both variables in Vercel → Project Settings → Environment Variables.

> **Note:** The `sb_publishable_*` key is Supabase's new publishable key format (equivalent to the `anon` key). It is safe to expose in browser code — it is restricted by RLS policies.

---

## 5. Supabase RLS Policies

Row Level Security is enabled on all 9 tables. Policies enforce that users can only access their own data, with admins having full access.

### `profiles`
| Policy | Operation | Condition |
|---|---|---|
| Users can view their own profile | SELECT | `auth.uid() = id` |
| Users can update their own profile | UPDATE | `auth.uid() = id` |
| Admins can view all profiles | SELECT | `is_admin()` |
| Admins can update all profiles | UPDATE | `is_admin()` |

### `driver_profiles`
| Policy | Operation | Condition |
|---|---|---|
| Drivers can manage their own driver profile | ALL | `auth.uid() = user_id` |
| Anyone can view active driver profiles | SELECT | `is_active = TRUE` |
| Admins can manage all driver profiles | ALL | `is_admin()` |

### `subscriptions`
| Policy | Operation | Condition |
|---|---|---|
| Drivers can view their own subscription | SELECT | `auth.uid() = user_id` |
| Admins can manage all subscriptions | ALL | `is_admin()` |

### `move_requests`
| Policy | Operation | Condition |
|---|---|---|
| Customers can view their own requests | SELECT | `auth.uid() = customer_id` |
| Customers can insert requests | INSERT | `TRUE` (allows guest submissions) |
| Drivers can view new/matched requests | SELECT | `status IN ('new','matched')` AND user has `role = 'driver'` |
| Admins can manage all requests | ALL | `is_admin()` |

### `bookings`
| Policy | Operation | Condition |
|---|---|---|
| Drivers can view their own bookings | SELECT | `auth.uid() = driver_id` |
| Customers can view bookings for their requests | SELECT | Request's `customer_id = auth.uid()` |
| Admins can manage all bookings | ALL | `is_admin()` |

### `payments`
| Policy | Operation | Condition |
|---|---|---|
| Users can view their own payments | SELECT | `auth.uid() = payer_id OR auth.uid() = payee_id` |
| Admins can manage all payments | ALL | `is_admin()` |

### `affiliates`, `affiliate_referrals`, `affiliate_payouts`
Each has a self-access SELECT policy and an admin ALL policy following the same pattern.

### Helper Function
```sql
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
```

---

## 6. Files Created or Modified

### New Files (all written from scratch)

| File | Purpose |
|---|---|
| `supabase/schema.sql` | Complete SQL schema: all 9 tables, triggers, RLS policies, indexes |
| `SETUP.md` | Step-by-step setup guide (Supabase, env vars, Vercel, admin user, affiliate system) |
| `IMPLEMENTATION_SUMMARY.md` | This file |
| `client/src/lib/supabase.ts` | Supabase client singleton with credential fallbacks |
| `client/src/lib/database.types.ts` | TypeScript types for all 9 tables + Database type map |
| `client/src/lib/db.ts` | All database helper functions (profiles, drivers, subscriptions, requests, bookings, payments, affiliates, payouts, admin helpers) |
| `client/src/contexts/AuthContext.tsx` | Auth state context: user, profile, signUp, signIn, signOut, refreshProfile |
| `client/src/components/auth/AuthModal.tsx` | Login + customer signup modal |
| `client/src/components/forms/DriverSignupModal.tsx` | 2-step driver signup with subscription logic |
| `client/src/components/forms/CustomerRequestModal.tsx` | Customer move request form |
| `client/src/components/driver/OpenRequestsPanel.tsx` | Browse open requests with search/filter/sort + ClaimModal |
| `client/src/components/layout/SiteHeader.tsx` | Header with auth-aware nav (login, user menu, sign out) |
| `client/src/components/sections/Hero.tsx` | Hero section (preserves original design, adds request modal CTA) |
| `client/src/components/sections/FeaturedDudes.tsx` | Driver profile cards |
| `client/src/components/sections/StatsBar.tsx` | Stats strip |
| `client/src/components/sections/Services.tsx` | Services grid |
| `client/src/components/sections/HowItWorks.tsx` | How it works section |
| `client/src/components/sections/Pricing.tsx` | Pricing tiers with driver signup modal triggers |
| `client/src/components/sections/CtaFooter.tsx` | CTA banner + footer |
| `client/src/pages/Home.tsx` | Public landing page (all sections) |
| `client/src/pages/Dashboard.tsx` | Role-based dashboard (customer / driver / affiliate) |
| `client/src/pages/AdminDashboard.tsx` | Admin control panel (drivers, customers, requests, bookings, payouts) |

### Modified Files

| File | Change |
|---|---|
| `client/src/App.tsx` | Added `AuthProvider`, routes for `/dashboard` and `/admin` |
| `client/src/index.css` | Replaced default theme with original dark theme (Oswald font, blue primary) |
| `client/index.html` | Added Oswald + Geist Google Fonts |

---

## 7. What Still Needs to Be Tested

The following flows should be verified end-to-end after running `supabase/schema.sql`:

### Critical Path (test first)
- [ ] **Driver signup — Founders Special:** Complete the 2-step form → verify rows in `profiles`, `driver_profiles`, `subscriptions` (status = `trialing`, trial dates set, price = 14.50)
- [ ] **Driver signup — Standard:** Same flow → verify `subscriptions.status = active`, price = 29.00
- [ ] **Customer request form:** Submit a move request as a guest (not logged in) → verify row in `move_requests` with `status = new` and `customer_id = null`
- [ ] **Customer request form (logged in):** Submit while authenticated → verify `customer_id` is populated
- [ ] **Login:** Sign in with a created account → verify redirect to `/dashboard` and correct role shown
- [ ] **Customer dashboard:** Verify move requests list loads correctly
- [ ] **Driver dashboard — Overview:** Verify subscription card, stats, and bookings list render
- [ ] **Driver dashboard — Browse Jobs:** Verify open requests load; claim a job → verify booking row created and request status changes to `booked`
- [ ] **Mark Complete:** On a confirmed booking, click "Mark Complete" → verify `bookings.status = completed` and `completed_at` is set

### Auth Edge Cases
- [ ] **Email confirmation:** If Supabase email confirmation is enabled, verify the confirmation email arrives and the link works
- [ ] **Sign out:** Verify session is cleared and user is redirected to home
- [ ] **Protected routes:** Verify `/dashboard` redirects to `/` when not logged in
- [ ] **Admin route:** Verify `/admin` redirects non-admin users to `/dashboard`

### Admin Panel
- [ ] **Drivers tab:** Verify driver list loads with subscription status
- [ ] **Customers tab:** Verify customer list loads
- [ ] **Requests tab:** Verify all move requests display with correct status badges
- [ ] **Bookings tab:** Verify bookings display with pricing breakdown
- [ ] **Payouts tab:** Verify pending affiliate payouts display; test "Mark Paid" flow

### Affiliate System
- [ ] **Referral code at signup:** Sign up as a driver with a valid referral code → verify `affiliate_referrals` row is created with `is_payout_eligible = false`
- [ ] **Invalid referral code:** Verify signup still completes (referral code lookup failure is non-fatal)
- [ ] **Payout eligibility:** After a driver's first paid subscription payment, manually call `markReferralPayoutEligible()` or trigger via Stripe webhook → verify `is_payout_eligible = true` and a `$10` row appears in `affiliate_payouts`

### Not Yet Implemented (future work)
- **Stripe billing:** The `subscriptions` table has `stripe_customer_id` and `stripe_subscription_id` columns ready, but no Stripe checkout flow exists yet. Drivers are not actually charged after the trial ends.
- **Email notifications:** No emails are sent when a request is submitted, a job is claimed, or a booking is completed.
- **Driver profile edit page:** Drivers cannot update their truck details or bio from the dashboard yet.
- **Supabase Realtime:** The Browse Jobs panel polls every 30 seconds instead of using a live subscription.
- **Password reset:** No "Forgot password" flow is implemented.
- **Driver verification workflow:** `driver_profiles.is_verified` exists in the DB but there is no admin UI to approve/reject drivers.
