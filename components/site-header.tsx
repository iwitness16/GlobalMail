"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, PackageSearch, X } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/track", label: "Track Shipment" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-black/95 shadow-2xl shadow-black/60 backdrop-blur-md"
          : "bg-black/90 backdrop-blur-sm",
      )}
    >
      {/* Main bar */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="relative size-12 overflow-hidden rounded-full ring-2 ring-rose-500 ring-offset-2 ring-offset-black sm:size-14">
            <Image
              src="/images/logo.png"
              alt="Global Mail Express"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold leading-tight tracking-tight text-white sm:text-lg">
              Global Mail Express
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400 sm:block">
              Worldwide Freight &amp; Logistics
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white/12 text-white"
                    : "text-gray-300 hover:bg-white/8 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/track"
            className="hidden items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-900/40 transition hover:bg-rose-500 lg:inline-flex"
          >
            <PackageSearch className="size-4" />
            Track Package
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex size-10 items-center justify-center rounded-xl text-gray-300 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/8 bg-black/95 transition-all duration-300 lg:hidden",
          open ? "max-h-screen py-4 opacity-100" : "max-h-0 py-0 opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 pb-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:bg-white/6 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/track"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-500"
          >
            <PackageSearch className="size-4" />
            Track Package
          </Link>
        </nav>
      </div>
    </header>
  )
}
