"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import {
  Mail, Phone, Clock, Send, CheckCircle2,
  Plane, Ship, Truck, TrainFront, Zap, Warehouse,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// ── Data ───────────────────────────────────────────────────────────────────

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email us",
    value: "info@globalmailxpress.com",
    detail: "We respond within one business day",
    href: "mailto:info@globalmailxpress.com",
  },
  {
    icon: Phone,
    label: "Call or WhatsApp",
    value: "+1 (929) 794-2259",
    detail: "Available via call or WhatsApp",
    href: "tel:+19297942259",
  },
  {
    icon: Clock,
    label: "24/7 monitoring",
    value: "Round-the-clock tracking",
    detail: "Your cargo never sleeps, neither do we",
    href: null,
  },
]

const SERVICES = [
  "Air Freight", "Ocean Freight", "Road Freight",
  "Rail Freight", "Express Courier", "Warehousing",
]

const VOLUMES = [
  "Less than 50kg", "50 – 500kg", "500kg – 5 tonnes",
  "5 – 20 tonnes", "20+ tonnes",
]

// ── Contact form component ─────────────────────────────────────────────────

function ContactForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    service: "", volume: "", origin: "", destination: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Simulate async send
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1200)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-green-100 bg-green-50 p-12 text-center">
        <CheckCircle2 className="size-14 text-green-500" />
        <h3 className="text-xl font-bold text-gray-900">Message received!</h3>
        <p className="max-w-sm text-sm text-gray-500">
          Thank you, <span className="font-semibold">{form.name}</span>. Our team will review
          your enquiry and get back to you at <span className="font-semibold">{form.email}</span> within
          one business day.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name:"", email:"", phone:"", company:"", service:"", volume:"", origin:"", destination:"", message:"" }) }}
          className="rounded-full bg-rose-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-rose-500"
        >
          Send another enquiry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Email */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Full Name *</label>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="Jane Smith"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Email Address *</label>
          <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
            placeholder="jane@company.com"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400" />
        </div>
      </div>

      {/* Phone + Company */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Phone Number</label>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Company Name</label>
          <input value={form.company} onChange={(e) => set("company", e.target.value)}
            placeholder="Acme Logistics Ltd."
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400" />
        </div>
      </div>

      {/* Service + Volume */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Service Required</label>
          <select value={form.service} onChange={(e) => set("service", e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400">
            <option value="">-- Select a service --</option>
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Estimated Cargo Volume</label>
          <select value={form.volume} onChange={(e) => set("volume", e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400">
            <option value="">-- Select volume --</option>
            {VOLUMES.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Origin + Destination */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Origin (city / country)</label>
          <input value={form.origin} onChange={(e) => set("origin", e.target.value)}
            placeholder="e.g. Shanghai, China"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Destination (city / country)</label>
          <input value={form.destination} onChange={(e) => set("destination", e.target.value)}
            placeholder="e.g. London, UK"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400" />
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-600">Additional Details</label>
        <textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={4}
          placeholder="Tell us more about your shipment — cargo type, special requirements, timeline…"
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-none" />
      </div>

      <button type="submit" disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white transition hover:bg-rose-500 disabled:opacity-60">
        {loading
          ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          : <Send className="size-4" />}
        {loading ? "Sending…" : "Send Enquiry"}
      </button>

      <p className="text-center text-xs text-gray-400">
        We respond to all enquiries within one business day. No spam, ever.
      </p>
    </form>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative min-h-[44vh] overflow-hidden bg-black pt-20 text-white">
          <div className="absolute inset-0">
            <Image src="/images/hero-cargo.png" alt="" fill priority sizes="100vw"
              className="object-cover object-top" style={{ opacity: 0.35 }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="relative mx-auto flex min-h-[44vh] max-w-7xl flex-col justify-center px-4 pb-12 pt-24 sm:px-6 lg:px-8">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
              Get in touch
            </span>
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Let's move your<br />
              <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-transparent">
                cargo together
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-300">
              Whether you need a quote, have a question, or want to discuss a complex supply chain
              challenge — our team is ready to help.
            </p>
          </div>
        </section>

        {/* ── Main contact section ───────────────────────────────────────── */}
        <section className="bg-[#f5f5f7] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">

              {/* Left — info cards */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Contact details</span>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900">We're here to help</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Reach us via email or WhatsApp — our operations team is available every day
                    to assist with shipment enquiries, quotes, and tracking support.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {CONTACT_INFO.map((item) => (
                    <div key={item.label}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                      <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-rose-600 text-white">
                        <item.icon className="size-4.5" />
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                      {item.href ? (
                        <Link href={item.href}
                          className="mt-1 block text-sm font-bold text-gray-900 hover:text-rose-600">
                          {item.value}
                        </Link>
                      ) : (
                        <p className="mt-1 text-sm font-bold text-gray-900">{item.value}</p>
                      )}
                      <p className="mt-0.5 text-xs text-gray-400">{item.detail}</p>
                    </div>
                  ))}
                </div>

                {/* Services quick-links */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-gray-900">Services we handle</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Air Freight", icon: Plane, href: "/services#air" },
                      { label: "Ocean Freight", icon: Ship, href: "/services#ocean" },
                      { label: "Road Freight", icon: Truck, href: "/services#road" },
                      { label: "Rail Freight", icon: TrainFront, href: "/services#rail" },
                      { label: "Express", icon: Zap, href: "/services#express" },
                      { label: "Warehousing", icon: Warehouse, href: "/services#warehousing" },
                    ].map((s) => (
                      <Link key={s.label} href={s.href}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">
                        <s.icon className="size-3" /> {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — form */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="mb-1 text-xl font-bold text-gray-900">Request a quote</h2>
                <p className="mb-7 text-sm text-gray-500">
                  Fill in the form and our operations team will come back to you with a tailored
                  freight solution and competitive pricing.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ strip ─────────────────────────────────────────────────── */}
        <section className="bg-gray-900 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Quick answers</span>
              <h2 className="mt-2 text-3xl font-bold text-white">Common questions</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "How quickly can you arrange a shipment?",
                  a: "For air freight we can typically arrange same-day or next-day pickup once booked. Ocean and rail shipments require 48–72 hours lead time for booking and documentation.",
                },
                {
                  q: "Do you handle customs clearance?",
                  a: "Yes. Our licensed customs brokerage team handles import and export clearance in all major markets. We prepare all documentation and manage duties and taxes on your behalf.",
                },
                {
                  q: "Can I track my shipment in real time?",
                  a: "Absolutely. Every shipment registered through Global Mail Express gets a tracking number. Visit our Track page and enter the consignment number to get live status, location, and delivery updates.",
                },
                {
                  q: "What happens if my shipment is delayed?",
                  a: "You'll be notified proactively the moment any deviation is detected. Your assigned operations contact will explain the cause and present recovery options immediately.",
                },
                {
                  q: "Do you provide cargo insurance?",
                  a: "Yes — we can arrange all-risk marine cargo insurance for any shipment. Just indicate this when requesting a quote and we'll include it in your proposal.",
                },
              ].map((faq) => (
                <div key={faq.q} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-sm font-bold text-white">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
