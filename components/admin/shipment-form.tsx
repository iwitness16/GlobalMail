"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw, Plus, Minus, Save, Loader2 } from "lucide-react"
import { LocationSearch } from "@/components/admin/location-search"
import { createShipment, updateShipment, generateTrackingNumber, snapshotLocationForHold } from "@/lib/shipment-service"
import { buildMotionSegment, computeLivePosition, computePositionFromSegment } from "@/lib/location-engine"
import { getAllBills } from "@/lib/bills-service"
import type { Bill } from "@/lib/bills-service"
import type { MotionSegment } from "@/lib/location-engine"
import type {
  Shipment, ShipmentInsert, ShipmentStatus, DeliveryMode,
  PaymentMode, AlertType, ShipmentPackage,
} from "@/lib/database.types"

// Statuses where the package actively moves along the route
const MOBILE_STATUSES = new Set(["in_transit", "out_for_delivery", "picked_up"])
// Statuses where the package is frozen in place
const STATIONARY_STATUSES = new Set(["pending", "customs", "on_hold", "delayed", "exception"])

// ─── helpers ─────────────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">{label}{required && " *"}</label>
      {children}
    </div>
  )
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:bg-gray-50"
    />
  )
}

function Select({ ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
    />
  )
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
      rows={3}
    />
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 border-b border-gray-100 pb-3 text-base font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  )
}

// ─── blank defaults ───────────────────────────────────────────────────────────

function blankPackage(): ShipmentPackage {
  return { qty: 1, piece_type: "Box", length_cm: 0, width_cm: 0, height_cm: 0, weight_kg: 0, description: "" }
}

function blankForm(): ShipmentInsert {
  return {
    tracking_number: generateTrackingNumber(),
    status: "pending",
    delivery_mode: "air_freight",
    journey_percent: 0,
    motion_segments: [],
    origin: "",
    origin_lat: 0,
    origin_lng: 0,
    destination: "",
    destination_lat: 0,
    destination_lng: 0,
    current_location: "",
    current_lat: 0,
    current_lng: 0,
    carrier_ref: "",
    pickup_date: "",
    pickup_time: "",
    dispatch_datetime: "",
    expected_delivery: "",
    shipper_name: "",
    shipper_phone: "",
    shipper_email: "",
    shipper_address: "",
    receiver_name: "",
    receiver_phone: "",
    receiver_email: "",
    receiver_address: "",
    shipment_type: "",
    product: "",
    payment_mode: "" as PaymentMode,
    total_freight: 0,
    weight_kg: 0,
    quantity: 1,
    comments: "",
    packages: [blankPackage()],
    publish_note: "",
    remarks: "",
    alert_type: null,
    alert_message: "",
    fees_amount: 0,
    history: [],
  }
}

/** Convert a full ISO timestamp to the "YYYY-MM-DDTHH:MM" format required
 *  by <input type="datetime-local">. Returns "" for null/empty values. */
function toDatetimeLocal(value: string | null | undefined): string {
  if (!value) return ""
  try {
    // Parse the ISO string and format as local datetime-local value
    const d = new Date(value)
    if (isNaN(d.getTime())) return value // already in correct format or unparseable
    // Format: YYYY-MM-DDTHH:MM (no seconds, no timezone)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return value
  }
}

// ─── component ────────────────────────────────────────────────────────────────

interface Props {
  mode: "create" | "edit"
  shipment?: Shipment
  /** Called after a successful save — lets the parent navigate/refresh instead of router.push */
  onSuccess?: () => void
}

