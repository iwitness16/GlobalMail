import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gray-900 py-24">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-[600px] rounded-full bg-rose-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">
          Get started today
        </span>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Ready to ship with a partner you can track every step of the way?
        </h2>
        <p className="max-w-xl text-pretty text-gray-400">
          Tell us about your freight and our team will respond by email with a tailored quote,
          usually within one business day.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            render={<Link href="/contact" />}
            nativeButton={false}
            size="lg"
            className="rounded-full bg-rose-600 text-white hover:bg-rose-700"
          >
            <Mail data-icon="inline-start" />
            Request a quote
          </Button>
          <Button
            render={<Link href="/track" />}
            nativeButton={false}
            size="lg"
            variant="outline"
            className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            Track a shipment
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
