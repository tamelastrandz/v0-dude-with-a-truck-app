# Dude With A Truck — Setup & Deployment Guide

## Overview

This document covers everything you need to go from zero to a live, production-ready deployment of the Dude With A Truck platform.

---

## 1. Supabase Project Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project** and fill in the project name, database password, and region.
3. Wait for the project to provision (about 60 seconds).

### 1.2 Run the SQL Schema

1. In the Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Open the file `supabase/schema.sql` from this project.
4. Paste the entire contents into the SQL editor.
5. Click **Run** (or press `Cmd+Enter`).

This creates all tables, triggers, RLS policies, and indexes in one shot.

### 1.3 Get Your API Keys

1. In the Supabase dashboard, go to **Project Settings → API**.
2. Copy:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **anon / public key** → this is your `VITE_SUPABASE_ANON_KEY`

---

## 2. Environment Variables

The app requires two environment variables. These must be prefixed with `VITE_` so Vite exposes them to the browser.

| Variable | Description | Where to Find |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Supabase → Settings → API |

### For Local Development

Create a `.env` file in the project root (never commit this):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### For Vercel Deployment

1. Go to your Vercel project → **Settings → Environment Variables**.
2. Add both variables above for **Production**, **Preview**, and **Development** environments.

### For Manus Deployment

1. Open the project in Manus.
2. Go to **Settings → Secrets**.
3. Add both variables.

---

## 3. Supabase Auth Configuration

### 3.1 Email Confirmation (Optional)

By default, Supabase requires email confirmation before users can log in. For a smoother onboarding experience during development, you can disable this:

1. Go to **Authentication → Providers → Email**.
2. Toggle off **Confirm email**.

For production, leave email confirmation enabled.

### 3.2 Site URL

1. Go to **Authentication → URL Configuration**.
2. Set **Site URL** to your production domain (e.g., `https://dudewithatruck.com`).
3. Add your local dev URL to **Redirect URLs**: `http://localhost:3000/**`.

---

## 4. Creating an Admin User

After deploying, you need to manually promote a user to the `admin` role:

1. Sign up normally through the app.
2. In the Supabase dashboard, go to **Table Editor → profiles**.
3. Find your user row and change the `role` column from `customer` to `admin`.
4. Log out and back in. You can now access `/admin`.

---

## 5. Affiliate System Setup

### How It Works

1. An affiliate signs up and is assigned a unique referral code (e.g., `DUDE-JOHN`).
2. When a driver signs up using that referral code, an `affiliate_referrals` row is created.
3. The affiliate does **not** earn a payout during the driver's free trial.
4. When the driver makes their **first paid subscription payment**, the referral is marked `is_payout_eligible = true`.
5. A `$10` payout record is created in `affiliate_payouts` with status `pending`.
6. An admin marks the payout as `paid` from the Admin Panel after sending the payment.

### Creating an Affiliate Account

Currently, affiliates are created manually by an admin:

1. Have the user sign up normally.
2. In the Supabase dashboard, update their `profiles.role` to `affiliate`.
3. Insert a row into the `affiliates` table:
   ```sql
   INSERT INTO affiliates (user_id, referral_code, payout_email)
   VALUES ('their-user-id', 'DUDE-XXXX', 'their@email.com');
   ```

### Webhook for First Payment (Stripe)

When you integrate Stripe, add a webhook handler for `invoice.payment_succeeded`. On the first successful payment for a subscription:

```typescript
// Pseudocode for your Stripe webhook handler
import { markReferralPayoutEligible, createAffiliatePayout, getAffiliateByUserId } from './lib/db';

// Called when a subscription payment succeeds
async function onSubscriptionPaymentSucceeded(userId: string) {
  // Mark the referral as payout-eligible
  const { data: referral } = await markReferralPayoutEligible(userId);
  
  if (referral) {
    // Create the $10 payout record
    await createAffiliatePayout(referral.affiliate_id, referral.id);
  }
}
```

---

## 6. Vercel Deployment

