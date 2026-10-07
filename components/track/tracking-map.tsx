"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix default marker icon paths broken by Next.js webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface GeoPoint { lat: number; lng: number; label: string }
interface Props {
  origin:      GeoPoint
  destination: GeoPoint
  current:     GeoPoint
}

// ── Quadratic bezier arc ──────────────────────────────────────────────────────
function curvedArcPoints(
  from: { lat: number; lng: number },
  to:   { lat: number; lng: number },
  segments = 80,
  curvature = 0.22,
): [number, number][] {
  const points: [number, number][] = []
  const midLat = (from.lat + to.lat) / 2
  const midLng = (from.lng + to.lng) / 2
  const dlat = to.lat - from.lat
  const dlng = to.lng - from.lng
  const dist  = Math.sqrt(dlat * dlat + dlng * dlng)
  if (dist === 0) return [[from.lat, from.lng], [to.lat, to.lng]]
  const ctrlLat = midLat + curvature * dist * (-dlng / dist)
  const ctrlLng = midLng + curvature * dist * ( dlat / dist)
  for (let i = 0; i <= segments; i++) {
    const t  = i / segments
    const t1 = 1 - t
    points.push([
      t1 * t1 * from.lat + 2 * t1 * t * ctrlLat + t * t * to.lat,
      t1 * t1 * from.lng + 2 * t1 * t * ctrlLng + t * t * to.lng,
    ])
  }
  return points
}

// ── Marker icons ──────────────────────────────────────────────────────────────

function dotIcon(color: string, size = 16) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function labelIcon(color: string, label: string) {
  const dot = 18
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
        <div style="
          width:${dot}px;height:${dot}px;border-radius:50%;
          background:${color};border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
        "></div>
        <div style="
          background:${color};color:white;
          font-size:10px;font-weight:700;letter-spacing:0.03em;
          padding:2px 7px;border-radius:4px;
          white-space:nowrap;
          box-shadow:0 1px 4px rgba(0,0,0,0.3);
        ">${label}</div>
      </div>`,
    iconSize:   [120, dot + 24],
    iconAnchor: [60, dot / 2],   // centre the whole icon on the dot
  })
}

function currentLocationIcon() {
  const color = "#f59e0b"
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:32px;height:32px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.22;
          animation:gme-pulse 1.8s ease-out infinite;
        "></div>
        <div style="
          position:absolute;inset:5px;border-radius:50%;
          background:${color};opacity:0.32;
          animation:gme-pulse 1.8s ease-out infinite 0.4s;
        "></div>
        <div style="
          position:absolute;top:50%;left:50%;
          width:18px;height:18px;margin:-9px 0 0 -9px;
          border-radius:50%;background:${color};
          border:3px solid white;
          box-shadow:0 2px 10px rgba(245,158,11,0.65);
        "></div>
      </div>
      <style>
        @keyframes gme-pulse {
          0%   { transform:scale(1);   opacity:0.35; }
          100% { transform:scale(2.8); opacity:0;    }
        }
      </style>`,
    iconSize:   [32, 32],
    iconAnchor: [16, 16],
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TrackingMap({ origin, destination, current }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // ── Guard: skip if coords are not yet valid ──────────────────────────
    if (
      origin.lat === 0 && origin.lng === 0 &&
      destination.lat === 0 && destination.lng === 0
    ) return

    // ── Create fresh map every time coords change ────────────────────────
    const map = L.map(el, { zoomControl: true })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    // Dashed grey arc: full route (origin → destination)
    const fullArc = curvedArcPoints(origin, destination, 80, 0.22)
    L.polyline(fullArc, {
      color:     "#94a3b8",
      weight:    2.5,
      dashArray: "7 6",
      opacity:   0.8,
    }).addTo(map)

    // Solid rose arc: covered distance (origin → current)
    const coveredArc = curvedArcPoints(origin, current, 60, 0.22)
    L.polyline(coveredArc, {
      color:   "#e11d48",
      weight:  3.5,
      opacity: 0.95,
    }).addTo(map)

    // Origin marker (dark, labelled)
    L.marker([origin.lat, origin.lng], { icon: labelIcon("#1e293b", "Origin") })
      .addTo(map)
      .bindPopup(`<b>📦 Origin</b><br>${origin.label}`)

    // Destination marker (green, labelled)
    L.marker([destination.lat, destination.lng], { icon: labelIcon("#16a34a", "Destination") })
      .addTo(map)
      .bindPopup(`<b>🏁 Destination</b><br>${destination.label}`)

    // Current location marker — tooltip always visible, no click needed

    L.marker([current.lat, current.lng], { icon: currentLocationIcon() })
      .addTo(map)
      .bindTooltip(
        `<b>📍 Current Location</b><br>${current.label}`,
        {
          permanent:  true,
          direction:  "top",
          offset:     [0, -38],
          className:  "gme-current-tooltip",
        },
      )

    // Fit all three points in view with padding
    const bounds = L.latLngBounds([
      [origin.lat,      origin.lng],
      [destination.lat, destination.lng],
      [current.lat,     current.lng],
    ])
    map.fitBounds(bounds, { padding: [50, 50] })

    // Cleanup — destroy map when effect re-runs or component unmounts
    return () => { map.remove() }

  }, [
    origin.lat, origin.lng, origin.label,
    destination.lat, destination.lng, destination.label,
    current.lat, current.lng, current.label,
  ])

  return (
    <>
      <style>{`
        .gme-current-tooltip {
          background: #1e293b;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          white-space: nowrap;
          max-width: 220px;
        }
        .gme-current-tooltip::before {
          border-top-color: #1e293b !important;
        }
        .leaflet-tooltip-top.gme-current-tooltip::before {
          border-top-color: #1e293b !important;
        }
      `}</style>
      <div ref={containerRef} style={{ height: "420px", width: "100%" }} />
    </>
  )
}
