/**
 * CtaFooter — Final CTA and footer. Preserved from original v0 design.
 * Added: "Get a Quote" button opens customer request modal.
 */

import { ArrowRight, Truck, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { CustomerRequestModal } from "@/components/forms/CustomerRequestModal";

export function CtaFooter() {
  const [requestOpen, setRequestOpen] = useState(false);

  return (
    <>
      {/* CTA Banner */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            Ready to Move?
          </p>
          <h2 className="font-heading mt-4 text-balance text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-6xl">
            Your Dude Is Waiting.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Stop stressing about that couch, that fridge, or that whole apartment. There&apos;s a
            dude with a truck nearby who&apos;s ready to handle it.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => setRequestOpen(true)}
              className="font-heading inline-flex h-13 items-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/80 active:scale-[0.97]"
            >
              Get a Free Quote
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
            <a
              href="tel:8005551234"
              className="font-heading inline-flex h-13 items-center gap-2 rounded-lg border border-border bg-transparent px-8 text-base font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
            >
              <Phone className="size-5" />
              (800) 555-1234
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
            {/* Brand */}
            <div className="flex flex-col items-center gap-3 md:items-start">
              <a href="/" className="flex items-center gap-3">
                <img
                  src="/images/logoo.png"
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 object-contain"
                />
                <span className="font-heading text-sm font-bold uppercase leading-[0.95] tracking-wide text-foreground">
                  Dude With
                  <br />A Truck
                </span>
              </a>
              <p className="max-w-xs text-center text-sm text-muted-foreground md:text-left">
                Connecting customers with local truck owners for moves, hauls, and deliveries.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm">
              <div className="flex flex-col gap-3">
                <p className="font-heading font-semibold uppercase tracking-widest text-foreground">
                  Platform
                </p>
                <a href="#services" className="text-muted-foreground hover:text-foreground">Services</a>
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground">Driver Pricing</a>
                <a href="#crew" className="text-muted-foreground hover:text-foreground">Meet the Crew</a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-heading font-semibold uppercase tracking-widest text-foreground">
                  Contact
                </p>
                <a
                  href="tel:8005551234"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="size-3.5" />
                  (800) 555-1234
                </a>
                <a
                  href="mailto:hello@dudewithAtruck.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="size-3.5" />
                  hello@dudewithatruck.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Dude With A Truck. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <CustomerRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </>
  );
}
