"use client"

import { X } from "lucide-react"
import type { ShipmentStatus } from "@/lib/database.types"

const WHATSAPP_NUMBER = "19297942259"
const WHATSAPP_BASE   = `https://wa.me/${WHATSAPP_NUMBER}?text=`

// Built-in alert type titles — dynamic bill names use their own name as title
const BUILTIN_TITLES: Record<string, string> = {
  info:             "Shipment Notice",
  warning:          "Action Required",
  hold:             "Shipment On Hold",
  customs:          "Customs Clearance",
  payment_required: "Payment Required",
}

// Built-in alert type colours — dynamic bill names get the amber style
const BUILTIN_COLORS: Record<string, { bar: string; badge: string }> = {
  info:             { bar: "bg-blue-600",   badge: "bg-blue-100 text-blue-700"     },
  warning:          { bar: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  hold:             { bar: "bg-rose-600",   badge: "bg-red-100 text-red-700"       },
  customs:          { bar: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700" },
  payment_required: { bar: "bg-rose-600",   badge: "bg-red-100 text-red-700"       },
}

const DEFAULT_COLORS = { bar: "bg-amber-600", badge: "bg-amber-100 text-amber-700" }

const STATUS_LABELS: Partial<Record<ShipmentStatus, string>> = {
  pending:          "Pending",
  picked_up:        "Picked Up",
  in_transit:       "In Transit",
  customs:          "In Customs",
  on_hold:          "On Hold",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  delayed:          "Delayed",
  exception:        "Exception",
}

interface Props {
  trackingNumber: string
  status: ShipmentStatus
  alertType: string          // non-null — caller already guards
  alertMessage: string
  feesAmount: number
  onClose: () => void
}

export function AlertPopup({ trackingNumber, status, alertType, alertMessage, feesAmount, onClose }: Props) {
  const isBuiltin = alertType in BUILTIN_COLORS
  const colors      = BUILTIN_COLORS[alertType] ?? DEFAULT_COLORS
  // For dynamic bill names, use the name itself as the title
  const title       = BUILTIN_TITLES[alertType] ?? `Bill: ${alertType}`
  const statusLabel = STATUS_LABELS[status as ShipmentStatus] ?? status

  // Is this a payment-related alert? (built-in or a dynamic bill name)
  const isPaymentAlert = alertType === "payment_required" || !isBuiltin

  const waMessage = isPaymentAlert
    ? encodeURIComponent(
        `Hello, I am tracking shipment ${trackingNumber} and I would like to know how to proceed with the payment of the fees${feesAmount > 0 ? ` ($${feesAmount.toFixed(2)})` : ""} so I can complete the process.`
      )
    : encodeURIComponent(
        `Hello, I am tracking shipment ${trackingNumber} and I need assistance regarding my shipment status.`
      )

  const waLink = `${WHATSAPP_BASE}${waMessage}`

  const description = (() => {
    if (alertType === "hold")
      return "Your shipment is currently on hold. Please contact our support team for more information."
    if (alertType === "payment_required")
      return `A payment of $${feesAmount.toFixed(2)} is required to release your shipment. Tap below to chat with us on WhatsApp.`
    if (alertType === "customs")
      return "Your shipment is in customs clearance. Please ensure all required documents are available."
    if (alertType === "info")
      return "There is an important notice regarding your shipment. Please review the message below."
    if (alertType === "warning")
      return "Your shipment requires attention. Please review the message below and take action if needed."
    // Dynamic bill name
    return `An outstanding bill "${alertType}"${feesAmount > 0 ? ` of $${feesAmount.toFixed(2)}` : ""} is associated with your shipment. Tap below to chat with us on WhatsApp to complete payment.`
  })()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className={`h-1.5 w-full ${colors.bar}`} />

        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
        >
          <X className="size-4" />
        </button>

        <div className="p-6">
          <h2 className="mb-1 text-base font-bold text-gray-900">{title}</h2>

          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-gray-500">Tracking #:</span>
            <span className="font-mono text-gray-600">{trackingNumber}</span>
            <span className="text-gray-300">|</span>
            <span className={`rounded-full px-2.5 py-0.5 font-semibold ${colors.badge}`}>
              {statusLabel}
            </span>
          </div>

          <p className="mb-5 text-sm leading-relaxed text-gray-600">{description}</p>

          {alertMessage && (
            <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Admin Message
              </p>
              <p className="text-sm italic leading-relaxed text-gray-700">{alertMessage}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              View Shipment Details
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700"
            >
              {isPaymentAlert ? "Pay Fees via WhatsApp" : "Contact via WhatsApp"}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
