"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ShipmentForm } from "@/components/admin/shipment-form"

export default function NewShipmentPage() {
  const router = useRouter()
  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("tlg_admin_auth")) {
      router.replace("/admin")
    }
  }, [router])
  return <ShipmentForm mode="create" />
}
