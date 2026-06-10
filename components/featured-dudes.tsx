"use client"

import { useMemo, useState } from "react"
import { Star, Truck, MapPin, Search, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type Dude = {
  name: string
  rating: string
  truck: string
  area: string
  zips: string[]
  distance: number
  startingPrice: number
  available: boolean
  img: string
}

type Metro = {
  id: string
  label: string
  short: string
  areas: string[]
  dudes: Dude[]
}

const metros: Metro[] = [
  {
    id: "atlanta",
    label: "Atlanta Metro",
    short: "Atlanta",
    areas: [
      "Atlanta",
      "East Point",
      "College Park",
      "Decatur",
      "Douglasville",
      "Austell",
      "Lithia Springs",
      "Smyrna",
      "Marietta",
      "Sandy Springs",
      "Duluth",
      "Norcross",
      "Lawrenceville",
      "Tucker",
      "Stone Mountain",
    ],
    dudes: [
      {
        name: "Marcus",
        rating: "4.9",
        truck: "Ford F-250 · 8ft Bed",
        area: "Atlanta",
        zips: ["30303", "30309", "30312"],
        distance: 2.4,
        startingPrice: 65,
        available: true,
        img: "/images/dude-marcus.png",
      },
      {
        name: "Sam",
        rating: "4.9",
        truck: "RAM 1500 · 6.4ft Bed",
        area: "Decatur",
        zips: ["30030", "30032", "30033"],
        distance: 5.1,
        startingPrice: 60,
        available: true,
        img: "/images/dude-sam.png",
      },
      {
        name: "DeShawn",
        rating: "4.8",
        truck: "Toyota Tundra · 6.5ft Bed",
        area: "Marietta",
        zips: ["30060", "30062", "30064"],
        distance: 11.8,
        startingPrice: 55,
        available: false,
        img: "/images/dude-deshawn.png",
      },
    ],
  },
  {
    id: "houston",
    label: "Houston Metro",
    short: "Houston",
    areas: [
      "Houston",
      "Katy",
      "Sugar Land",
      "Pearland",
      "Cypress",
      "Spring",
      "Humble",
      "Pasadena",
      "Missouri City",
      "The Woodlands",
    ],
    dudes: [
      {
        name: "Tyler",
        rating: "5.0",
        truck: "Chevy Silverado · 6.5ft Bed",
        area: "Houston",
        zips: ["77002", "77006", "77019"],
        distance: 1.9,
        startingPrice: 70,
        available: true,
        img: "/images/dude-tyler.png",
      },
      {
        name: "Andre",
        rating: "5.0",
        truck: "RAM 2500 · 8ft Bed",
        area: "Sugar Land",
        zips: ["77478", "77479", "77498"],
        distance: 8.3,
        startingPrice: 75,
        available: true,
        img: "/images/dude-andre.png",
      },
    ],
  },
]

export function FeaturedDudes() {
  const [activeMetroId, setActiveMetroId] = useState(metros[0].id)
  const [activeArea, setActiveArea] = useState("All Areas")
  const [query, setQuery] = useState("")

  const activeMetro = metros.find((m) => m.id === activeMetroId) ?? metros[0]

  const filteredDudes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return activeMetro.dudes.filter((dude) => {
      const matchesArea = activeArea === "All Areas" || dude.area === activeArea
      const matchesQuery =
        q === "" ||
        dude.area.toLowerCase().includes(q) ||
        dude.zips.some((z) => z.includes(q)) ||
        dude.name.toLowerCase().includes(q)
      return matchesArea && matchesQuery
    })
  }, [activeMetro, activeArea, query])

  function selectMetro(id: string) {
    setActiveMetroId(id)
    setActiveArea("All Areas")
    setQuery("")
  }

  return (
    <section id="crew" className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8">
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
          The Crew
        </p>
        <h2 className="font-heading mt-4 text-balance text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-6xl">
          Dudes With Trucks Near You
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Choose your metro, narrow it to your city or ZIP code, and book a background-checked dude
          ready to roll.
        </p>

        {/* Metro selection */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-1 rounded-lg border border-border bg-card p-1">
            {metros.map((metro) => (
              <button
                key={metro.id}
                onClick={() => selectMetro(metro.id)}
                className={cn(
                  "font-heading rounded-md px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors",
                  metro.id === activeMetroId
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {metro.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="mx-auto mt-8 max-w-xl">
          <label htmlFor="dude-search" className="sr-only">
            Search by city or ZIP code
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="dude-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city or ZIP code"
              className="h-13 w-full rounded-lg border border-border bg-card pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Service area filter */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {["All Areas", ...activeMetro.areas].map((area) => (
            <button
              key={area}
              onClick={() => setActiveArea(area)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                area === activeArea
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Driver cards */}
        {filteredDudes.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filteredDudes.map((dude) => (
              <article
                key={dude.name + dude.area}
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
                  <div
                    className={cn(
                      "absolute right-4 top-4 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                      dude.available
                        ? "bg-emerald-500/90 text-white"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Clock className="size-3.5" aria-hidden="true" />
                    {dude.available ? "Available Now" : "Booked Today"}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-heading text-2xl font-bold uppercase tracking-wide text-foreground">
                      {dude.name}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-6">
                  <div className="flex items-center gap-3 text-foreground">
                    <Truck className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="leading-relaxed">{dude.truck}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="leading-relaxed">
                      {dude.area}{" "}
                      <span className="text-muted-foreground">· {dude.distance} mi away</span>
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-border pt-5">
                    <p className="text-sm text-muted-foreground">
                      from{" "}
                      <span className="font-heading text-lg font-bold text-foreground">
                        ${dude.startingPrice}
                      </span>
                    </p>
                    <button className="font-heading text-sm font-bold uppercase tracking-wide text-primary transition-colors hover:text-foreground">
                      View Profile
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-xl border border-dashed border-border bg-card p-12">
            <p className="text-pretty leading-relaxed text-muted-foreground">
              No dudes match that search yet in {activeMetro.label}. Try another city or ZIP code —
              new trucks are listing every day.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
