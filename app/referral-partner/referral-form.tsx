"use client"

import { useActionState, useState } from "react"
import { Check, Copy, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { submitReferralPartner } from "./actions"
import type { ReferralFormState } from "@/lib/referral"

const initialState: ReferralFormState = { ok: false, message: "" }

const inputClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
const labelClass = "font-heading text-xs font-semibold uppercase tracking-wide text-muted-foreground"

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  )
}

export function ReferralForm() {
  const [state, formAction, pending] = useActionState(submitReferralPartner, initialState)
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    if (!state.referralLink) return
    await navigator.clipboard.writeText(state.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (state.ok && state.referralLink) {
    return (
      <div className="rounded-xl border border-primary/40 bg-card p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h3 className="font-heading mt-6 text-3xl font-bold uppercase tracking-tight text-foreground">
          You&apos;re In!
        </h3>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
          Share this link with every dude you know who&apos;s got a truck. You earn $10 once they
          sign up, pass their background check, and get approved.
        </p>

        <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            readOnly
            value={state.referralLink}
            className={cn(inputClass, "text-center sm:text-left")}
            aria-label="Your referral link"
          />
          <button
            type="button"
            onClick={copyLink}
            className={cn(
              buttonVariants(),
              "font-heading h-12 shrink-0 gap-2 px-5 font-semibold uppercase tracking-wide",
            )}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Your referral code: <span className="font-mono text-foreground">{state.referralCode}</span>
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="First Name">
          <input name="first_name" required className={inputClass} placeholder="John" />
        </Field>
        <Field label="Last Name">
          <input name="last_name" required className={inputClass} placeholder="Hauler" />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={inputClass} placeholder="you@email.com" />
        </Field>
        <Field label="Phone">
          <input name="phone" type="tel" required className={inputClass} placeholder="(404) 555-0199" />
        </Field>
        <Field label="City">
          <input name="city" required className={inputClass} placeholder="Atlanta" />
        </Field>
        <Field label="State">
          <input name="state" required className={inputClass} placeholder="GA" />
        </Field>
        <Field label="Instagram / TikTok Handle">
          <input name="social_handle" className={inputClass} placeholder="@yourhandle" />
        </Field>
        <Field label="PayPal Email">
          <input name="paypal_email" type="email" required className={inputClass} placeholder="paypal@email.com" />
        </Field>
        <Field label="How Many Truck Owners Do You Know?">
          <select name="network_size" defaultValue="1-5" className={inputClass}>
            <option value="1-5">1 - 5</option>
            <option value="6-15">6 - 15</option>
            <option value="16-30">16 - 30</option>
            <option value="30+">30+</option>
          </select>
        </Field>
        <Field label="Are You Also A Truck Owner?">
          <select name="is_truck_owner" defaultValue="no" className={inputClass}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </Field>
      </div>

      <label className="mt-6 flex items-start gap-3">
        <input
          name="agreement"
          type="checkbox"
          required
          className="mt-1 size-5 shrink-0 rounded border-border bg-background accent-primary"
        />
        <span className="text-sm leading-relaxed text-muted-foreground">
          I understand referrals only qualify after the driver signs up, passes a background check,
          and is approved.
        </span>
      </label>

      {!state.ok && state.message && (
        <p className="mt-4 text-sm text-destructive">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          buttonVariants({ size: "lg" }),
          "font-heading mt-6 h-13 w-full gap-2 text-base font-semibold uppercase tracking-wide disabled:opacity-70",
        )}
      >
        {pending && <Loader2 className="size-5 animate-spin" />}
        {pending ? "Creating Your Link" : "Get My Referral Link"}
      </button>
    </form>
  )
}