### 6.1 Deploy from GitHub

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **New Project**.
3. Import your GitHub repository.
4. Vercel will auto-detect the Vite framework.
5. Add your environment variables (see Section 2).
6. Click **Deploy**.

### 6.2 Build Settings

Vercel should auto-detect these, but verify:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `pnpm run build` |
| Output Directory | `dist` |
| Install Command | `pnpm install` |

### 6.3 Custom Domain

1. In Vercel → **Settings → Domains**, add your custom domain.
2. Update the Supabase **Site URL** and **Redirect URLs** to match.

---

## 7. File Structure Reference

```
dude-with-a-truck/
├── supabase/
│   └── schema.sql              ← Run this in Supabase SQL Editor
├── client/
│   └── src/
│       ├── lib/
│       │   ├── supabase.ts     ← Supabase client singleton
│       │   ├── database.types.ts ← TypeScript types for all tables
│       │   └── db.ts           ← All database helper functions
│       ├── contexts/
│       │   └── AuthContext.tsx ← Auth state, signIn, signUp, signOut
│       ├── components/
│       │   ├── auth/
│       │   │   └── AuthModal.tsx         ← Login / customer signup
│       │   ├── forms/
│       │   │   ├── DriverSignupModal.tsx ← Driver signup + subscription
│       │   │   └── CustomerRequestModal.tsx ← Move request form
│       │   ├── layout/
│       │   │   └── SiteHeader.tsx        ← Nav with auth state
│       │   └── sections/
│       │       ├── Hero.tsx
│       │       ├── FeaturedDudes.tsx
│       │       ├── StatsBar.tsx
│       │       ├── Services.tsx
│       │       ├── HowItWorks.tsx
│       │       ├── Pricing.tsx
│       │       └── CtaFooter.tsx
│       └── pages/
│           ├── Home.tsx          ← Public landing page
│           ├── Dashboard.tsx     ← Role-based user dashboard
│           └── AdminDashboard.tsx ← Admin-only control panel
└── SETUP.md                    ← This file
```

---

## 8. Database Schema Summary

| Table | Purpose |
|---|---|
| `profiles` | Extends Supabase auth users; stores role, name, phone |
| `driver_profiles` | Truck details, service area, verification status |
| `subscriptions` | Driver subscription plans, trial dates, pricing |
| `move_requests` | Customer move/haul requests with status lifecycle |
| `bookings` | Links requests to drivers with pricing breakdown |
| `payments` | All payment transactions (bookings + subscriptions) |
| `affiliates` | Affiliate accounts with referral codes |
| `affiliate_referrals` | Tracks which affiliate referred which driver |
| `affiliate_payouts` | $10 payout records per converted driver |

---

## 9. User Roles

| Role | Access |
|---|---|
| `customer` | Submit move requests, view own requests via `/dashboard` |
| `driver` | View subscription, bookings, and open requests via `/dashboard` |
| `affiliate` | View referral stats and payout history via `/dashboard` |
| `admin` | Full access to all data via `/admin` |

---

## 10. Subscription Plans

| Plan | Price | Trial |
|---|---|---|
| Founders Special | $14.50/month | 30 days free |
| Standard | $29.00/month | None |

The Founders Special rate is locked in forever once claimed. The `subscriptions` table stores `plan_name`, `monthly_price`, `status`, `trial_start_date`, and `trial_end_date`.

---

## 11. Next Steps (Future Enhancements)

The following features are architecturally ready in the database but not yet implemented in the UI:

- **Stripe Integration**: Wire the subscription billing to Stripe. Use `stripe_customer_id` and `stripe_subscription_id` columns in the `subscriptions` table.
- **Driver Verification**: Build an admin workflow to mark `driver_profiles.is_verified = true` after document review.
- **Booking Flow**: Build the UI for drivers to claim open requests and create bookings.
- **Real-time Matching**: Use Supabase Realtime to push new requests to nearby drivers.
- **Rating System**: After job completion, allow customers to rate drivers (stored in `driver_profiles.rating`).
