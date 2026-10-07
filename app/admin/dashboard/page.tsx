"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Search, Plus, Pencil, Trash2, LogOut, Package,
  RefreshCw, ListOrdered, Menu, X, Loader2, Receipt,
} from "lucide-react"
import { getAllShipments, deleteShipment } from "@/lib/shipment-service"
import { getAllBills, createBill, deleteBill } from "@/lib/bills-service"
import type { Bill } from "@/lib/bills-service"
import { ShipmentForm } from "@/components/admin/shipment-form"
import type { Shipment, ShipmentStatus } from "@/lib/database.types"

type Tab = "new" | "shipments" | "bills"

const STATUS_STYLES: Record<ShipmentStatus, { label: string; cls: string }> = {
  pending:          { label: "Pending",          cls: "bg-gray-100 text-gray-700" },
  picked_up:        { label: "Picked Up",        cls: "bg-blue-100 text-blue-700" },
  in_transit:       { label: "In Transit",       cls: "bg-indigo-100 text-indigo-700" },
  customs:          { label: "In Customs",       cls: "bg-yellow-100 text-yellow-700" },
  on_hold:          { label: "On Hold",          cls: "bg-red-100 text-red-700" },
  out_for_delivery: { label: "Out for Delivery", cls: "bg-orange-100 text-orange-700" },
  delivered:        { label: "Delivered",        cls: "bg-green-100 text-green-700" },
  delayed:          { label: "Delayed",          cls: "bg-pink-100 text-pink-700" },
  exception:        { label: "Exception",        cls: "bg-red-200 text-red-800" },
}

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "new",       label: "New Shipment",  icon: Plus },
  { id: "shipments", label: "All Shipments", icon: ListOrdered },
  { id: "bills",     label: "Bills",         icon: Receipt },
]

// ── Shared sidebar nav ────────────────────────────────────────────────────

function SidebarContent({
  tab, navTo, handleLogout,
}: {
  tab: Tab
  navTo: (t: Tab) => void
  handleLogout: () => void
}) {
  return (
    <>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => navTo(id)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              tab === id
                ? "bg-rose-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>
      <div className="border-t border-gray-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </>
  )
}

// ── Shipments list panel ──────────────────────────────────────────────────

