// ---------------------------------------------------------------------------
// PLACEHOLDER DATA LAYER
// ---------------------------------------------------------------------------
// This project is front-end only (no database). The array below stands in
// for real shipment records so the tracking UI has something to search and
// render. Swap `getShipmentByTracking` and `demoShipments` for real calls to
// your own API / database once that logic is in place — every other
// component (search box, map, timeline, popup) already reads through this
// one function, so that's the only place you need to change.
// ---------------------------------------------------------------------------

import type { Shipment } from "./shipment-types"

export const demoShipments: Shipment[] = [
  {
    trackingNumber: "GME-4821960573",
    status: "in_transit",
    courier: "Global Mail Express",
    serviceType: "ocean",
    sender: { name: "Marcus Ellison", address: "88 Harbour Rd", country: "United Kingdom" },
    receiver: { name: "Amara Chen", address: "1420 Pier Avenue", country: "United States" },
    origin: { label: "Felixstowe, UK", country: "United Kingdom", lat: 51.9539, lng: 1.3518 },
    destination: { label: "New York, USA", country: "United States", lat: 40.6892, lng: -74.0445 },
    currentLocation: { label: "Mid-Atlantic Ocean", country: "International Waters", lat: 45.5, lng: -30.2 },
    package: { description: "Furniture consignment", weightKg: 860, pieces: 12, dimensions: "2.4m x 1.2m x 1.4m" },
    shipDate: "2026-07-28",
    estimatedDelivery: "2026-08-14",
    adminMessage: "Vessel is on schedule. No action required from the receiver at this time.",
    timeline: [
      { id: "t1", status: "pending", location: "Felixstowe, UK", timestamp: "2026-07-27T09:00:00Z", note: "Shipment booked and confirmed." },
      { id: "t2", status: "picked_up", location: "Felixstowe, UK", timestamp: "2026-07-28T14:30:00Z", note: "Container loaded onto vessel MV Northern Star." },
      { id: "t3", status: "in_transit", location: "English Channel", timestamp: "2026-07-29T06:15:00Z" },
      { id: "t4", status: "in_transit", location: "Mid-Atlantic Ocean", timestamp: "2026-08-04T11:00:00Z", note: "Vessel on schedule, calm seas." },
    ],
  },
  {
    trackingNumber: "TLG-9903217748",
    status: "out_for_delivery",
    courier: "FedEx",
    serviceType: "express",
    sender: { name: "Priya Nair", address: "22 Whitefield Rd", country: "India" },
    receiver: { name: "Daniel Okafor", address: "56 Victoria Island", country: "Nigeria" },
    origin: { label: "Bengaluru, India", country: "India", lat: 12.9716, lng: 77.5946 },
    destination: { label: "Lagos, Nigeria", country: "Nigeria", lat: 6.5244, lng: 3.3792 },
    currentLocation: { label: "Lagos, Nigeria", country: "Nigeria", lat: 6.4531, lng: 3.3958 },
    package: { description: "Electronics parts", weightKg: 4.2, pieces: 1, dimensions: "40cm x 30cm x 20cm" },
    shipDate: "2026-08-04",
    estimatedDelivery: "2026-08-09",
    adminMessage: "Courier is en route to the delivery address. Please ensure someone is available to receive the package.",
    timeline: [
      { id: "t1", status: "pending", location: "Bengaluru, India", timestamp: "2026-08-04T05:00:00Z" },
      { id: "t2", status: "picked_up", location: "Bengaluru, India", timestamp: "2026-08-04T09:20:00Z" },
      { id: "t3", status: "in_transit", location: "Mumbai Air Hub, India", timestamp: "2026-08-05T02:10:00Z" },
      { id: "t4", status: "customs", location: "Lagos International Hub, Nigeria", timestamp: "2026-08-08T08:45:00Z", note: "Cleared customs without delay." },
      { id: "t5", status: "out_for_delivery", location: "Lagos, Nigeria", timestamp: "2026-08-08T13:05:00Z" },
    ],
  },
  {
    trackingNumber: "TLG-1122334455",
    status: "delivered",
    courier: "DHL",
    serviceType: "road",
    sender: { name: "Sofia Rossi", address: "14 Via Roma", country: "Italy" },
    receiver: { name: "Hans Gruber", address: "9 Bahnhofstrasse", country: "Germany" },
    origin: { label: "Milan, Italy", country: "Italy", lat: 45.4642, lng: 9.19 },
    destination: { label: "Munich, Germany", country: "Germany", lat: 48.1351, lng: 11.582 },
    currentLocation: { label: "Munich, Germany", country: "Germany", lat: 48.1351, lng: 11.582 },
    package: { description: "Printed catalogues", weightKg: 32, pieces: 4 },
    shipDate: "2026-07-30",
    estimatedDelivery: "2026-08-01",
    adminMessage: "Delivered and signed for by receiver.",
    timeline: [
      { id: "t1", status: "pending", location: "Milan, Italy", timestamp: "2026-07-30T07:00:00Z" },
      { id: "t2", status: "picked_up", location: "Milan, Italy", timestamp: "2026-07-30T10:40:00Z" },
      { id: "t3", status: "in_transit", location: "Verona Hub, Italy", timestamp: "2026-07-30T18:00:00Z" },
      { id: "t4", status: "out_for_delivery", location: "Munich, Germany", timestamp: "2026-08-01T08:00:00Z" },
      { id: "t5", status: "delivered", location: "Munich, Germany", timestamp: "2026-08-01T11:35:00Z", note: "Signed for by H. Gruber." },
    ],
  },
]

/**
 * Looks up a shipment by tracking number.
 *
 * PLACEHOLDER: replace this with a real fetch to your API / database.
 * Every consumer (tracking search, results page, popup) calls this single
 * function, so it's the only place that needs to change.
 */
export function getShipmentByTracking(trackingNumber: string): Shipment | undefined {
  const normalized = trackingNumber.trim().toUpperCase()
  return demoShipments.find((shipment) => shipment.trackingNumber.toUpperCase() === normalized)
}
