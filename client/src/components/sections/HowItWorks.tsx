/** HowItWorks — Step-by-step explainer. Preserved from original v0 design. */

import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Tell Us What You Need",
    desc: "Describe your move, haul, or delivery. Takes 60 seconds.",
  },
  {
    number: "02",
    title: "Get Matched Fast",
    desc: "We connect you with a vetted dude in your area who's ready to roll.",
  },
  {
    number: "03",
    title: "Your Stuff Gets Moved",
    desc: "Your dude shows up on time, handles everything, and gets it done right.",
  },
];

const perks = [
  "Background-checked and vetted drivers",
  "Real-time tracking and updates",
  "Transparent pricing, no hidden fees",
  "Insured for your peace of mind",
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
        {/* Left column */}
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="font-heading mt-4 text-balance text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-6xl">
            Simple. Fast. Done Right.
          </h2>
          <div className="mt-12 flex flex-col gap-10">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <span className="font-heading shrink-0 text-4xl font-bold text-primary/30 leading-none">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {perks.map((perk) => (
              <div key={perk} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-pretty leading-relaxed text-foreground">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — image */}
        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src="/manus-storage/how-it-works_d590031d.png"
              alt="A vetted dude carefully moving a wooden dresser"
              className="aspect-[4/5] w-full object-cover lg:aspect-auto lg:h-full"
            />
          </div>
          <div className="absolute inset-x-4 bottom-4 rounded-lg border border-border bg-card/95 p-6 backdrop-blur">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
              Meet Your Dude
            </p>
            <p className="mt-2 text-pretty leading-relaxed text-foreground">
              Every crew member is vetted, rated, and ready to treat your stuff like their own.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
