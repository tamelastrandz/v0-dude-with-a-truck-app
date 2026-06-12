-- Allow affiliate partners to create their own record at signup
-- Run in Supabase SQL Editor after schema.sql / migration 002

CREATE POLICY "Users can create their own affiliate record"
  ON public.affiliates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Affiliates can update their own record"
  ON public.affiliates FOR UPDATE
  USING (auth.uid() = user_id);

-- Drivers who sign up with a referral link record the referral
CREATE POLICY "Drivers can record their own affiliate referral"
  ON public.affiliate_referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_driver_id);
