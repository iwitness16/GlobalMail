import Image from "next/image"
import Link from "next/link"
import { PackageSearch } from "lucide-react"
import { CourierMarquee } from "@/components/courier-marquee"

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-black text-white">

      {/* ── Background image — high opacity, sharp ──────────────────────── */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-cargo.png"
          alt="Global Mail Express cargo operations"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          style={{ opacity: 0.72 }}
        />
        {/* Dark vignette: heavy on left for text contrast, light on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />
        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {/* pt-20 compensates for the fixed header height (h-20) */}
      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 pb-24 pt-36 sm:px-6 lg:px-8 lg:pt-40">

        <div className="max-w-2xl">
          {/* Eyebrow */}
          <p className="mb-4 max-w-xs text-sm leading-snug text-gray-300">
            Airfreight is fast-moving,<br />challenging &amp; constantly changing
          </p>

          {/* Headline — matches screenshot style */}
          <h1 className="text-5xl font-black leading-[1.0] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            <span className="block text-white">Get</span>
            <span className="block bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">
              connected
            </span>
            <span className="block text-white">to the world</span>
          </h1>

          {/* CTA button */}
          <div className="mt-10">
            <Link
              href="/track"
              className="inline-flex items-center gap-3 rounded-xl border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/15"
            >
              <PackageSearch className="size-4" />
              Track Package
            </Link>
          </div>
        </div>
      </div>

      {/* ── Partner marquee strip ────────────────────────────────────────── */}
      <div className="relative border-t border-white/10 bg-gray-950 py-7">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Trusted delivery partners worldwide
          </p>
          <CourierMarquee tone="dark" />
        </div>
      </div>
    </section>
  )
}
