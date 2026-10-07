// Shared types for shipments / package tracking.
// This file defines the data shape only. Persisting and retrieving real
// shipment data (database, API, etc.) is intentionally left for you to wire
// up — see lib/demo-shipments.ts for where the placeholder logic lives.

export const SHIPMENT_STATUSES = [
  "pending",
  "picked_up",
  "in_transit",
  "customs",
  "out_for_delivery",
  "delivered",
  "delayed",
  "exception",
] as const

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number]

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: "Pending Pickup",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  customs: "In Customs Clearance",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  delayed: "Delayed",
  exception: "Exception",
}

export const SERVICE_TYPES = ["air", "ocean", "road", "rail", "express"] as const
export type ServiceType = (typeof SERVICE_TYPES)[number]

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  air: "Air Freight",
  ocean: "Ocean Freight",
  road: "Road Freight",
  rail: "Rail Freight",
  express: "Express Courier",
}

export const COURIER_PARTNERS = [
  "Global Mail Express",
  "FedEx",
  "UPS",
  "USPS",
  "DHL",
  "Royal Mail",
] as const
export type CourierPartner = (typeof COURIER_PARTNERS)[number]

export interface GeoPoint {
  label: string
  country: string
  lat: number
  lng: number
}

export interface TrackingEvent {
  id: string
  status: ShipmentStatus
  location: string
  timestamp: string // ISO date string
  note?: string
}

export interface ContactDetails {
  name: string
  address: string
  country: string
}

export interface PackageDetails {
  description: string
  weightKg: number
  pieces: number
  dimensions?: string
}

export interface Shipment {
  trackingNumber: string
  status: ShipmentStatus
  courier: CourierPartner
  serviceType: ServiceType
  sender: ContactDetails
  receiver: ContactDetails
  origin: GeoPoint
  destination: GeoPoint
  currentLocation: GeoPoint
  package: PackageDetails
  shipDate: string
  estimatedDelivery: string
  adminMessage?: string
  timeline: TrackingEvent[]
}

/** Fields the admin dashboard form collects when creating a shipment. */
export interface ShipmentFormValues {
  trackingNumber: string
  status: ShipmentStatus
  courier: CourierPartner
  serviceType: ServiceType
  senderName: string
  senderAddress: string
  senderCountry: string
  receiverName: string
  receiverAddress: string
  receiverCountry: string
  originLabel: string
  originCountry: string
  originLat: string
  originLng: string
  destinationLabel: string
  destinationCountry: string
  destinationLat: string
  destinationLng: string
  currentLabel: string
  currentCountry: string
  currentLat: string
  currentLng: string
  description: string
  weightKg: string
  pieces: string
  dimensions: string
  shipDate: string
  estimatedDelivery: string
  adminMessage: string
}
