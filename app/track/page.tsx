"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Package, Printer, MapPin, Info, History, Ruler } from "lucide-react"
import { getShipmentByTracking, silentUpdateLocation } from "@/lib/shipment-service"
import { computeLivePosition, reverseGeocode } from "@/lib/location-engine"
import type { Shipment, ShipmentPackage } from "@/lib/database.types"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AlertPopup } from "@/components/track/alert-popup"
import { StatusPipeline } from "@/components/track/status-pipeline"
import { TrackingMapWrapper } from "@/components/track/tracking-map-wrapper"
import { BarcodeDisplay } from "@/components/track/barcode-display"

function TrackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") ?? ""

  const [query, setQuery]         = useState(initialQuery)
  const [loading, setLoading]     = useState(false)
  const [shipment, setShipment]   = useState<Shipment | null>(null)
  const [notFound, setNotFound]   = useState(false)
  const [error, setError]         = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [searched, setSearched]   = useState(false)
  const [livePos, setLivePos]     = useState<{
    lat: number; lng: number; label: string; percent: number; note: string
  } | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setNotFound(false)
    setError("")
    setShipment(null)
    setLivePos(null)
    setSearched(true)
    try {
      const result = await getShipmentByTracking(query.trim())
      if (!result) {
        setNotFound(true)
      } else {
        // ── Compute live position at this exact tracking moment ──────────
        // Log DB state for debugging expired segment issues
        if (process.env.NODE_ENV === "development") {
          console.log("[TRACK] segments:", JSON.stringify(result.motion_segments))
          console.log("[TRACK] current_lat/lng:", result.current_lat, result.current_lng)
          console.log("[TRACK] expected_delivery:", result.expected_delivery)
          console.log("[TRACK] dispatch_datetime:", result.dispatch_datetime)
          console.log("[TRACK] status:", result.status)
          console.log("[TRACK] now:", new Date().toISOString())
        }
        const pos = computeLivePosition(result, Date.now())

        // ── Reverse geocode for a real place name (async, non-blocking) ──
        // Only needed for mobile states where bezier may land over water.
        // Stationary and delivered states already have real labels.
        const MOBILE = new Set(["in_transit", "out_for_delivery", "picked_up"])
        let resolvedLabel = pos.label
        if (MOBILE.has(result.status) && pos.percent > 2 && pos.percent < 98) {
          resolvedLabel = await reverseGeocode(pos.lat, pos.lng, pos.label)
        }
        const finalPos = { ...pos, label: resolvedLabel }
        setLivePos(finalPos)

        // ── Silent DB write — no history entry, no notification ──────────
        silentUpdateLocation(result.id, finalPos.lat, finalPos.lng, finalPos.label, finalPos.percent)

        setShipment(result)
        if (result.alert_type && result.alert_message) setShowAlert(true)
        router.replace(`/track?q=${encodeURIComponent(query.trim())}`, { scroll: false })
      }
    } catch (err: any) {
      setError(err.message ?? "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() { window.print() }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gray-50">

        {/* Hero search */}
        <section className="relative bg-gray-900 pb-14 pt-32">
          <div className="absolute inset-0">
            <Image src="/images/track-hero.png" alt="" fill className="object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-900" />
          </div>
          <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
            <span className="inline-block rounded-full bg-rose-600/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-rose-400">
              Shipment Tracking
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Track your shipment</h1>
            <p className="mt-3 text-sm text-gray-400">
              Enter your consignment number to get live status, location, and delivery updates.
            </p>
            <form onSubmit={handleSearch} className="mt-8 flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. GMEABCDEFGHIJ-CARGO"
                className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-400 outline-none backdrop-blur-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {loading
                  ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <Search className="size-4" />}
                Track
              </button>
            </form>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {searched && notFound && !loading && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <Package className="size-12 text-gray-300" />
              <p className="font-semibold text-gray-700">Tracking number not found</p>
              <p className="text-sm text-gray-400">Double-check the number and try again.</p>
            </div>
          )}

          {shipment && livePos && (
            <div className="space-y-6">
              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-mono text-sm font-bold text-gray-700">{shipment.tracking_number}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <Printer className="size-4" /> Print
                  </button>
                </div>
              </div>

              {/* Barcode */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <BarcodeDisplay value={shipment.tracking_number} />
              </div>

              {/* Status pipeline */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-bold uppercase tracking-wide text-gray-700">
                  <Package className="size-4 text-gray-400" /> Shipment Status
                </div>
                <StatusPipeline status={shipment.status} />
              </div>

              {/* ── Computed live location card ───────────────────────── */}
              <div className="flex items-start gap-4 rounded-xl border border-rose-100 bg-rose-50 p-5 shadow-sm">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                  <MapPin className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-500">Current Location</p>
                  <p className="mt-0.5 text-base font-semibold text-gray-900">{livePos.label}</p>
                  <p className="mt-1 text-sm text-rose-700">{livePos.note}</p>                  {/* Journey progress bar */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-rose-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-violet-500 transition-all duration-1000"
                      style={{ width: `${livePos.percent}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-rose-400">
                    <span>{shipment.origin}</span>
                    <span>{livePos.percent}%</span>
                    <span>{shipment.destination}</span>
                  </div>
                </div>
              </div>

              {/* ── Status Updates & History ──────────────────────────── */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                  <History className="size-4 text-rose-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
                    Status Updates &amp; History
                  </h3>
                </div>
                {shipment.history && shipment.history.length > 0 ? (
                  <div className="p-6">
                    <ol className="relative space-y-0 before:absolute before:left-[9px] before:top-2 before:h-[calc(100%-1rem)] before:w-0.5 before:bg-gray-100">
                      {[...shipment.history].reverse().map((h, i) => {
                        const isLatest = i === 0
                        return (
                          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                            <span className={`relative z-10 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              isLatest ? "border-rose-500 bg-rose-500" : "border-gray-200 bg-white"
                            }`}>
                              <span className={`size-1.5 rounded-full ${isLatest ? "bg-white" : "bg-gray-300"}`} />
                            </span>
                            <div className="flex flex-1 flex-col gap-0.5 pt-0.5">
                              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                                {h.status && (
                                  <span className={`text-sm font-bold ${isLatest ? "text-rose-600" : "text-gray-800"}`}>
                                    {h.status}
                                  </span>
                                )}
                              </div>
                              {h.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="size-3 text-gray-400" />{h.location}
                                </div>
                              )}
                              {h.remarks && <p className="text-xs text-gray-400">{h.remarks}</p>}
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <History className="size-8 text-gray-200" />
                    <p className="text-sm text-gray-400">No status updates recorded yet.</p>
                    <p className="text-xs text-gray-300">Updates will appear here as the shipment progresses.</p>
                  </div>
                )}
              </div>

              {/* Shipment Info — no shipper/receiver/freight mode */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 border-b border-gray-100 pb-3 text-sm font-bold text-gray-800">
                  Shipment Information
                </h3>
                <ShipmentInfoGrid shipment={shipment} />
              </div>

              {/* ── Live map ─── */}
              {shipment.origin_lat !== 0 && shipment.destination_lat !== 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                  <TrackingMapWrapper
                    origin={{ lat: shipment.origin_lat, lng: shipment.origin_lng, label: shipment.origin }}
                    destination={{ lat: shipment.destination_lat, lng: shipment.destination_lng, label: shipment.destination }}
                    current={{ lat: livePos.lat, lng: livePos.lng, label: livePos.label }}
                  />
                </div>
              )}

              {/* ── Package dimensions ────────────────────────────────── */}
              {shipment.packages && shipment.packages.length > 0 && (
                <PackageDimensions packages={shipment.packages} />
              )}

              {/* Remarks */}
              {shipment.remarks && (
                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                  <Info className="mt-0.5 size-4 shrink-0 text-blue-400" />
                  <p>{shipment.remarks}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />

      {shipment && showAlert && shipment.alert_type && (
        <AlertPopup
          trackingNumber={shipment.tracking_number}
          status={shipment.status}
          alertType={shipment.alert_type}
          alertMessage={shipment.alert_message ?? ""}
          feesAmount={shipment.fees_amount}
          onClose={() => setShowAlert(false)}
        />
      )}
    </>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-bold text-gray-700">{label}:</p>
      <p className="mt-0.5 text-sm text-gray-500">{value}</p>
    </div>
  )
}

function ShipmentInfoGrid({ shipment }: { shipment: Shipment }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
      <InfoItem label="Origin"            value={shipment.origin} />
      <InfoItem label="Destination"       value={shipment.destination} />
      <InfoItem label="Status"            value={shipment.status.replace(/_/g, " ")} />
      <InfoItem label="Type"              value={shipment.shipment_type} />
      <InfoItem label="Product"           value={shipment.product} />
      <InfoItem label="Weight"            value={`${shipment.weight_kg} kg`} />
      <InfoItem label="Qty."              value={String(shipment.quantity)} />
      <InfoItem label="Payment Mode"      value={shipment.payment_mode.replace(/_/g, " ").toUpperCase()} />
      <InfoItem label="Carrier Ref"       value={shipment.carrier_ref} />
      <InfoItem label="Pickup Date"       value={shipment.pickup_date ?? ""} />
      <InfoItem label="Expected Delivery" value={shipment.expected_delivery ? new Date(shipment.expected_delivery).toLocaleString() : ""} />
      <InfoItem label="Comments"          value={shipment.comments} />
    </div>
  )
}

function PackageDimensions({ packages }: { packages: ShipmentPackage[] }) {
  const totalWeight = packages.reduce((s, p) => s + p.weight_kg * p.qty, 0)
  const totalVol = packages.reduce(
    (s, p) => s + ((p.length_cm * p.width_cm * p.height_cm) / 1_000_000) * p.qty,
    0,
  )
  const volumetricWeight = totalVol * 167

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
        <Ruler className="size-4 text-gray-400" />
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">Package Dimensions</h3>
      </div>

      {/* Per-package rows */}
      {packages.length > 0 && (
        <div className="mb-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="pb-2 pr-4">Qty</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">L (cm)</th>
                <th className="pb-2 pr-4">W (cm)</th>
                <th className="pb-2 pr-4">H (cm)</th>
                <th className="pb-2 pr-4">Weight (kg)</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {packages.map((p, i) => (
                <tr key={i}>
                  <td className="py-2 pr-4 text-gray-700">{p.qty}</td>
                  <td className="py-2 pr-4 text-gray-700">{p.piece_type}</td>
                  <td className="py-2 pr-4 text-gray-500">{p.length_cm > 0 ? p.length_cm : "-"}</td>
                  <td className="py-2 pr-4 text-gray-500">{p.width_cm > 0 ? p.width_cm : "-"}</td>
                  <td className="py-2 pr-4 text-gray-500">{p.height_cm > 0 ? p.height_cm : "-"}</td>
                  <td className="py-2 pr-4 text-gray-700">{p.weight_kg} kg</td>
                  <td className="py-2 text-gray-500">{p.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-400">Total Actual Weight</p>
          <p className="mt-0.5 text-base font-bold text-gray-900">{totalWeight.toFixed(2)} kg</p>
        </div>
        <div className="rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-400">Total Volume</p>
          <p className="mt-0.5 text-base font-bold text-gray-900">{totalVol.toFixed(4)} m³</p>
        </div>
        <div className="rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-400">Volumetric Weight</p>
          <p className="mt-0.5 text-base font-bold text-gray-900">{volumetricWeight.toFixed(2)} kg</p>
        </div>
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackContent />
    </Suspense>
  )
}
