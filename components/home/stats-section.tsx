const STATS = [
  { value: "120+", label: "Countries served" },
  { value: "48k", label: "Shipments delivered yearly" },
  { value: "99.2%", label: "On-time delivery rate" },
  { value: "24/7", label: "Shipment monitoring" },
]

export function StatsSection() {
  return (
    <section className="bg-gray-900 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
            <span className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {stat.value}
            </span>
            <span className="text-sm text-gray-400">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
