-- Founders Annual plan: featured homepage placement + plan metadata on subscriptions

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_key TEXT,
  ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'month'
    CHECK (billing_interval IN ('month', 'year'));

ALTER TABLE public.driver_profiles
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS featured_sort INTEGER;

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_key
  ON public.subscriptions(plan_key)
  WHERE plan_key = 'founders_annual';

CREATE INDEX IF NOT EXISTS idx_driver_profiles_featured
  ON public.driver_profiles(is_featured, featured_until)
  WHERE is_featured = TRUE;
