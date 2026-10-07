"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

const FREIGHT_BARS = [
  {
    label: "Air Freight",
    percent: 75,
    color: "from-rose-500 to-violet-500",
  },
  {
    label: "Sea Freight",
    percent: 92,
    color: "from-rose-500 to-violet-600",
  },
  {
    label: "Railway Freight",
    percent: 65,
    color: "from-rose-400 to-violet-500",
  },
  {
    label: "Road Freight",
    percent: 88,
    color: "from-rose-500 to-violet-500",
  },
]

function AnimatedBar({
  percent,
  color,
  animate,
}: {
  percent: number
  color: string
  animate: boolean
}) {
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
        style={{ width: animate ? `${percent}%` : "0%" }}
      />
    </div>
  )
}

export function FreightStats() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left — text + bars */}
          <div>
            {/* Eyebrow */}
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Our expertise
            </span>

            {/* Heading */}
            <div className="mt-3 flex items-start justify-between">
              <h2 className="max-w-md text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                We are modern and trusted logistics
              </h2>
              {/* Years badge */}
              <div className="hidden flex-col items-end text-right sm:flex">
                <span className="text-6xl font-black leading-none tracking-tighter text-foreground/10 sm:text-8xl">
                  16+
                </span>
                <span className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  years of
                  <br />
                  experience
                </span>
              </div>
            </div>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
              At Global Mail Express, we believe in delivering unparalleled service to our customers.
              With decades of experience in the industry, we have earned a reputation for
              reliability and precision, providing timely and efficient transportation solutions.
            </p>

            {/* Progress bars */}
            <div className="mt-10 space-y-6">
              {FREIGHT_BARS.map((bar) => (
                <div key={bar.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-accent">{bar.label}</span>
                    <span
                      className="text-base font-bold text-foreground transition-all duration-1000"
                      style={{ opacity: animate ? 1 : 0 }}
                    >
                      {bar.percent}%
                    </span>
                  </div>
                  <AnimatedBar percent={bar.percent} color={bar.color} animate={animate} />
                </div>
              ))}
            </div>
          </div>

          {/* Right — cargo image */}
          <div className="relative hidden lg:block">
            <div className="overflow-hidden rounded-2xl shadow-2xl shadow-primary/10">
              <Image
                src="/images/about-hub.png"
                alt="Cargo operations at Global Mail Express hub"
                width={620}
                height={480}
                className="h-[420px] w-full object-cover"
              />
            </div>
            {/* Decorative accent ring */}
            <div className="pointer-events-none absolute -bottom-4 -right-4 size-40 rounded-full bg-accent/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
