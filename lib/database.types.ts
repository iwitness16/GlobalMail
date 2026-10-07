import type { MotionSegment } from "./location-engine"

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      shipments: {
        Row: Shipment
        Insert: ShipmentInsert
        Update: Partial<ShipmentInsert>
      }
    }
  }
}

export type ShipmentStatus =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "customs"
  | "on_hold"
  | "out_for_delivery"
  | "delivered"
  | "delayed"
  | "exception"

export type DeliveryMode =
  | "air_freight"
  | "ocean_freight"
  | "road_freight"
  | "rail_freight"
  | "express_courier"

export type PaymentMode = "cash" | "credit_card" | "bank_transfer" | "paypal" | "unpaid"

// Alert type is a string so it can hold both built-in values and
// dynamic bill names created by admin in the Bills tab.
// Built-in values: "info" | "warning" | "hold" | "customs" | "payment_required"
// Dynamic values: any bill name string entered by admin (e.g. "Import Duty")
export type AlertType = string | null

export interface ShipmentPackage {
  qty: number
  piece_type: string
  length_cm: number
  width_cm: number
  height_cm: number
  weight_kg: number
  description: string
}

export interface ShipmentHistoryEntry {
  id: string
  date: string
  time: string
  location: string
  status: string
  updated_by: string
  remarks: string
}

export interface Shipment {
  id: string
  created_at: string

  // Core
  tracking_number: string
  status: ShipmentStatus
  delivery_mode: DeliveryMode
  journey_percent: number

  // Route & Schedule
  origin: string
  origin_lat: number
  origin_lng: number
  destination: string
  destination_lat: number
  destination_lng: number
  carrier_ref: string
  pickup_date: string | null
  pickup_time: string | null
  dispatch_datetime: string | null
  expected_delivery: string | null

  // Current location — written silently by the location engine on each track
  current_location: string
  current_lat: number
  current_lng: number

  /**
   * Motion segments drive the live location engine.
   * Appended automatically by the admin shipment form when status is mobile.
   * Each entry records a leg: from current position → destination with timing.
   * The last entry is always the active one for interpolation.
   */
  motion_segments: MotionSegment[]

  // Shipper
  shipper_name: string
  shipper_phone: string
  shipper_email: string
  shipper_address: string

  // Receiver
  receiver_name: string
  receiver_phone: string
  receiver_email: string
  receiver_address: string

  // Shipment details
  shipment_type: string
  product: string
  payment_mode: PaymentMode
  total_freight: number
  weight_kg: number
  quantity: number
  comments: string

  // Packages
  packages: ShipmentPackage[]

  // Admin notes / alert
  publish_note: string | null
  remarks: string | null
  alert_type: AlertType
  alert_message: string | null
  fees_amount: number

  // History (admin-authored status updates shown to users)
  history: ShipmentHistoryEntry[]
}

export type ShipmentInsert = Omit<Shipment, "id" | "created_at">
