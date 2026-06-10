"use client"

import { useState } from "react"
import Image from "next/image"
import { Phone, Menu, X } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Crew", href: "/#crew" },
  { label: "Earn Referrals", href: "/referral-partner" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <a href="#" className="flex items-center gap-3">
          <Image
            src="/images/logo-badge.png"
            alt="Dude With A Truck logo"
            width={56}
            height={56}
            className="h-12 w-12 object-contain"
            priority
          />
          <span className="font-heading text-sm font-bold uppercase leading-[0.95] tracking-wide text-foreground">
            Dude With
            <br />A Truck
          </span>
        </a>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <a
            href="tel:8005551234"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Phone className="size-4" aria-hidden="true" />
            (800) 555-1234
          </a>
          <a
            href="#crew"
            className={cn(buttonVariants(), "font-heading h-10 px-4 font-semibold uppercase tracking-wide")}
          >
            Find a Dude Near You
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-md text-foreground lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card/95 backdrop-blur lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4" aria-label="Mobile">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-heading rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#crew"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants(), "font-heading mt-2 h-10 font-semibold uppercase tracking-wide")}
            >
              Find a Dude Near You
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
