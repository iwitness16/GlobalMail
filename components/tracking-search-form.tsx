"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export function TrackingSearchForm({
  defaultValue = "",
  className,
  size = "default",
}: {
  defaultValue?: string
  className?: string
  size?: "default" | "lg"
}) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    router.push(`/track?number=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex w-full flex-col gap-3 sm:flex-row", className)}>
      <InputGroup className={cn("bg-background", size === "lg" && "h-14 rounded-xl text-base")}>
        <InputGroupAddon>
          <PackageSearch className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Enter tracking number, e.g. TLG-4821960573"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Tracking number"
        />
      </InputGroup>
      <Button
        type="submit"
        size={size === "lg" ? "lg" : "default"}
        className="shrink-0 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
      >
        Track Shipment
        <ArrowRight data-icon="inline-end" />
      </Button>
    </form>
  )
}
