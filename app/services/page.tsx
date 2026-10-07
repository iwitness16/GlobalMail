import Image from "next/image"
import Link from "next/link"
import {
  Plane, Ship, Truck, TrainFront, Zap, Warehouse,
  CheckCircle2, ArrowRight, PackageSearch,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// ── Service definitions ────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "air",
    icon: Plane,
    title: "Air Freight",
    tagline: "Fast. Reliable. Global.",
    image: "/images/freight-air.png",
    description:
      "When speed is the priority, our air freight solutions connect your cargo to over 120 countries within 24–72 hours. We manage booking, documentation, customs clearance, and last-mile delivery end-to-end.",
    features: [
      "24–48hr transit to major international hubs",
      "Charter and consolidated cargo options",
      "Full customs brokerage support",
      "Dangerous goods handling (IATA certified)",
      "Real-time flight tracking at every leg",
    ],
  },
  {
    id: "ocean",
    icon: Ship,
    title: "Ocean Freight",
    tagline: "Scale your global trade.",
    image: "/images/freight-ocean.png",
    description:
      "Move high-volume cargo cost-efficiently across the world's major trade lanes. We offer both Full Container Load (FCL) and Less-than-Container Load (LCL) options with flexible scheduling.",
    features: [
      "FCL and LCL across all major ports",
      "Port-to-port and door-to-door service",
      "Reefer and hazardous cargo capability",
      "Bill of lading management",
      "Container tracking from origin to destination",
    ],
  },
  {
    id: "road",
    icon: Truck,
    title: "Road Freight",
    tagline: "Cross-border, no compromises.",
    image: "/images/freight-road.png",
    description:
      "Our vetted road carrier network covers cross-border full-load and groupage services. From next-day domestic deliveries to multi-country European runs, we keep your cargo moving.",
    features: [
      "Full truckload (FTL) and groupage (LTL)",
      "Cross-border customs clearance",
      "Temperature-controlled vehicles available",
      "GPS-tracked fleets across all routes",
      "Tail-lift and specialist equipment on request",
    ],
  },
  {
    id: "rail",
    icon: TrainFront,
    title: "Rail Freight",
    tagline: "Efficient inland corridors.",
    image: "/images/freight-rail.png",
    description:
      "For high-volume inland freight, rail offers a cost-efficient, lower-emission alternative to road. We operate on key Eurasian and North American corridors with intermodal flexibility.",
    features: [
      "Container and flat-wagon options",
      "Intermodal sea-rail-road combinations",
      "China-Europe express rail corridors",
      "Lower carbon footprint vs road",
      "Bulk and project cargo capability",
    ],
  },
  {
    id: "express",
    icon: Zap,
    title: "Express Courier",
    tagline: "Parcels, delivered with certainty.",
    image: "/images/freight-express.png",
    description:
      "Plug into our global courier partner network — FedEx, DHL, UPS and more — for door-to-door parcel and document delivery with guaranteed transit times and full tracking.",
    features: [
      "Next-day and same-day options in key markets",
      "Signature on delivery and POD",
      "Parcel dimensions up to 70kg per piece",
      "Insurance and declared value available",
      "Integrated tracking via our dashboard",
    ],
  },
  {
    id: "warehousing",
    icon: Warehouse,
    title: "Warehousing & Distribution",
    tagline: "Store, pack, and ship smarter.",
    image: "/images/freight-warehouse.png",
    description:
      "Our bonded and general-purpose warehousing hubs offer secure storage, pick-and-pack, kitting, and distribution services — giving you a flexible fulfilment base close to your customers.",
    features: [
      "Short and long-term storage",
      "Pick-and-pack and kitting services",
      "Bonded warehouse facility",
      "Inventory management system integration",
      "Same-day dispatch cut-off available",
    ],
  },
]

const STATS = [
  { value: "120+", label: "Countries covered" },
  { value: "6", label: "Freight modes" },
  { value: "48k", label: "Shipments per year" },
  { value: "99.2%", label: "On-time rate" },
]

// ── Page ───────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative min-h-[55vh] overflow-hidden bg-black pt-20 text-white">
          <div className="absolute inset-0">
            <Image src="/images/hero-cargo.png" alt="" fill priority sizes="100vw"
              className="object-cover object-center" style={{ opacity: 0.45 }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
          <div className="relative mx-auto flex min-h-[55vh] max-w-7xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
              What we offer
            </span>
            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Every mode of freight,<br />
              <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">
                one trusted partner
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-300">
              From urgent air shipments to bulk ocean cargo and bonded warehousing —
              Global Mail Express gives your supply chain a single point of contact across all modes.
            </p>
            <div className="mt-8">
              <Link href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-500">
                Get a free quote <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <section className="bg-gray-900 py-12">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-4xl font-black tracking-tight text-white sm:text-5xl">{s.value}</span>
                <span className="text-sm text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Service detail cards ───────────────────────────────────────── */}
        {SERVICES.map((svc, i) => {
          const even = i % 2 === 0
          return (
            <section
              key={svc.id}
              id={svc.id}
              className={even ? "bg-white py-20" : "bg-[#f5f5f7] py-20"}
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${!even ? "lg:[&>*:first-child]:order-2" : ""}`}>

                  {/* Text */}
                  <div>
                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-rose-600 text-white shadow-lg">
                      <svc.icon className="size-6" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                      {svc.tagline}
                    </span>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                      {svc.title}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-gray-500">
                      {svc.description}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {svc.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-rose-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact"
                      className="mt-8 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-rose-300 hover:text-rose-600">
                      Enquire about {svc.title} <ArrowRight className="size-4" />
                    </Link>
                  </div>

                  {/* Image */}
                  <div className="overflow-hidden rounded-2xl shadow-xl shadow-gray-200">
                    <Image src={svc.image} alt={svc.title} width={640} height={420}
                      className="h-[340px] w-full object-cover transition-transform duration-700 hover:scale-105" />
                  </div>
                </div>
              </div>
            </section>
          )
        })}

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gray-900 py-24">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="size-[600px] rounded-full bg-rose-600/10 blur-3xl" />
          </div>
          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
            <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">
              Ready to ship?
            </span>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tell us about your cargo and we'll find the best route
            </h2>
            <p className="max-w-xl text-gray-400">
              Our operations team responds with a tailored quote, usually within one business day.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-bold text-white hover:bg-rose-500">
                Request a quote
              </Link>
              <Link href="/track"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">
                <PackageSearch className="size-4" /> Track a shipment
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
