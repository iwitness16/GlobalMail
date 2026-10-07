"use client"

import dynamic from "next/dynamic"

interface GeoPoint { lat: number; lng: number; label: string }

const TrackingMap = dynamic(() => import("./tracking-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] items-center justify-center bg-gray-100 text-sm text-gray-400">
      Loading map…
    </div>
  ),
})

interface Props {
  origin:      GeoPoint
  destination: GeoPoint
  current:     GeoPoint
}

export function TrackingMapWrapper({ origin, destination, current }: Props) {
  return <TrackingMap origin={origin} destination={destination} current={current} />
}
