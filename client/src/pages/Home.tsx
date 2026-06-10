/**
 * Home.tsx — Public landing page.
 *
 * Preserves the original v0 design exactly:
 *  SiteHeader → Hero → FeaturedDudes → StatsBar → Services → HowItWorks → Pricing → CtaFooter
 *
 * Auth modals (Login / Driver Signup / Customer Request) are layered on top.
 */

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Hero } from "@/components/sections/Hero";
import { StatsBar } from "@/components/sections/StatsBar";
import { Services } from "@/components/sections/Services";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { FeaturedDudes } from "@/components/sections/FeaturedDudes";
import { Pricing } from "@/components/sections/Pricing";
import { CtaFooter } from "@/components/sections/CtaFooter";

export default function Home() {
  return (
    <main className="bg-background">
      <SiteHeader />
      <Hero />
      <FeaturedDudes />
      <StatsBar />
      <Services />
      <HowItWorks />
      <Pricing />
      <CtaFooter />
    </main>
  );
}
