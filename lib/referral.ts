import { randomBytes } from "crypto"

export type PayoutStatus = "pending" | "eligible" | "paid" | "rejected"

export type ReferralPartner = {
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  state: string
  social_handle: string | null
  paypal_email: string
  network_size: string
  is_truck_owner: boolean
  referral_code: string
  referral_link: string
  payout_status: PayoutStatus
}

export type ReferralFormState = {
  ok: boolean
  message: string
  referralCode?: string
  referralLink?: string
}

function generateReferralCode(firstName: string): string {
  const prefix = firstName.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "DUDE"
  const suffix = randomBytes(3).toString("hex").toUpperCase()
  return `${prefix}-${suffix}`
}

export function buildReferralLink(code: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dudewithatruck.com"
  return `${base}/?ref=${code}`
}

export { generateReferralCode }
