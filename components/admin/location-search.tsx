"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MapPin, Loader2 } from "lucide-react"

interface GeoResult {
  display_name: string
  lat: string
  lon: string
}

interface Props {
  label: string
  value: string
  onChange: (value: string, lat: number, lng: number) => void
  placeholder?: string
  required?: boolean
}

export function LocationSearch({ label, value, onChange, placeholder, required }: Props) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<GeoResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync external value changes
  useEffect(() => { setQuery(value) }, [value])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 3) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6`,
        { headers: { "Accept-Language": "en" } },
      )
      const data: GeoResult[] = await res.json()
      setResults(data)
      setOpen(data.length > 0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 420)
  }

  function select(r: GeoResult) {
    const short = r.display_name.split(",").slice(0, 3).join(", ")
    setQuery(short)
    setOpen(false)
    setResults([])
    onChange(short, parseFloat(r.lat), parseFloat(r.lon))
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">{label}{required && " *"}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder ?? "Type a city or address…"}
          required={required}
          className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-8 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute top-full z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => select(r)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-indigo-50"
              >
                <MapPin className="mt-0.5 size-3 shrink-0 text-indigo-400" />
                <span className="line-clamp-2 text-gray-700">{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
