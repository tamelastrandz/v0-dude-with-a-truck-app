"use server"

import { createClient } from "@/lib/supabase/server"
import {
  buildReferralLink,
  generateReferralCode,
  type ReferralFormState,
  type ReferralPartner,
} from "@/lib/referral"

function getString(formData: FormData, key: string): string {
  return (formData.get(key) ?? "").toString().trim()
}

export async function submitReferralPartner(
  _prevState: ReferralFormState,
  formData: FormData,
): Promise<ReferralFormState> {
  const firstName = getString(formData, "first_name")
  const lastName = getString(formData, "last_name")
  const email = getString(formData, "email")
  const phone = getString(formData, "phone")
  const city = getString(formData, "city")
  const state = getString(formData, "state")
  const socialHandle = getString(formData, "social_handle")
  const paypalEmail = getString(formData, "paypal_email")
  const networkSize = getString(formData, "network_size")
  const isTruckOwner = getString(formData, "is_truck_owner") === "yes"
  const agreed = formData.get("agreement") === "on"

  if (!firstName || !lastName || !email || !phone || !city || !state || !paypalEmail) {
    return { ok: false, message: "Please fill out all required fields." }
  }
  if (!agreed) {
    return { ok: false, message: "You must agree to the referral terms to continue." }
  }

  const referralCode = generateReferralCode(firstName)
  const referralLink = buildReferralLink(referralCode)

  const partner: ReferralPartner = {
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    city,
    state,
    social_handle: socialHandle || null,
    paypal_email: paypalEmail,
    network_size: networkSize,
    is_truck_owner: isTruckOwner,
    referral_code: referralCode,
    referral_link: referralLink,
    payout_status: "pending",
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("dwat_referral_partners")
    .insert({ ...partner, agreed_to_terms: agreed })

  if (error) {
    console.log("[v0] Referral insert error:", error.message)
    // Unique violation on referral_code — retry once with a fresh code.
    if (error.code === "23505") {
      const retryCode = generateReferralCode(firstName)
      const retryLink = buildReferralLink(retryCode)
      const { error: retryError } = await supabase
        .from("dwat_referral_partners")
        .insert({
          ...partner,
          referral_code: retryCode,
          referral_link: retryLink,
          agreed_to_terms: agreed,
        })
      if (retryError) {
        return { ok: false, message: "Something went wrong. Please try again." }
      }
      return {
        ok: true,
        message: "You're in! Here's your referral link.",
        referralCode: retryCode,
        referralLink: retryLink,
      }
    }
    return { ok: false, message: "Something went wrong. Please try again." }
  }

  return {
    ok: true,
    message: "You're in! Here's your referral link.",
    referralCode,
    referralLink,
  }
}
