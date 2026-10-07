/**
 * Live Location Computation Engine — Global Mail Express
 *
 * ═══════════════════════════════════════════════════════════════════
 *  CORE CONCEPT: MOTION SEGMENTS
 * ═══════════════════════════════════════════════════════════════════
 *
 * A shipment's journey is broken into discrete "motion segments", each
 * stored as a JSONB row in shipment.motion_segments[]:
 *
 *   {
 *     from_lat, from_lng, from_label,   ← position when this leg starts
 *     to_lat,   to_lng,   to_label,     ← leg destination
 *     start_time,                        ← ISO when this leg began
 *     end_time,                          ← ISO expected arrival for this leg
 *   }
 *
 * The LAST segment is always the active one.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  STATUS CATEGORIES
 * ═══════════════════════════════════════════════════════════════════
 *
 *  MOBILE      in_transit, out_for_delivery, picked_up
 *              → Interpolate along bezier arc of last segment.
 *
 *  STATIONARY  pending, customs, on_hold, delayed, exception
 *              → Freeze at current_lat/lng stored in DB.
 *              → When admin places package on hold, the form MUST first
 *                compute the live position at that moment and write it
 *                to current_lat/lng/location before saving status.
 *
 *  DELIVERED   → Always show at destination.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  HOLD → TRANSIT RESUMPTION
 * ═══════════════════════════════════════════════════════════════════
 *
 * When admin releases from on_hold → in_transit:
 *   1. current_lat/lng/location = frozen hold position (from DB)
 *   2. A NEW segment is built:
 *        from = frozen hold position
 *        to   = destination (unchanged or updated)
 *        start_time = now (or new dispatch_datetime)
 *        end_time   = new expected_delivery
 *   3. Engine interpolates from that frozen position forward in the
 *      NEW time window — hold time is completely excluded.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  ARRIVAL TIME CHANGES
 * ═══════════════════════════════════════════════════════════════════
 *
 * If admin updates expected_delivery while status is mobile:
 *   → A new segment is always appended (the form detects the change
 *     by comparing end_time of the last segment vs. new expected_delivery).
 *   → The new segment starts from "where the package is NOW" (computed
 *     from the previous segment at the moment of save).
 *   → Result: journey continues from current position to destination
 *     in the newly specified total time.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  REVERSE GEOCODING
 * ═══════════════════════════════════════════════════════════════════
 *
 * After computing a bezier position (which may be over water), we
 * call Nominatim reverse geocode to get the nearest real place name.
 * This is an async operation and is handled in track/page.tsx after
 * computeLivePosition() returns.
 */

// ── Public types ──────────────────────────────────────────────────────────

export interface MotionSegment {
  from_lat:   number
  from_lng:   number
  from_label: string
  to_lat:     number
  to_lng:     number
  to_label:   string
  /** ISO datetime — when this leg of the journey starts */
  start_time: string
  /** ISO datetime — expected arrival for this leg */
  end_time:   string
}

export interface LivePosition {
  lat:     number
  lng:     number
  /** Raw computed label (bezier midpoint interpolation) */
  label:   string
  /** 0–100 — fraction of the current leg completed */
  percent: number
  /** Human-readable note shown in the UI */
  note:    string
}

/** Minimal shape the engine needs — avoids circular import */
export type ShipmentForEngine = {
  status: string
  origin:         string; origin_lat:      number; origin_lng:      number
  destination:    string; destination_lat: number; destination_lng: number
  current_location: string; current_lat:   number; current_lng:     number
  dispatch_datetime: string | null
  expected_delivery: string | null
  motion_segments?: MotionSegment[]
}

// ── Internal constants ────────────────────────────────────────────────────

const STATIONARY_STATUSES = new Set([
  "pending", "customs", "on_hold", "delayed", "exception",
])

// ── Bezier interpolation ──────────────────────────────────────────────────

/**
 * Quadratic bezier at t ∈ [0, 1].
 * Curvature 0.22 with perpendicular control point — matches tracking-map.tsx
 * so the computed dot lands exactly on the visual arc.
 */
export function bezierPoint(
  from: { lat: number; lng: number },
  to:   { lat: number; lng: number },
  t: number,
): { lat: number; lng: number } {
  const CURVATURE = 0.22
  const midLat = (from.lat + to.lat) / 2
  const midLng = (from.lng + to.lng) / 2
  const dlat = to.lat - from.lat
  const dlng = to.lng - from.lng
  const dist = Math.sqrt(dlat * dlat + dlng * dlng)
  if (dist === 0) return { lat: from.lat, lng: from.lng }
  const ctrlLat = midLat + CURVATURE * dist * (-dlng / dist)
  const ctrlLng = midLng + CURVATURE * dist * ( dlat / dist)
  const t1 = 1 - t
  return {
    lat: t1 * t1 * from.lat + 2 * t1 * t * ctrlLat + t * t * to.lat,
    lng: t1 * t1 * from.lng + 2 * t1 * t * ctrlLng + t * t * to.lng,
  }
}

