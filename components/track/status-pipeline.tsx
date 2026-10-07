import { Package, Truck, AlertTriangle, CheckCircle2, Clock, ShieldAlert, MapPin } from "lucide-react"
import type { ShipmentStatus } from "@/lib/database.types"

interface PipelineStep {
  key: ShipmentStatus | string
  label: string
  icon: React.ElementType
}

const PIPELINE: PipelineStep[] = [
  { key: "pending",          label: "Pending",          icon: Clock },
  { key: "picked_up",        label: "Picked Up",        icon: Package },
  { key: "in_transit",       label: "In Transit",       icon: Truck },
  { key: "customs",          label: "In Customs",       icon: ShieldAlert },
  { key: "on_hold",          label: "On Hold",          icon: AlertTriangle },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered",        label: "Delivered",        icon: CheckCircle2 },
]

function stepState(step: PipelineStep, status: ShipmentStatus): "done" | "active" | "pending" {
  const order = PIPELINE.map((s) => s.key)
  const currentIdx = order.indexOf(status)
  const stepIdx    = order.indexOf(step.key)

  if (status === "on_hold" && step.key === "on_hold") return "active"
  if (status === "exception" || status === "delayed") {
    if (step.key === status || stepIdx < currentIdx) return "active"
    return "pending"
  }
  if (stepIdx < currentIdx) return "done"
  if (stepIdx === currentIdx) return "active"
  return "pending"
}

export function StatusPipeline({ status }: { status: ShipmentStatus }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-start gap-0">
        {PIPELINE.map((step, i) => {
          const state = stepState(step, status)
          const isHold = step.key === "on_hold" && status === "on_hold"

          return (
            <div key={step.key} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`relative flex size-12 items-center justify-center rounded-full border-2 transition-all ${
                    state === "done"
                      ? "border-green-500 bg-green-500 text-white"
                      : state === "active" && isHold
                      ? "border-rose-500 bg-rose-500 text-white"
                      : state === "active"
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-200 bg-white text-gray-300"
                  }`}
                >
                  {/* Pulse ring for current/hold */}
                  {state === "active" && (
                    <span
                      className={`absolute inset-0 rounded-full ${isHold ? "bg-rose-400" : "bg-green-400"} animate-pulse-ring`}
                    />
                  )}
                  <step.icon className="relative size-5" />
                </div>
                <span
                  className={`text-center text-xs font-semibold leading-tight ${
                    state === "active" && isHold
                      ? "text-rose-600"
                      : state !== "pending"
                      ? "text-gray-800"
                      : "text-gray-400"
                  }`}
                  style={{ maxWidth: "70px" }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < PIPELINE.length - 1 && (
                <div
                  className={`mb-6 h-0.5 w-10 shrink-0 transition-colors ${
                    stepState(PIPELINE[i + 1], status) !== "pending" || state === "done"
                      ? "bg-green-400"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
