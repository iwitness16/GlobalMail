import { supabase } from "./supabase"
import type { Shipment, ShipmentInsert } from "./database.types"

export async function getAllShipments(): Promise<Shipment[]> {
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []) as Shipment[]
}

export async function getShipmentByTracking(trackingNumber: string): Promise<Shipment | null> {
  const normalized = trackingNumber.trim().toUpperCase()
  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .ilike("tracking_number", normalized)
    .maybeSingle()
  if (error) throw error
  return data ? (data as unknown as Shipment) : null
}

function sanitise(obj: Record<string, any>): Record<string, any> {
  const DATE_FIELDS = ["pickup_date", "dispatch_datetime", "expected_delivery"]
  const out = { ...obj }
  for (const field of DATE_FIELDS) {
    if (out[field] === "" || out[field] === undefined) out[field] = null
  }
  if (out.publish_note  === "") out.publish_note  = null
  if (out.alert_message === "") out.alert_message = null
  if (out.alert_type    === "") out.alert_type    = null
  return out
}

export async function createShipment(shipment: ShipmentInsert): Promise<Shipment> {
  const { data, error } = await supabase
    .from("shipments")
    .insert(sanitise(shipment as any) as any)
    .select()
    .single()
  if (error) throw error
  return data as unknown as Shipment
}

export async function updateShipment(id: string, updates: Partial<ShipmentInsert>): Promise<Shipment> {
  const { data, error } = await supabase
    .from("shipments")
    .update(sanitise(updates as any) as any)
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as unknown as Shipment
}

export async function deleteShipment(id: string): Promise<void> {
  const { error } = await supabase.from("shipments").delete().eq("id", id)
  if (error) throw error
}

/**
 * Silent background update — writes computed lat/lng/location and journey
 * percent after the engine calculates live position on user track.
 * Fire-and-forget: does NOT touch history, alerts, or any admin field.
 */
export function silentUpdateLocation(
  id: string,
  lat: number,
  lng: number,
  label: string,
  percent: number,
): void {
  void supabase
    .from("shipments")
    .update({ current_lat: lat, current_lng: lng, current_location: label, journey_percent: percent } as any)
    .eq("id", id)
    .then(() => {/* silent */}, () => {/* silent */})
}

/**
 * AWAITED hold snapshot — called by the admin form when placing a shipment
 * on a stationary status (on_hold, customs, delayed, exception).
 *
 * Unlike silentUpdateLocation, this IS awaited so that current_lat/lng are
 * guaranteed to be persisted BEFORE the status update completes. This ensures
 * that when users track the package while it's on hold, the frozen position
 * shown is the exact location at the moment the admin placed it on hold.
 *
 * Does NOT touch history, alerts, motion_segments, or any other admin field.
 */
export async function snapshotLocationForHold(
  id: string,
  lat: number,
  lng: number,
  label: string,
): Promise<void> {
  const { error } = await supabase
    .from("shipments")
    .update({ current_lat: lat, current_lng: lng, current_location: label } as any)
    .eq("id", id)
  if (error) console.error("snapshotLocationForHold failed:", error.message)
}

export function generateTrackingNumber(): string {
  const prefix = "GME"
  const chars  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const rand   = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${prefix}${rand}-CARGO`
}
