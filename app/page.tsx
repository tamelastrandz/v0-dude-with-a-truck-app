import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { StatsBar } from "@/components/stats-bar"
import { Services } from "@/components/services"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturedDudes } from "@/components/featured-dudes"
import { Pricing } from "@/components/pricing"
import { CtaFooter } from "@/components/cta-footer"

export default function Page() {
  return (
    <main className="bg-background">
      <SiteHeader />
      <Hero />
      <StatsBar />
      <Services />
      <HowItWorks />
      <FeaturedDudes />
      <Pricing />
      <CtaFooter />
    </main>
  )
}