function remainingNote(endMs: number, nowMs: number): string {
  const h = Math.round((endMs - nowMs) / 3_600_000)
  if (h < 1)  return "Arriving very soon."
  if (h < 24) return `Approximately ${h}h remaining to destination.`
  return `Approximately ${Math.round(h / 24)}d remaining to destination.`
}

/** Interpolate a position within one MotionSegment at nowMs. */
function interpolateSegment(seg: MotionSegment, nowMs: number): LivePosition {
  const startMs  = new Date(seg.start_time).getTime()
  const endMs    = new Date(seg.end_time).getTime()
  const duration = endMs - startMs

  if (duration <= 0 || nowMs <= startMs) {
    return {
      lat: seg.from_lat, lng: seg.from_lng, label: seg.from_label,
      percent: 0, note: "Package has not yet departed.",
    }
  }
  if (nowMs >= endMs) {
    return {
      lat: seg.to_lat, lng: seg.to_lng, label: seg.to_label,
      percent: 100, note: "Package has reached its destination.",
    }
  }

  const t   = (nowMs - startMs) / duration
  const pos = bezierPoint({ lat: seg.from_lat, lng: seg.from_lng }, { lat: seg.to_lat, lng: seg.to_lng }, t)
  const percent = Math.round(t * 100)
  // Raw label — will be replaced by reverse geocode in track/page.tsx
  const label = t < 0.05 ? seg.from_label
              : t > 0.95 ? seg.to_label
              : `En route: ${seg.from_label} → ${seg.to_label}`
  return { lat: pos.lat, lng: pos.lng, label, percent, note: remainingNote(endMs, nowMs) }
}

// ── Main computation ──────────────────────────────────────────────────────

/** Straight-line distance ratio to estimate % of journey completed. */
function estimatePercent(
  originLat: number, originLng: number,
  destLat:   number, destLng:   number,
  curLat:    number, curLng:    number,
): number {
  const totalLat = destLat - originLat
  const totalLng = destLng - originLng
  const total = Math.sqrt(totalLat * totalLat + totalLng * totalLng)
  if (total === 0) return 0
  const coveredLat = curLat - originLat
  const coveredLng = curLng - originLng
  const covered = Math.sqrt(coveredLat * coveredLat + coveredLng * coveredLng)
  return Math.min(100, Math.max(0, Math.round((covered / total) * 100)))
}

/**
 * Compute the live geographic position at nowMs.
 * PURE FUNCTION — no side effects, no network.
 */
export function computeLivePosition(shipment: ShipmentForEngine, nowMs: number): LivePosition {
  const { status } = shipment
  const segments: MotionSegment[] = shipment.motion_segments ?? []

  // 1. Delivered ─────────────────────────────────────────────────────────
  if (status === "delivered") {
    return {
      lat: shipment.destination_lat, lng: shipment.destination_lng,
      label: shipment.destination, percent: 100, note: "Delivered to destination.",
    }
  }

  // 2. Stationary — return the DB-stored frozen position ─────────────────
  if (STATIONARY_STATUSES.has(status)) {
    const lat   = shipment.current_lat   !== 0 ? shipment.current_lat   : shipment.origin_lat
    const lng   = shipment.current_lng   !== 0 ? shipment.current_lng   : shipment.origin_lng
    // Clean up the label — strip raw "En route: X → Y" down to just the origin city
    const rawLabel = shipment.current_location || shipment.origin
    const label = rawLabel.startsWith("En route:")
      ? rawLabel.replace(/^En route:\s*/i, "").split("→")[0].trim()
      : rawLabel

    // Compute actual percent from coords rather than hardcoding 0
    const percent = estimatePercent(
      shipment.origin_lat,      shipment.origin_lng,
      shipment.destination_lat, shipment.destination_lng,
      lat, lng,
    )
    return {
      lat, lng, label, percent,
      note: `Shipment is ${status.replace(/_/g, " ")} at last known position.`,
    }
  }

  // 3. Mobile — use last motion segment ─────────────────────────────────
  if (segments.length > 0) {
    const raw = interpolateSegment(segments[segments.length - 1], nowMs)
    // Overall percent = distance from origin to current / origin to destination
    const overallPercent = estimatePercent(
      shipment.origin_lat, shipment.origin_lng,
      shipment.destination_lat, shipment.destination_lng,
      raw.lat, raw.lng,
    )
    // Clean label: strip "En route: X → Y" down to just the current-position city
    const cleanLabel = raw.label.startsWith("En route:")
      ? raw.label.replace(/^En route:\s*/i, "").split("→")[0].trim()
      : raw.label
    return { ...raw, label: cleanLabel, percent: overallPercent }
  }

  // 4. No segments — synthesise from dispatch/expected_delivery ──────────
  if (shipment.dispatch_datetime && shipment.expected_delivery) {
    const raw = interpolateSegment({
      from_lat: shipment.origin_lat, from_lng: shipment.origin_lng, from_label: shipment.origin,
      to_lat: shipment.destination_lat, to_lng: shipment.destination_lng, to_label: shipment.destination,
      start_time: shipment.dispatch_datetime, end_time: shipment.expected_delivery,
    }, nowMs)
    const overallPercent = estimatePercent(
      shipment.origin_lat, shipment.origin_lng,
      shipment.destination_lat, shipment.destination_lng,
      raw.lat, raw.lng,
    )
    return { ...raw, percent: overallPercent }
  }

  // 5. Absolute fallback ─────────────────────────────────────────────────
  return {
    lat:   shipment.current_lat   !== 0 ? shipment.current_lat   : shipment.origin_lat,
    lng:   shipment.current_lng   !== 0 ? shipment.current_lng   : shipment.origin_lng,
    label: shipment.current_location     || shipment.origin,
    percent: 0, note: "Route schedule not yet configured.",
  }
}

