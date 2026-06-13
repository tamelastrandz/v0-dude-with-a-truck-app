const STORAGE_KEY = "last_checkout_session_id";
const POST_PAYMENT_KEY = "post_payment_profile";

export function storeCheckoutSessionId(sessionId: string) {
  sessionStorage.setItem(STORAGE_KEY, sessionId);
}

export function getCheckoutSessionId(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearCheckoutSessionId() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getCheckoutSessionIdFromUrl(search: string): string | null {
  const fromUrl = new URLSearchParams(search).get("session_id");
  if (fromUrl) return fromUrl;
  return getCheckoutSessionId();
}

/** Set after Stripe redirects to payment-success so dashboard opens profile setup. */
export function markPostPaymentProfile() {
  sessionStorage.setItem(POST_PAYMENT_KEY, "true");
}

export function hasPostPaymentProfile(): boolean {
  return sessionStorage.getItem(POST_PAYMENT_KEY) === "true";
}

export function clearPostPaymentProfile() {
  sessionStorage.removeItem(POST_PAYMENT_KEY);
}

export function isPostPaymentFlow(search: string): boolean {
  const params = new URLSearchParams(search);
  return (
    params.get("setup") === "profile" ||
    !!params.get("session_id") ||
    !!getCheckoutSessionId() ||
    hasPostPaymentProfile()
  );
}
