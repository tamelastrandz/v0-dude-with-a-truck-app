import { CheckCircle2 } from "lucide-react"

const steps = [
  {
    num: "01",
    title: "Choose Your Area",
    desc: "Pick your metro and the city or ZIP code where you need a hand.",
  },
  {
    num: "02",
    title: "Pick Your Dude",
    desc: "Browse local truck owners nearby, compare ratings, trucks, and starting prices.",
  },
  {
    num: "03",
    title: "Book & Pay",
    desc: "Lock in a time and pay securely in the app. No mystery fees, no hassle.",
  },
  {
    num: "04",
    title: "Get It Done",
    desc: "A vetted dude rolls up on time, loads it, and gets it where it's going.",
  },
]

const perks = [
  "Background-checked, insured crew",
  "Flat, upfront pricing — no surprises",
  "Real-time tracking from pickup to drop-off",
  "Heavy lifting included, always",
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-24 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="font-heading mt-4 text-balance text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-6xl">
            Booked In A Tap. Done In A Day.
          </h2>

          <div className="mt-12 flex flex-col gap-10">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-6">
                <span className="font-heading text-3xl font-bold text-primary">{step.num}</span>
                <div>
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-md text-pretty leading-relaxed text-muted-foreground">
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

        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src="/images/how-it-works.png"
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
  )
}
