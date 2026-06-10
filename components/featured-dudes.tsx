import { Star, Truck, MapPin } from "lucide-react"

const dudes = [
  {
    name: "Marcus Reed",
    quote: "Heavy lifting is my cardio.",
    rating: "4.9",
    truck: "Ford F-250 · 8ft Bed",
    location: "Atlanta, GA",
    jobs: 612,
    img: "/images/dude-marcus.png",
  },
  {
    name: "Tyler Brooks",
    quote: "On time, every time.",
    rating: "5.0",
    truck: "Chevy Silverado · 6.5ft Bed",
    location: "Houston, TX",
    jobs: 438,
    img: "/images/dude-tyler.png",
  },
  {
    name: "Sam Calloway",
    quote: "No load too awkward.",
    rating: "4.9",
    truck: "RAM 1500 · 6.4ft Bed",
    location: "Atlanta, GA",
    jobs: 729,
    img: "/images/dude-sam.png",
  },
  {
    name: "Andre Vega",
    quote: "Treat your stuff like my own.",
    rating: "5.0",
    truck: "RAM 2500 · 8ft Bed",
    location: "Houston, TX",
    jobs: 547,
    img: "/images/dude-andre.png",
  },
  {
    name: "DeShawn Park",
    quote: "Show up early, finish strong.",
    rating: "4.8",
    truck: "Toyota Tundra · 6.5ft Bed",
    location: "Atlanta, GA",
    jobs: 391,
    img: "/images/dude-deshawn.png",
  },
]

export function FeaturedDudes() {
  return (
    <section id="crew" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
          The Crew
        </p>
        <h2 className="font-heading mt-4 text-balance text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-6xl">
          Our Featured Dudes
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Background-checked, fully insured, and ready to roll. Meet a few of the top-rated dudes
          hauling in your area.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {dudes.map((dude) => (
            <article
              key={dude.name}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary/50"
            >
              <div className="relative">
                <img
                  src={dude.img || "/placeholder.svg"}
                  alt={`Portrait of ${dude.name}`}
                  className="aspect-[3/4] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-primary-foreground">
                  <Star className="size-3.5 fill-current" aria-hidden="true" />
                  <span className="font-heading text-sm font-bold">{dude.rating}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-heading text-2xl font-bold uppercase tracking-wide text-foreground">
                    {dude.name}
                  </h3>
                  <p className="mt-1 italic text-muted-foreground">&ldquo;{dude.quote}&rdquo;</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-3 text-foreground">
                  <Truck className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="leading-relaxed">{dude.truck}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground">
                  <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="leading-relaxed">{dude.location}</span>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-border pt-5">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-heading font-bold text-foreground">{dude.jobs}</span> jobs
                    hauled
                  </p>
                  <button className="font-heading text-sm font-bold uppercase tracking-wide text-primary transition-colors hover:text-foreground">
                    Book Him
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