// ── Segment builder ───────────────────────────────────────────────────────

/**
 * Compute where the package is on a specific segment at nowMs.
 * Used by the shipment form to determine "current position" before
 * building a new segment (e.g. when placing on hold or changing ETA).
 */
export function computePositionFromSegment(
  seg: MotionSegment,
  nowMs: number,
): { lat: number; lng: number; label: string } {
  const startMs  = new Date(seg.start_time).getTime()
  const endMs    = new Date(seg.end_time).getTime()
  const duration = endMs - startMs

  if (duration <= 0 || nowMs <= startMs) {
    return { lat: seg.from_lat, lng: seg.from_lng, label: seg.from_label }
  }
  if (nowMs >= endMs) {
    return { lat: seg.to_lat, lng: seg.to_lng, label: seg.to_label }
  }

  const t   = (nowMs - startMs) / duration
  const pos = bezierPoint(
    { lat: seg.from_lat, lng: seg.from_lng },
    { lat: seg.to_lat,   lng: seg.to_lng   },
    t,
  )
  // Clean from_label in case it carries an old "En route:" string
  const cleanFrom = seg.from_label.startsWith("En route:")
    ? seg.from_label.replace(/^En route:\s*/i, "").split("→")[0].trim()
    : seg.from_label
  const label = t < 0.05 ? cleanFrom
              : t > 0.95 ? seg.to_label
              : cleanFrom
  return { lat: pos.lat, lng: pos.lng, label }
}

/**
 * Build a MotionSegment for the shipment form to append.
 *
 * Called when:
 *   A) Admin saves a mobile status initially
 *   B) Admin releases from hold → transit (from_* = frozen hold position)
 *   C) Admin changes expected_delivery (recalculates from current position)
 */
export function buildMotionSegment(
  fromLat: number, fromLng: number, fromLabel: string,
  toLat:   number, toLng:   number, toLabel:   string,
  startTime: string, endTime: string,
): MotionSegment {
  return {
    from_lat: fromLat, from_lng: fromLng, from_label: fromLabel,
    to_lat:   toLat,   to_lng:   toLng,   to_label:   toLabel,
    start_time: startTime, end_time: endTime,
  }
}

// ── Reverse geocoding ─────────────────────────────────────────────────────

/**
 * Reverse geocode a lat/lng via Nominatim to get the nearest real place name.
 * Returns a short 2–3 part name (city, state/region, country).
 * Falls back to the raw computed label on error or timeout.
 *
 * Called AFTER computeLivePosition() in track/page.tsx.
 * NOT called for stationary or delivered states (label is already correct).
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  fallback: string,
): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}&zoom=10&addressdetails=1`,
      {
        headers: { "Accept-Language": "en", "User-Agent": "GlobalMailExpress/1.0" },
        signal: controller.signal,
      },
    )
    clearTimeout(timeout)
    if (!res.ok) return fallback
    const data = await res.json()
    const a = data.address ?? {}
    // Build a clean short label: city/town/village, state, country
    const parts: string[] = []
    const city = a.city || a.town || a.village || a.county || a.state_district
    if (city)      parts.push(city)
    if (a.state)   parts.push(a.state)
    if (a.country) parts.push(a.country)
    if (parts.length === 0) return data.display_name?.split(",").slice(0, 3).join(", ") ?? fallback
    return parts.join(", ")
  } catch {
    return fallback
  }
}
