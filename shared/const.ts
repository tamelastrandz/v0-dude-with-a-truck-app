export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

/** Platform share of job payments (excluding the $29/mo driver subscription). */
export const PLATFORM_FEE_RATE = 0.3;

export function calcPlatformFee(quotedPrice: number): number {
  return Math.round(quotedPrice * PLATFORM_FEE_RATE * 100) / 100;
}

export function calcDriverPayout(quotedPrice: number): number {
  return Math.round((quotedPrice - calcPlatformFee(quotedPrice)) * 100) / 100;
}
