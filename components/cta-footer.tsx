import { Truck, ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CtaFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 rounded-xl border border-border bg-card p-10 text-center lg:flex-row lg:items-center lg:text-left">
          <div>
            <h2 className="font-heading text-balance text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground lg:text-5xl">
              Got Stuff To Move?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground lg:mx-0">
              A dependable dude with a truck is one tap away in Atlanta and Houston.
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
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

        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="size-4" aria-hidden="true" />
            </span>
            <span className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">
              Dude With A Truck
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6" aria-label="Footer">
            <a href="#services" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Services
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#crew" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Crew
            </a>
          </nav>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Dude With A Truck
          </p>
        </div>
      </div>
    </footer>
  )
}
