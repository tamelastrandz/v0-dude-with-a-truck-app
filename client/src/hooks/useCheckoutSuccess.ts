/**
 * useCheckoutSuccess — detects ?checkout=success in the URL after Stripe redirects back.
 *
 * Shows a toast and clears the param from the URL so it doesn't persist on refresh.
 * Call this hook inside the Dashboard page.
 */

import { useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { toast } from "sonner";

export function useCheckoutSuccess() {
  const search = useSearch();
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const checkout = params.get("checkout");
    const plan = params.get("plan");

    if (checkout === "success") {
      const message =
        plan === "founders"
          ? "🎉 Welcome to Dude With A Truck! Your 30-day free trial is active. You'll be charged $14.50/mo after the trial ends."
          : "🎉 Welcome to Dude With A Truck! Your subscription is now active.";

      toast.success(message, { duration: 8000 });

      // Clean up the URL params
      navigate("/dashboard", { replace: true });
    }
  }, [search, navigate]);
}
