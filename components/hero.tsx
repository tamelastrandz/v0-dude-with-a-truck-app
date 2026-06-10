import { Star, ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/hero-truck.png"
          alt="A black pickup truck loaded with moving boxes in dramatic low light"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-28 pb-16 lg:px-8">
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

        <h1 className="font-heading mt-6 max-w-3xl text-balance text-6xl font-bold uppercase leading-[0.92] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
          Got Stuff? <span className="text-primary">We&apos;ve Got</span> The Truck.
        </h1>

        <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Hauling, moving, and same-day delivery handled by a strong, vetted crew. No flaky
          no-shows. No mystery fees. Just a dependable dude and a truck, right when you need one.
        </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <a
            href="#crew"
            className={cn(
              buttonVariants({ size: "lg" }),
              "font-heading h-13 gap-2 px-7 text-base font-semibold uppercase tracking-wide",
            )}
          >
            Find a Dude Near You
            <ArrowRight className="size-5" aria-hidden="true" />
          </a>
          <a
            href="#pricing"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "font-heading h-13 border-border bg-transparent px-7 text-base font-semibold uppercase tracking-wide text-foreground hover:bg-secondary",
            )}
          >
            List My Truck
          </a>
        </div>
      </div>
    </section>
  )
}
