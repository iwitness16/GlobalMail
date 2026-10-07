"use client"

import { useState } from "react"

export function Logo() {
  const [broken, setBroken] = useState(false)
  return (
    <div className="flex items-center gap-2.5">
      {!broken && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/images/logo.png"
          alt="Global Mail Express"
          className="size-9 rounded-lg object-cover"
          crossOrigin="anonymous"
          onError={() => setBroken(true)}
        />
      )}
      <span className="flex flex-col leading-none">
        <span className="text-base font-semibold tracking-tight text-foreground">Global Mail Express</span>
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">Freight &amp; Logistics</span>
      </span>
    </div>
  )
}
