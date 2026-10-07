"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ShipmentForm } from "@/components/admin/shipment-form"
import { supabase } from "@/lib/supabase"
import type { Shipment } from "@/lib/database.types"
import { Loader2 } from "lucide-react"

export default function EditShipmentPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("tlg_admin_auth")) {
      router.replace("/admin")
    }
  }, [router])

  useEffect(() => {
    if (!id) return
    supabase
      .from("shipments")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { router.replace("/admin/dashboard"); return }
        setShipment(data as Shipment)
        setLoading(false)
      })
  }, [id, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return <ShipmentForm mode="edit" shipment={shipment!} />
}
