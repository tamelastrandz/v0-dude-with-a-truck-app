const STORAGE_KEY = "last_checkout_session_id";

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
