/** Services — What We Haul grid. Preserved from original v0 design. */

import { Sofa, Trash2, PackageCheck, Boxes, Building2, Truck } from "lucide-react";

const services = [
  {
    icon: Sofa,
    title: "Moving Help",
    desc: "Studios, apartments, whole homes. We lift, load, and haul so you don't throw your back out.",
  },
  {
    icon: Trash2,
    title: "Junk Removal",
    desc: "Old couch, busted appliance, garage clutter. We haul it off and dispose of it right.",
  },
  {
    icon: PackageCheck,
    title: "Same-Day Delivery",
    desc: "Bought something big? We'll pick it up and drop it at your door the same day.",
  },
  {
    icon: Boxes,
    title: "Store Pickups",
    desc: "Furniture and hardware runs from the warehouse to your place, strapped down tight.",
  },
  {
    icon: Building2,
    title: "Office Moves",
    desc: "Desks, files, and gear relocated after hours so your business never skips a beat.",
  },
  {
    icon: Truck,
    title: "Anything Hauling",
    desc: "If it fits in the bed and it's legal, the dude will move it. Just ask.",
  },
];

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <p className="font-heading text-sm font-semibold uppercase tracking-widest text-primary">
        What We Haul
      </p>
      <h2 className="font-heading mt-4 max-w-2xl text-balance text-5xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-6xl">
        One Truck. A Whole Lot of Muscle.
      </h2>
      <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
        Whatever needs to go from point A to point B, there&apos;s a dude ready to load it up and
        roll out.
      </p>
      <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.title}
            className="group flex flex-col gap-5 bg-card p-8 transition-colors hover:bg-secondary"
          >
            <span className="flex size-12 items-center justify-center rounded-md bg-primary/15 text-primary">
              <service.icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-foreground">
              {service.title}
            </h3>
            <p className="text-pretty leading-relaxed text-muted-foreground">{service.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
