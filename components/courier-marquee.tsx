"use client"

import { useState } from "react"

const PARTNERS = [
  { name: "FedEx",      file: "fedex.png"     },
  { name: "UPS",        file: "ups.jpg"       },
  { name: "USPS",       file: "usps.png"      },
  { name: "DHL",        file: "dhl.png"       },
  { name: "Aramex",     file: "aramex.jpg"    },
  { name: "TNT",        file: "tnt.jpg"       },
  { name: "Royal Mail", file: "royalmail.png" },
]

function PartnerMark({ name, file }: { name: string; file: string }) {
  const [broken, setBroken] = useState(false)

  if (broken) {
    return (
      <span className="whitespace-nowrap text-2xl font-bold text-white">
        {name}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/${file}`}
      alt={name}
      style={{ height: "56px", width: "auto", objectFit: "contain", display: "block" }}
      onError={() => setBroken(true)}
    />
  )
}

export function CourierMarquee({ tone = "light" }: { tone?: "light" | "dark" }) {
  const track = [...PARTNERS, ...PARTNERS]

  return (
    <div
      className="group relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className="flex w-max animate-marquee items-center gap-20 py-2 group-hover:[animation-play-state:paused]"
      >
        {track.map((partner, i) => (
          <div key={`${partner.name}-${i}`} className="flex shrink-0 items-center justify-center">
            <PartnerMark {...partner} />
          </div>
        ))}
      </div>
    </div>
  )
}
