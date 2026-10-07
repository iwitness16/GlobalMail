"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const TESTIMONIALS = [
  {
    quote:
      "I had a great experience with Global Mail Express. Their team was very professional and responsive from the beginning until the final delivery. They kept me updated throughout the process and ensured everything arrived safely and on time. It's rare to find a logistics company that combines efficiency with excellent customer service. I highly recommend them to anyone looking for reliable shipping solutions.",
    name: "Helena Brandt",
    role: "Supply Chain Manager, Nordholt Retail",
    avatar: "/images/rev1.jpg",
  },
  {
    quote:
      "We moved our entire ocean freight program to Global Mail Express. Visibility from booking to delivery is the best we've had in over a decade. The live tracking dashboard means our warehouse team is never caught off guard, and our customs delays have been cut in half. Outstanding service all round.",
    name: "Rafael Duarte",
    role: "Operations Director, Duarte Import Co.",
    avatar: "/images/rev2.jpg",
  },
  {
    quote:
      "Our customers get real tracking updates instead of guesswork. The support response time is excellent and the team genuinely cares about every shipment. Global Mail Express has transformed how we handle international logistics — we wouldn't go back.",
    name: "Wei Lin",
    role: "Founder, Lin & Co. Trading",
    avatar: "/images/rev3.jpg",
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [animClass, setAnimClass] = useState("")
  const [visible, setVisible] = useState(true)

  const goTo = useCallback(
    (next: number) => {
      if (!visible) return
      setVisible(false)
      setAnimClass("animate-slide-out-left")

      setTimeout(() => {
        setCurrent(next)
        setAnimClass("animate-slide-in-right")
        setVisible(true)
      }, 360)
    },
    [visible],
  )

  const prev = () => goTo((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const next = () => goTo((current + 1) % TESTIMONIALS.length)

  // Auto-advance every 7 seconds
  useEffect(() => {
    const id = setInterval(() => {
      goTo((current + 1) % TESTIMONIALS.length)
    }, 7000)
    return () => clearInterval(id)
  }, [current, goTo])

  const t = TESTIMONIALS[current]

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background: pink → purple */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700" />
      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto flex min-h-[440px] max-w-4xl flex-col items-center justify-center px-6 py-20 sm:px-12 lg:px-16">
        {/* Heading */}
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          what customers think
        </h2>

        {/* Slider */}
        <div className="relative w-full">
          {/* Prev button */}
          <button
            onClick={prev}
            aria-label="Previous review"
            className="absolute -left-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 sm:-left-6 lg:-left-14"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Review card */}
          <div
            key={current}
            className={`flex flex-col items-center gap-8 text-center ${animClass}`}
          >
            {/* Avatar */}
            <div className="relative size-20 overflow-hidden rounded-full ring-4 ring-white/30 sm:size-24">
              <Image
                src={t.avatar}
                alt={t.name}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback to initials if image not found
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = "none"
                }}
              />
              {/* Initials fallback rendered behind the image */}
              <div className="absolute inset-0 flex items-center justify-center bg-white/20 text-xl font-bold text-white">
                {t.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </div>

            {/* Quote */}
            <blockquote className="max-w-2xl text-pretty text-lg font-light italic leading-relaxed text-white sm:text-xl">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            {/* Attribution */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-white">{t.name}</span>
              <span className="text-sm text-white/60">{t.role}</span>
            </div>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to review ${i + 1}`}
                  className={`size-2 rounded-full transition-all ${
                    i === current ? "w-6 bg-white" : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={next}
            aria-label="Next review"
            className="absolute -right-2 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 sm:-right-6 lg:-right-14"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
