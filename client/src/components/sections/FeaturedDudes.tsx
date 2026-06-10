/** FeaturedDudes — Driver profile cards. Preserved from original v0 design. */

import { Star, MapPin } from "lucide-react";

const dudes = [
  {
    name: "Marcus T.",
    location: "Houston, TX",
    rating: 4.9,
    jobs: 312,
    truck: "2022 Ford F-250",
    specialty: "Heavy Furniture & Appliances",
    img: "/manus-storage/dude-marcus_42adb161.png",
  },
  {
    name: "DeShawn R.",
    location: "Dallas, TX",
    rating: 5.0,
    jobs: 198,
    truck: "2021 Chevy Silverado 2500",
    specialty: "Same-Day Moves",
    img: "/manus-storage/dude-deshawn_81d001f3.png",
  },
  {
    name: "Tyler W.",
    location: "Austin, TX",
    rating: 4.8,
    jobs: 445,
    truck: "2023 Ram 1500",
    specialty: "Junk Removal & Hauling",
    img: "/manus-storage/dude-tyler_75a9ccbb.png",
  },
  {
    name: "Andre K.",
    location: "San Antonio, TX",
    rating: 4.9,
    jobs: 267,
    truck: "2020 Toyota Tundra",
    specialty: "Office & Commercial Moves",
    img: "/manus-storage/dude-andre_2c9c0240.png",
  },
  {
    name: "Sam L.",
    location: "Fort Worth, TX",
    rating: 4.7,
    jobs: 183,
    truck: "2022 Nissan Titan",
    specialty: "Store Pickups & Deliveries",
    img: "/manus-storage/dude-sam_edb3b01d.png",
  },
];

export function FeaturedDudes() {
  return (
    <section id="crew" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
        Meet the Crew
      </p>
      <h2 className="font-heading mt-4 max-w-2xl text-balance text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-6xl">
        Real Dudes. Real Trucks. Real Results.
      </h2>
      <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
        Every dude on the platform is background-checked, rated by real customers, and ready to
        haul.
      </p>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {dudes.map((dude) => (
          <div
            key={dude.name}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40 hover:bg-secondary"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={dude.img}
                alt={dude.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                  {dude.name}
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="size-3.5 fill-primary text-primary" />
                  <span className="text-sm font-semibold text-foreground">{dude.rating}</span>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {dude.location}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{dude.truck}</p>
              <p className="mt-1 text-xs font-medium text-primary">{dude.specialty}</p>
              <p className="mt-3 text-xs text-muted-foreground">{dude.jobs} jobs completed</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
