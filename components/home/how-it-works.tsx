import { PackagePlus, Route, MapPinned, CheckCircle2 } from "lucide-react"

const STEPS = [
  {
    icon: PackagePlus,
    title: "Book your shipment",
    description:
      "Share pickup and delivery details, cargo type and preferred freight mode with our team.",
  },
  {
    icon: Route,
    title: "We plan the route",
    description:
      "Global Mail Express coordinates the fastest compliant route across our carrier network.",
  },
  {
    icon: MapPinned,
    title: "Track it live",
    description:
      "Follow your shipment on a live map with status updates at every checkpoint.",
  },
  {
    icon: CheckCircle2,
    title: "Confirmed delivery",
    description: "Receive confirmation the moment your shipment reaches its destination.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
            How it works
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            From pickup to proof of delivery
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            A simple four-step process keeps you in control from the moment you book to the
            moment your cargo is signed for.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={step.title} className="relative flex flex-col gap-4">
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="absolute left-[calc(100%+1rem)] top-6 hidden h-px w-8 bg-gray-200 lg:block" />
              )}
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
                  <step.icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-rose-600">Step {index + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