export function ShipmentForm({ mode, shipment, onSuccess }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<ShipmentInsert>(
    mode === "edit" && shipment
      ? {
          ...shipment,
          dispatch_datetime: toDatetimeLocal(shipment.dispatch_datetime),
          expected_delivery: toDatetimeLocal(shipment.expected_delivery),
        }
      : blankForm(),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState("")
  const [bills, setBills]   = useState<Bill[]>([])

  // Load bill names for the Alert Type dropdown
  useEffect(() => {
    getAllBills()
      .then(setBills)
      .catch(() => {/* silent — bills are optional */})
  }, [])

  // ── generic setters ────────────────────────────────────────────────────────
  function set<K extends keyof ShipmentInsert>(key: K, val: ShipmentInsert[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function setPackageField(idx: number, key: keyof ShipmentPackage, val: string | number) {
    setForm((f) => {
      const pkgs = [...f.packages]
      pkgs[idx] = { ...pkgs[idx], [key]: val }
      return { ...f, packages: pkgs }
    })
  }

  // ── computed totals ────────────────────────────────────────────────────────
  const totalWeight = form.packages.reduce((s, p) => s + p.weight_kg * p.qty, 0)
  const totalVol = form.packages.reduce(
    (s, p) => s + ((p.length_cm * p.width_cm * p.height_cm) / 1_000_000) * p.qty,
    0,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const nowMs      = Date.now()
      const nowISO     = new Date(nowMs).toISOString()
      let finalForm    = { ...form }
      const prevStatus = shipment?.status ?? "pending"
      const newStatus  = form.status
      const existing   = (form.motion_segments ?? []) as MotionSegment[]

      // ── Helper: clean "En route: X → Y" labels ────────────────────────
      function cleanLabel(l: string): string {
        return l.startsWith("En route:")
          ? l.replace(/^En route:\s*/i, "").split("→")[0].trim()
          : l
      }

      // ── Helper: find where the package is right NOW ───────────────────
      // Used when we need to anchor a new segment from the current position.
      // Prefers the last active segment; falls back to DB current_lat/lng.
      function currentPosition(): { lat: number; lng: number; label: string } {
        const lastSeg = existing.length > 0 ? existing[existing.length - 1] : null
        if (lastSeg) {
          const endMs = new Date(lastSeg.end_time).getTime()
          if (nowMs < endMs) {
            // Segment is still active — compute exact position on the arc
            const pos = computePositionFromSegment(lastSeg, nowMs)
            if (pos.lat !== 0 || pos.lng !== 0) return { ...pos, label: cleanLabel(pos.label) }
          }
          // Segment expired — package was at "from_*" of this segment
          // (it never actually reached to_* since we're handling expiry now)
          // Use the segment's from_* which is where the last known real position was
          return { lat: lastSeg.from_lat, lng: lastSeg.from_lng, label: cleanLabel(lastSeg.from_label) }
        }
        // No segments — fall back to DB current position or origin
        const lat   = (shipment?.current_lat  ?? 0) !== 0 ? (shipment?.current_lat  ?? 0) : form.origin_lat
        const lng   = (shipment?.current_lng  ?? 0) !== 0 ? (shipment?.current_lng  ?? 0) : form.origin_lng
        const label = cleanLabel(shipment?.current_location || form.current_location || form.origin)
        return { lat, lng, label }
      }

      // ── Helper: did admin explicitly set a new current_location? ──────
      const adminMovedLocation =
        mode === "edit" && shipment &&
        (Math.abs((shipment.current_lat ?? 0) - form.current_lat) > 0.001 ||
         Math.abs((shipment.current_lng ?? 0) - form.current_lng) > 0.001)

      // ════════════════════════════════════════════════════════════════════
      // STEP 1 — Determine the definitive "from" position for any new segment
      //
      // Priority:
      //   1. Admin explicitly changed current_location → use that (admin override)
      //   2. Status was stationary and is still stationary → use DB frozen position
      //   3. Status is becoming/staying mobile → compute from current arc position
      // ════════════════════════════════════════════════════════════════════
      let fromPos = adminMovedLocation
        ? { lat: form.current_lat, lng: form.current_lng, label: cleanLabel(form.current_location) }
        : currentPosition()

      // ════════════════════════════════════════════════════════════════════
      // STEP 2 — Handle STATIONARY status saves
      //
      // When saving as stationary (on_hold, customs, delayed, etc.):
      //   - Snapshot the current computed position into current_lat/lng/location
      //   - This freezes the package at the right spot
      //   - If admin also changed expected_delivery at the same time, we store
      //     that too — it will be used when admin later releases to mobile
      // ════════════════════════════════════════════════════════════════════
      if (STATIONARY_STATUSES.has(newStatus)) {
        const snapLat   = adminMovedLocation ? form.current_lat   : fromPos.lat
        const snapLng   = adminMovedLocation ? form.current_lng   : fromPos.lng
        const snapLabel = adminMovedLocation ? cleanLabel(form.current_location) : fromPos.label

        finalForm = { ...finalForm,
          current_lat:      snapLat,
          current_lng:      snapLng,
          current_location: snapLabel,
        }

        // Write snapshot immediately to DB (awaited) so it's available
        // even if user tracks before the full save resolves
        if (mode === "edit" && shipment) {
          await snapshotLocationForHold(shipment.id, snapLat, snapLng, snapLabel)
        }

        // No motion segment needed for stationary states —
        // the engine reads current_lat/lng directly for these statuses
      }

      // ════════════════════════════════════════════════════════════════════
      // STEP 3 — Handle MOBILE status saves
      //
      // Build a fresh motion segment whenever:
      //   A) Status became mobile (was stationary or is new)
      //   B) Expected delivery changed
      //   C) Destination changed
      //   D) Admin explicitly moved current_location
      //   E) Last segment has expired (end_time is in the past)
      //   F) No segments exist
      //
      // The new segment REPLACES the last one if it covers the same
      // origin→destination pair (just with updated timing).
      // It APPENDS if it's a genuinely new leg (e.g. after hold release).
      // ════════════════════════════════════════════════════════════════════
      if (MOBILE_STATUSES.has(newStatus) && form.destination_lat !== 0 && form.expected_delivery) {

        const lastSeg = existing.length > 0 ? existing[existing.length - 1] : null
        const lastSegExpired     = lastSeg ? new Date(lastSeg.end_time).getTime() < nowMs : false
        const etaChanged         = lastSeg ? lastSeg.end_time !== form.expected_delivery : true
        const destinationChanged = lastSeg
          ? Math.abs(lastSeg.to_lat - form.destination_lat) > 0.0001 ||
            Math.abs(lastSeg.to_lng - form.destination_lng) > 0.0001
          : true
        const statusBecameMobile = !MOBILE_STATUSES.has(prevStatus)
        const noSegments         = !lastSeg

        const needsNewSegment =
          noSegments || statusBecameMobile || etaChanged ||
          destinationChanged || adminMovedLocation || lastSegExpired

        if (needsNewSegment) {
          // ════════════════════════════════════════════════════════════
          // ETA EXTENSION (the definitive fix for the 100% bug):
          //
          // When admin extends expected_delivery while status is mobile,
          // we create ONE clean segment:
          //   from  = ORIGIN (Dallas)
          //   to    = DESTINATION (Miami)
          //   start = original dispatch_datetime
          //   end   = new expected_delivery
          //
          // The engine then computes:
          //   t = (now - dispatch) / (new_ETA - dispatch)
          //
          // Example: dispatch 3 days ago, new ETA 2 days from now
          //   total = 5 days, elapsed = 3 days → t = 3/5 = 60%
          //   Package is 60% of the way from Dallas to Miami. Correct.
          //
          // This completely avoids the stale current_lat/lng problem
          // because we never use it — origin and dispatch_datetime
          // are the ground truth, and both are stored reliably.
          // ════════════════════════════════════════════════════════════

          // ── Determine segment from/to/start/end ──────────────────────
          let segFromLat   = form.origin_lat
          let segFromLng   = form.origin_lng
          let segFromLabel = cleanLabel(form.origin)
          const segToLat   = form.destination_lat
          const segToLng   = form.destination_lng
          const segToLabel = form.destination

          // Start time: for ETA changes use original dispatch so the
          // elapsed-time ratio is computed over the full journey.
          // For hold release or brand-new mobile: start NOW.
          const segStartTime =
            statusBecameMobile || noSegments
              ? nowISO
              : (form.dispatch_datetime ?? nowISO)

          // Override from_* only for hold release or admin-moved location
          if (statusBecameMobile && STATIONARY_STATUSES.has(prevStatus)) {
            // Released from hold — continue from frozen hold position
            segFromLat   = finalForm.current_lat
            segFromLng   = finalForm.current_lng
            segFromLabel = cleanLabel(finalForm.current_location)
          } else if (adminMovedLocation) {
            // Admin explicitly set current_location
            segFromLat   = form.current_lat
            segFromLng   = form.current_lng
            segFromLabel = cleanLabel(form.current_location)
          }
          // else: ETA change / destination change / expired segment →
          // keep from = ORIGIN so the full arc is recomputed correctly

          const newSeg = buildMotionSegment(
            segFromLat, segFromLng, segFromLabel,
            segToLat, segToLng, segToLabel,
            segStartTime, form.expected_delivery!,
          )

          // For ETA extension / expiry: replace ALL segments with the
          // single clean segment so no stale data can interfere.
          // For hold release or brand-new leg: append.
          const replaceAll = !statusBecameMobile && !noSegments

          finalForm = {
            ...finalForm,
            motion_segments:  replaceAll ? [newSeg] : [...existing, newSeg],
            current_lat:      segFromLat,
            current_lng:      segFromLng,
            current_location: segFromLabel,
          }
        }
      }

      // ════════════════════════════════════════════════════════════════════
      // STEP 4 — Append history entry on every edit save
      // ════════════════════════════════════════════════════════════════════
      if (mode === "edit") {
        const now     = new Date(nowMs)
        const pad     = (n: number) => String(n).padStart(2, "0")
        const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
        const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`
        const histLoc = cleanLabel(finalForm.current_location || form.current_location)
        const statusLabel = newStatus.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())

        const newEntry = {
          id:         `h-${nowMs}`,
          date:       dateStr,
          time:       timeStr,
          location:   histLoc,
          status:     statusLabel,
          updated_by: "admin",
          remarks:    form.remarks ?? "",
        }
        finalForm = { ...finalForm, history: [...(finalForm.history ?? []), newEntry] }
      }

      // ════════════════════════════════════════════════════════════════════
      // STEP 5 — Save
      // ════════════════════════════════════════════════════════════════════
      let savedShipment: Shipment
      if (mode === "create") {
        savedShipment = await createShipment(finalForm)
      } else {
        savedShipment = await updateShipment(shipment!.id, finalForm)
      }

      // ════════════════════════════════════════════════════════════════════
      // STEP 6 — Fire email notification (best-effort, non-blocking)
      // Sends to receiver's email + admin copy.
      // Does NOT block save on failure.
      // ════════════════════════════════════════════════════════════════════
      if (savedShipment.receiver_email) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://globalmailxpress.com"
        fetch("/api/notify", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event:            mode === "create" ? "created" : "updated",
            trackingNumber:   savedShipment.tracking_number,
            receiverName:     savedShipment.receiver_name,
            receiverEmail:    savedShipment.receiver_email,
            shipperName:      savedShipment.shipper_name,
            origin:           savedShipment.origin,
            destination:      savedShipment.destination,
            status:           savedShipment.status,
            deliveryMode:     savedShipment.delivery_mode,
            product:          savedShipment.product,
            weight:           savedShipment.weight_kg,
            quantity:         savedShipment.quantity,
            pickupDate:       savedShipment.pickup_date,
            expectedDelivery: savedShipment.expected_delivery,
            comments:         savedShipment.comments,
            adminMessage:     savedShipment.alert_message ?? null,
            siteUrl,
          }),
        }).catch(() => {/* silent — email is best-effort */})
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/admin/dashboard")
      }
    } catch (err: any) {
      setError(err.message ?? "Save failed. Check your Supabase credentials.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <h1 className="font-bold text-gray-900">
          {mode === "create" ? "Create New Shipment" : "Edit Shipment"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Core Shipment ───────────────────────────────────────────────── */}
        <SectionCard title="Core Shipment">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Consignment Number" required>
              <div className="flex gap-2">
                <Input value={form.tracking_number} readOnly className="flex-1 bg-gray-50 font-mono text-xs" />
                <button
                  type="button"
                  onClick={() => set("tracking_number", generateTrackingNumber())}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <RefreshCw className="size-3" /> Regen
                </button>
              </div>
            </Field>

            <Field label="Status" required>
              <Select value={form.status} onChange={(e) => set("status", e.target.value as ShipmentStatus)}>
                <optgroup label="── Mobile (package moves)">
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                </optgroup>
                <optgroup label="── Stationary (location frozen)">
                  <option value="pending">Pending</option>
                  <option value="customs">In Customs</option>
                  <option value="on_hold">On Hold</option>
                  <option value="delayed">Delayed</option>
                  <option value="exception">Exception</option>
                </optgroup>
                <optgroup label="── Final">
                  <option value="delivered">Delivered</option>
                </optgroup>
              </Select>
            </Field>

            <Field label="Delivery Mode" required>
              <Select value={form.delivery_mode} onChange={(e) => set("delivery_mode", e.target.value as DeliveryMode)}>
                {(["air_freight","ocean_freight","road_freight","rail_freight","express_courier"] as DeliveryMode[]).map((m) => (
                  <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Carrier Reference Number">
              <Input value={form.carrier_ref} onChange={(e) => set("carrier_ref", e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        {/* ── Route & Schedule ────────────────────────────────────────────── */}
        <SectionCard title="Route & Schedule">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LocationSearch
              label="Origin (city, country)"
              value={form.origin}
              required
              onChange={(val, lat, lng) => setForm((f) => ({ ...f, origin: val, origin_lat: lat, origin_lng: lng }))}
            />
            <LocationSearch
              label="Destination (city, country)"
              value={form.destination}
              required
              onChange={(val, lat, lng) => setForm((f) => ({ ...f, destination: val, destination_lat: lat, destination_lng: lng }))}
            />
          </div>

          <div className="mt-4">
            <LocationSearch
              label="Current Location (live position)"
              value={form.current_location}
              required
              onChange={(val, lat, lng) => setForm((f) => ({ ...f, current_location: val, current_lat: lat, current_lng: lng }))}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Pickup Date">
              <Input type="date" value={form.pickup_date ?? ""} onChange={(e) => set("pickup_date", e.target.value)} />
            </Field>
            <Field label="Pickup Time">
              <Input type="time" value={form.pickup_time ?? ""} onChange={(e) => set("pickup_time", e.target.value)} />
            </Field>
            <Field label="Dispatch Date & Time ★ (journey start)">
              <Input type="datetime-local" value={form.dispatch_datetime ?? ""} onChange={(e) => set("dispatch_datetime", e.target.value)} />
            </Field>
            <Field label="Expected Delivery ★ (journey end)">
              <Input type="datetime-local" value={form.expected_delivery ?? ""} onChange={(e) => set("expected_delivery", e.target.value)} />
            </Field>
          </div>
          <p className="mt-2 text-xs text-amber-600">
            ★ Dispatch and Expected Delivery drive live location tracking. Both must be set for accurate position computation.
          </p>
        </SectionCard>

        {/* ── Shipper ─────────────────────────────────────────────────────── */}
        <SectionCard title="Shipper Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Shipper Name" required><Input required value={form.shipper_name} onChange={(e) => set("shipper_name", e.target.value)} /></Field>
            <Field label="Shipper Phone"><Input value={form.shipper_phone} onChange={(e) => set("shipper_phone", e.target.value)} /></Field>
            <Field label="Shipper Email"><Input type="email" value={form.shipper_email} onChange={(e) => set("shipper_email", e.target.value)} /></Field>
            <Field label="Shipper Address"><Input value={form.shipper_address} onChange={(e) => set("shipper_address", e.target.value)} /></Field>
          </div>
        </SectionCard>

        {/* ── Receiver ────────────────────────────────────────────────────── */}
        <SectionCard title="Receiver Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Receiver Name" required><Input required value={form.receiver_name} onChange={(e) => set("receiver_name", e.target.value)} /></Field>
            <Field label="Receiver Phone"><Input value={form.receiver_phone} onChange={(e) => set("receiver_phone", e.target.value)} /></Field>
            <Field label="Receiver Email"><Input type="email" value={form.receiver_email} onChange={(e) => set("receiver_email", e.target.value)} /></Field>
            <Field label="Receiver Address"><Input value={form.receiver_address} onChange={(e) => set("receiver_address", e.target.value)} /></Field>
          </div>
        </SectionCard>

        {/* ── Shipment Details ─────────────────────────────────────────────── */}
        <SectionCard title="Shipment Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Shipment Type">
              <Select value={form.shipment_type} onChange={(e) => set("shipment_type", e.target.value)}>
                <option value="">-- Select One --</option>
                {["Freight","Package","Document","Pallet","Container","Bulk Cargo","Fragile"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Product / Description">
              <Input value={form.product} onChange={(e) => set("product", e.target.value)} />
            </Field>
            <Field label="Payment Mode">
              <Select value={form.payment_mode} onChange={(e) => set("payment_mode", e.target.value as PaymentMode)}>
                <option value="">-- Select One --</option>
                {(["unpaid","cash","credit_card","bank_transfer","paypal"] as PaymentMode[]).map((m) => (
                  <option key={m} value={m}>{m.replace(/_/g," ")}</option>
                ))}
              </Select>
            </Field>
            <Field label="Total Freight ($)">
              <Input type="number" min={0} value={form.total_freight} onChange={(e) => set("total_freight", Number(e.target.value))} />
            </Field>
            <Field label="Weight (kg)">
              <Input type="number" min={0} value={form.weight_kg} onChange={(e) => set("weight_kg", Number(e.target.value))} />
            </Field>
            <Field label="Quantity">
              <Input type="number" min={1} value={form.quantity} onChange={(e) => set("quantity", Number(e.target.value))} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Comments / Special Instructions">
              <Textarea value={form.comments} onChange={(e) => set("comments", e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        {/* ── Packages ────────────────────────────────────────────────────── */}
        <SectionCard title="Packages">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-rose-600 text-left text-white">
                  {["Qty.", "Piece Type", "L (cm)", "W (cm)", "H (cm)", "Weight (kg)", "Description", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {form.packages.map((pkg, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1.5">
                      <input type="number" min={1} value={pkg.qty}
                        onChange={(e) => setPackageField(i, "qty", Number(e.target.value))}
                        className="w-14 rounded border border-gray-200 px-2 py-1 text-xs outline-none" />
                    </td>
                    <td className="px-2 py-1.5">
                      <select value={pkg.piece_type}
                        onChange={(e) => setPackageField(i, "piece_type", e.target.value)}
                        className="rounded border border-gray-200 px-2 py-1 text-xs outline-none">
                        {["Box","Pallet","Crate","Bag","Envelope","Drum"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    {(["length_cm","width_cm","height_cm","weight_kg"] as (keyof ShipmentPackage)[]).map((k) => (
                      <td key={k} className="px-2 py-1.5">
                        <input type="number" min={0} step="0.01" value={pkg[k] as number}
                          onChange={(e) => setPackageField(i, k, Number(e.target.value))}
                          className="w-16 rounded border border-gray-200 px-2 py-1 text-xs outline-none" />
                      </td>
                    ))}
                    <td className="px-2 py-1.5">
                      <input type="text" value={pkg.description}
                        onChange={(e) => setPackageField(i, "description", e.target.value)}
                        className="w-28 rounded border border-gray-200 px-2 py-1 text-xs outline-none" />
                    </td>
                    <td className="px-2 py-1.5">
                      <button type="button"
                        onClick={() => setForm((f) => ({ ...f, packages: f.packages.filter((_, j) => j !== i) }))}
                        disabled={form.packages.length <= 1}
                        className="flex size-6 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-30">
                        <Minus className="size-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Draft volume: {totalVol.toFixed(4)} cu. m. · Volumetric weight: {(totalVol * 167).toFixed(2)} kg
          </div>
          <button type="button"
            onClick={() => setForm((f) => ({ ...f, packages: [...f.packages, blankPackage()] }))}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700">
            <Plus className="size-3.5" /> Add Package
          </button>
          <div className="mt-4 space-y-0.5 text-center text-sm font-semibold text-gray-700">
            <p>Total Volumetric Weight: {(totalVol * 167).toFixed(2)} kg.</p>
            <p>Total Volume: {totalVol.toFixed(2)} cu. m.</p>
            <p>Total Actual Weight: {totalWeight.toFixed(2)} kg.</p>
          </div>
        </SectionCard>

        {/* ── Alert / Publish Notes ────────────────────────────────────────── */}
        <SectionCard title="Alert & Publish Notes">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Alert Type (shown as popup to customer)">
              <Select value={form.alert_type ?? ""} onChange={(e) => set("alert_type", (e.target.value || null) as AlertType)}>
                <option value="">No Alert</option>
                <optgroup label="General">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="hold">On Hold</option>
                  <option value="customs">Customs Clearance</option>
                  <option value="payment_required">Payment Required</option>
                </optgroup>
                {bills.length > 0 && (
                  <optgroup label="Bills">
                    {bills.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </optgroup>
                )}
              </Select>
            </Field>
            <Field label="Fees Amount ($) — shown on Pay Fees page">
              <Input type="number" min={0} value={form.fees_amount} onChange={(e) => set("fees_amount", Number(e.target.value))} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Alert Message (italic text shown in popup)">
              <Textarea value={form.alert_message ?? ""} onChange={(e) => set("alert_message", e.target.value)} placeholder="e.g. Your package requires additional documentation for customs clearance…" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Publish Note (internal)">
              <input type="text" value={form.publish_note ?? ""} onChange={(e) => set("publish_note", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Public Remarks (shown on tracking page)">
              <Textarea value={form.remarks ?? ""} onChange={(e) => set("remarks", e.target.value)} placeholder="Public remarks shown on tracking page." />
            </Field>
          </div>
        </SectionCard>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* ── Submit ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pb-10">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-rose-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {mode === "create" ? "Create & Publish" : "Update & Publish"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
