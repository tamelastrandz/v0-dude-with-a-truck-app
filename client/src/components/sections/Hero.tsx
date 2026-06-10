/**
 * Hero — Full-bleed hero section with truck background image.
 * Preserves original v0 design. Adds "Get a Quote" CTA that opens the customer request modal.
 */

import { Star, ArrowRight } from "lucide-react";
import { useState } from "react";
import { CustomerRequestModal } from "@/components/forms/CustomerRequestModal";

export function Hero() {
  const [requestOpen, setRequestOpen] = useState(false);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="/manus-storage/hero-truck_af30dc9d.png"
            alt="A black pickup truck loaded with moving boxes in dramatic low light"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
        </div>

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-28 pb-16 text-center lg:items-start lg:px-8 lg:text-left">
          {/* Stars */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              4.9 &middot; 2,400+ Moves Done Right
            </p>
          </div>

          {/* Headline */}
          <h1 className="font-heading mt-6 max-w-4xl text-balance text-5xl font-bold uppercase leading-[0.92] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Find a <span className="text-primary">Dude With A Truck</span> Near You.
          </h1>

          {/* Subheadline */}
          <p
            className="mx-auto mt-7 max-w-xl text-pretty text-lg leading-relaxed lg:mx-0"
            style={{ color: "#ededed" }}
          >
            Browse local truck owners across your metro area for moving, hauling, pickups,
            deliveries and more.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <button
              onClick={() => setRequestOpen(true)}
              className="font-heading inline-flex h-13 items-center gap-2 rounded-lg bg-primary px-7 text-base font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/80 active:scale-[0.97]"
            >
              Find a Dude Near You
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
            <a
              href="#pricing"
              className="font-heading inline-flex h-13 items-center rounded-lg border border-border bg-transparent px-7 text-base font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
            >
              List My Truck
            </a>
          </div>
        </div>
      </section>

      <CustomerRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </>
  );
}
