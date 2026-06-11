/**
 * Hero — Custom brand banner with baked-in artwork and a clickable CTA overlay.
 * Tapping "Find a Dude Near You" opens the customer request modal.
 */

import { useState } from "react";
import { CustomerRequestModal } from "@/components/forms/CustomerRequestModal";

export function Hero() {
  const [requestOpen, setRequestOpen] = useState(false);

  return (
    <>
      <section className="relative w-full bg-background">
        <div className="relative mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <img
            src="/images/hero-banner.png"
            alt="Dude With A Truck — real people, real trucks, real help. Three crew members in front of a pickup truck at sunset."
            width={1024}
            height={1536}
            className="block h-auto w-full"
            fetchPriority="high"
          />
          <button
            type="button"
            onClick={() => setRequestOpen(true)}
            aria-label="Find a Dude Near You"
            className="absolute left-1/2 top-[34.8%] h-[5%] min-h-11 w-[78%] max-w-sm -translate-x-1/2 cursor-pointer rounded-xl bg-transparent transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>
      </section>

      <CustomerRequestModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </>
  );
}