function ShipmentsPanel() {
  const [shipments, setShipments]       = useState<Shipment[]>([])
  const [filtered, setFiltered]         = useState<Shipment[]>([])
  const [query, setQuery]               = useState("")
  const [loading, setLoading]           = useState(true)
  const [deletingId, setDeletingId]     = useState<string | null>(null)
  const [error, setError]               = useState("")
  const [editShipment, setEditShipment] = useState<Shipment | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getAllShipments()
      setShipments(data)
      setFiltered(data)
    } catch (e: any) {
      setError(e.message ?? "Failed to load shipments.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(
      q
        ? shipments.filter(s =>
            s.tracking_number.toLowerCase().includes(q) ||
            s.receiver_name.toLowerCase().includes(q) ||
            s.shipper_name.toLowerCase().includes(q) ||
            s.origin.toLowerCase().includes(q) ||
            s.destination.toLowerCase().includes(q),
          )
        : shipments,
    )
  }, [query, shipments])

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this shipment?")) return
    setDeletingId(id)
    try {
      await deleteShipment(id)
      await load()
    } catch (e: any) {
      alert(e.message ?? "Delete failed.")
    } finally {
      setDeletingId(null)
    }
  }

  if (editShipment) {
    return (
      <ShipmentForm
        mode="edit"
        shipment={editShipment}
        onSuccess={() => { setEditShipment(null); load() }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tracking #, name, origin…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
          />
        </div>
        <button
          onClick={load}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="size-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Table — overflow-x-auto lets mobile scroll each row left/right */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-gray-400">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-400">
            <Package className="size-10 opacity-30" />
            <p className="text-sm">No shipments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  {["Consignment #", "Origin → Destination", "Status", "ETA", "Actions"].map(h => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => {
                  const st = STATUS_STYLES[s.status] ?? { label: s.status, cls: "bg-gray-100 text-gray-700" }
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/60">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-gray-800">
                        {s.tracking_number}
                      </td>
                      <td className="px-4 py-3">
                        <span className="block text-xs font-medium text-gray-700">{s.origin}</span>
                        <span className="text-xs text-gray-400">→ {s.destination}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                        {s.expected_delivery ? new Date(s.expected_delivery).toLocaleDateString() : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditShipment(s)}
                            className="flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            <Pencil className="size-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={deletingId === s.id}
                            className="flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40"
                          >
                            {deletingId === s.id
                              ? <Loader2 className="size-3 animate-spin" />
                              : <Trash2 className="size-3" />}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-right text-xs text-gray-400">{filtered.length} shipment(s)</p>
    </div>
  )
}

// ── Bills panel ───────────────────────────────────────────────────────────

function BillsPanel() {
  const [bills, setBills]           = useState<Bill[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError]           = useState("")
  const [newName, setNewName]       = useState("")

  async function load() {
    setLoading(true)
    setError("")
    try { setBills(await getAllBills()) }
    catch (e: any) { setError(e.message ?? "Failed to load bills.") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) { setError("Bill name is required."); return }
    setSaving(true)
    setError("")
    try {
      await createBill(newName.trim())
      setNewName("")
      await load()
    } catch (e: any) {
      setError(e.message?.includes("unique") ? "A bill with that name already exists." : (e.message ?? "Failed to add bill."))
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this bill name?")) return
    setDeletingId(id)
    try { await deleteBill(id); await load() }
    catch (e: any) { alert(e.message ?? "Delete failed.") }
    finally { setDeletingId(null) }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-bold text-gray-900">Bills</h2>
        <p className="mb-5 text-sm text-gray-500">
          Add bill names here. They will appear as options in the Alert Type dropdown when creating or editing a shipment.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
        )}

        {/* Single input form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => { setNewName(e.target.value); setError("") }}
            placeholder="e.g. Import Duty, Storage Fee..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
          />
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            Add
          </button>
        </form>
      </div>

      {/* Bills list */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-bold text-gray-900">Saved Bill Names</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
            <Loader2 className="size-4 animate-spin" /> Loading...
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
            <Receipt className="size-8 opacity-30" />
            <p className="text-sm">No bill names added yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {bills.map(b => (
              <li key={b.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-medium text-gray-800">{b.name}</span>
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={deletingId === b.id}
                  className="flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-40"
                >
                  {deletingId === b.id
                    ? <Loader2 className="size-3 animate-spin" />
                    : <Trash2 className="size-3" />}
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab]                 = useState<Tab>("new")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("tlg_admin_auth")) {
      router.replace("/admin")
    }
  }, [router])

  function handleLogout() {
    sessionStorage.removeItem("tlg_admin_auth")
    router.push("/admin")
  }

  function navTo(t: Tab) {
    setTab(t)
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-full ring-2 ring-rose-500 ring-offset-1 ring-offset-white">
            <Image src="/images/logo.png" alt="Global Mail Express" fill className="object-cover" />
          </div>
          <span className="text-sm font-bold leading-tight text-gray-900">GME Admin</span>
        </div>
        <SidebarContent tab={tab} navTo={navTo} handleLogout={handleLogout} />
      </aside>

      {/* ── Mobile sidebar overlay — fixed full-screen backdrop ──────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          {/* Semi-transparent backdrop covers entire screen */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Drawer panel — stopPropagation so tapping inside doesn't close */}
          <aside
            className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="relative size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-rose-500 ring-offset-1 ring-offset-white">
                  <Image src="/images/logo.png" alt="Global Mail Express" fill className="object-cover" />
                </div>
                <span className="text-sm font-bold text-gray-900">GME Admin</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="size-5" />
              </button>
            </div>
            <SidebarContent tab={tab} navTo={navTo} handleLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <h1 className="font-bold text-gray-900">
              {tab === "new" ? "Create New Shipment" : tab === "bills" ? "Bills" : "All Shipments"}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 sm:flex"
          >
            <LogOut className="size-4" /> Logout
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {tab === "new"       && <ShipmentForm mode="create" onSuccess={() => navTo("shipments")} />}
          {tab === "shipments" && <ShipmentsPanel />}
          {tab === "bills"     && <BillsPanel />}
        </main>
      </div>
    </div>
  )
}
