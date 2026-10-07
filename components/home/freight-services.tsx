import Image from "next/image"
import { Plane, Ship, Truck, TrainFront, Zap, Warehouse } from "lucide-react"

const FREIGHT_TYPES = [
  {
    id: "air",
    title: "Air Freight",
    description: "Priority air cargo for time-critical shipments with 24-48hr transit to major hubs.",
    image: "/images/freight-air.png",
    icon: Plane,
  },
  {
    id: "ocean",
    title: "Ocean Freight",
    description: "Full and part container loads across the world's busiest shipping lanes.",
    image: "/images/freight-ocean.png",
    icon: Ship,
  },
  {
    id: "road",
    title: "Road Freight",
    description: "Cross-border trucking and last-mile haulage backed by a vetted carrier network.",
    image: "/images/freight-road.png",
    icon: Truck,
  },
  {
    id: "rail",
    title: "Rail Freight",
    description: "Cost-efficient intermodal rail for high-volume inland freight movement.",
    image: "/images/freight-rail.png",
    icon: TrainFront,
  },
  {
    id: "express",
    title: "Express Courier",
    description: "Door-to-door parcel delivery through our courier partner network.",
    image: "/images/freight-express.png",
    icon: Zap,
  },
  {
    id: "warehousing",
    title: "Warehousing",
    description: "Secure storage, pick-and-pack and distribution from regional hubs.",
    image: "/images/freight-warehouse.png",
    icon: Warehouse,
  },
]

// Duplicate items for seamless infinite scroll
const TRACK_ITEMS = [...FREIGHT_TYPES, ...FREIGHT_TYPES]

export function FreightServices() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-[#0d0d0d] py-24"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* Section header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
            What we move
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            One partner for every mode of freight
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-white/50">
            We have earned a reputation for reliability and precision, providing timely and
            efficient transportation solutions to businesses and individuals across the globe.
          </p>
        </div>
      </div>

      {/* Auto-scrolling cards strip */}
      <div
        className="relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex w-max animate-freight-scroll gap-6 px-3">
          {TRACK_ITEMS.map((service, i) => (
            <div
              key={`${service.id}-${i}`}
              className="group relative flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] transition-transform duration-300 hover:-translate-y-1 hover:border-white/20 sm:w-80"
            >
              {/* Image */}
              <div className="relative h-44 w-full overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/30 to-transparent" />
                {/* Icon badge */}
                <span className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-lg bg-rose-600 text-white shadow-lg">
                  <service.icon className="size-4" />
                </span>
              </div>

              {/* Text */}
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex items-center gap-2">
                  <service.icon className="size-3.5 text-rose-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-rose-500">
                    {service.title}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white">{service.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
