import Image from "next/image"
import Link from "next/link"
import {
  Globe2, ShieldCheck, Clock3, Award,
  Users, TrendingUp, Leaf, ArrowRight,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// ── Data ───────────────────────────────────────────────────────────────────

const STATS = [
  { value: "16+", label: "Years in operation" },
  { value: "120+", label: "Countries served" },
  { value: "48k", label: "Shipments yearly" },
  { value: "99.2%", label: "On-time delivery" },
]

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Reliability",
    description:
      "We treat every shipment with the same rigour regardless of size. Our SLA commitments are backed by real-time monitoring and escalation processes that kick in the moment anything deviates.",
  },
  {
    icon: Globe2,
    title: "Global reach",
    description:
      "With partners on every continent and direct carrier relationships across 120+ countries, we can route your cargo faster and more cost-effectively than single-mode operators.",
  },
  {
    icon: Clock3,
    title: "Transparency",
    description:
      "Live tracking on every shipment, proactive status updates, and a dedicated operations contact. You'll never have to chase us for information.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "We actively work with low-emission carriers, promote rail over road where feasible, and report carbon footprint per shipment to help customers meet their ESG targets.",
  },
  {
    icon: Users,
    title: "Partnership",
    description:
      "We embed ourselves as an extension of your logistics team — learning your processes, anticipating your needs, and growing with your business.",
  },
  {
    icon: Award,
    title: "Compliance",
    description:
      "Fully licensed freight forwarder and customs broker. IATA certified for air cargo. Our documentation team ensures shipments clear borders smoothly, every time.",
  },
]

const TIMELINE = [
  { year: "2008", title: "Founded", detail: "Global Mail Express was established with a focus on express mail and road freight, serving customers across multiple regions." },
  { year: "2011", title: "Air & Ocean added", detail: "Launched air freight and FCL ocean services through key carrier partnerships, expanding global reach." },
  { year: "2015", title: "Global expansion", detail: "Extended operations to serve Asia-Pacific, Middle East, and Africa corridors through strategic partnerships." },
  { year: "2018", title: "Live tracking platform", detail: "Launched our proprietary tracking platform giving customers real-time shipment visibility from pickup to delivery." },
  { year: "2021", title: "100 countries", detail: "Crossed the milestone of active shipment coverage across 100+ countries worldwide." },
  { year: "2024", title: "Warehousing network", detail: "Expanded into bonded and general-purpose warehousing across five regional distribution hubs." },
]

// ── Page ───────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative min-h-[55vh] overflow-hidden bg-black pt-20 text-white">
          <div className="absolute inset-0">
            <Image src="/images/about-hub.png" alt="" fill priority sizes="100vw"
              className="object-cover object-center" style={{ opacity: 0.45 }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
          <div className="relative mx-auto flex min-h-[55vh] max-w-7xl flex-col justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
              Who we are
            </span>
            <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Moving the world's cargo<br />
              <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">
                since 2008
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-300">
              Global Mail Express is a multi-modal freight forwarder operating across air, ocean,
              road and rail — connecting businesses and individuals to every corner of the world
              with precision, transparency, and care.
            </p>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <section className="bg-gray-900 py-14">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                <span className="text-4xl font-black tracking-tight text-white sm:text-5xl">{s.value}</span>
                <span className="text-sm text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Story ─────────────────────────────────────────────────────── */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Our story</span>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Built on trust, grown on results
                </h2>
                <div className="mt-5 space-y-4 text-base leading-relaxed text-gray-500">
                  <p>
                    Global Mail Express was founded with a simple belief: that shippers
                    deserve a freight partner that communicates clearly, moves cargo reliably,
                    and takes ownership when things go wrong.
                  </p>
                  <p>
                    We steadily expanded our capabilities
                    to cover air, ocean, and rail — building carrier partnerships that give our
                    customers access to the most competitive rates and fastest routes on every corridor.
                  </p>
                  <p>
                    Today we're a global operation, but our values remain the same: no surprises,
                    proactive communication, and a team that genuinely cares about your supply chain.
                  </p>
                </div>
                <Link href="/contact"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white hover:bg-rose-500">
                  Work with us <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="overflow-hidden rounded-2xl shadow-xl shadow-gray-200">
                <Image src="/images/about-hub.png" alt="Global Mail Express operations hub"
                  width={640} height={480} className="h-[400px] w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Values ────────────────────────────────────────────────────── */}
        <section className="bg-[#f5f5f7] py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">What drives us</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our values
              </h2>
              <p className="mt-3 text-base text-gray-500">
                Six principles that shape how we work with every customer, every day.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((v) => (
                <div key={v.title}
                  className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-rose-600 text-white">
                    <v.icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Timeline ──────────────────────────────────────────────────── */}
        <section className="bg-gray-900 py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Our journey</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Key milestones
              </h2>
            </div>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 h-full w-px bg-white/10 sm:left-1/2" />
              <div className="space-y-10">
                {TIMELINE.map((item, i) => {
                  const isLeft = i % 2 === 0
                  return (
                    <div key={item.year}
                      className={`relative flex items-start gap-6 sm:gap-0 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                      {/* Year bubble — centred on the line on desktop */}
                      <div className="z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-black text-white shadow-lg sm:absolute sm:left-1/2 sm:-ml-6">
                        {item.year.slice(2)}
                      </div>
                      {/* Card */}
                      <div className={`ml-6 sm:ml-0 sm:w-[calc(50%-2.5rem)] ${isLeft ? "sm:pr-6 sm:text-right" : "sm:ml-[calc(50%+2.5rem)] sm:pl-6"}`}>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                          <p className="text-xs font-bold uppercase tracking-wider text-rose-400">{item.year}</p>
                          <h3 className="mt-1 text-base font-bold text-white">{item.title}</h3>
                          <p className="mt-1 text-sm text-gray-400">{item.detail}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white py-24">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="size-[500px] rounded-full bg-rose-100/60 blur-3xl" />
          </div>
          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to move freight with a partner you can trust?
            </h2>
            <p className="max-w-xl text-gray-500">
              Get in touch with our team and we'll put together a tailored freight solution
              for your business, usually within one business day.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/contact"
                className="rounded-full bg-rose-600 px-7 py-3 text-sm font-bold text-white hover:bg-rose-500">
                Contact us
              </Link>
              <Link href="/services"
                className="rounded-full border border-gray-200 px-7 py-3 text-sm font-bold text-gray-800 hover:border-rose-300 hover:text-rose-600">
                Explore services
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
