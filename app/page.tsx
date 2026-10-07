import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/home/hero-section"
import { FreightStats } from "@/components/home/freight-stats"
import { FreightServices } from "@/components/home/freight-services"
import { HowItWorks } from "@/components/home/how-it-works"
import { StatsSection } from "@/components/home/stats-section"
import { Testimonials } from "@/components/home/testimonials"
import { CtaSection } from "@/components/home/cta-section"
import { CourierMarquee } from "@/components/courier-marquee"

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* 1. Hero — dark primary bg */}
        <HeroSection />

        {/* 2. Freight progress bars — white bg */}
        <FreightStats />

        {/* 3. Stats counters — dark bg */}
        <StatsSection />

        {/* 4. Freight service cards auto-scroll — dark #0d0d0d bg */}
        <FreightServices />

        {/* 5. How it works — light grey bg */}
        <HowItWorks />

        {/* 6. Partner logos marquee — white bg */}
        <section className="border-y border-gray-100 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-7 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Trusted delivery partners worldwide
            </p>
            <CourierMarquee tone="light" />
          </div>
        </section>

        {/* 7. Testimonial slider — pink-to-purple gradient bg */}
        <Testimonials />

        {/* 8. CTA — dark bg */}
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
