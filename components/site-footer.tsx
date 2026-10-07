import Link from "next/link"
import { Mail, Phone, ArrowUpRight } from "lucide-react"
import Image from "next/image"

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Services", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Air Freight", href: "/services#air" },
      { label: "Ocean Freight", href: "/services#ocean" },
      { label: "Road Freight", href: "/services#road" },
      { label: "Rail Freight", href: "/services#rail" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track a Shipment", href: "/track" },
      { label: "Shipping FAQs", href: "/contact" },
      { label: "Get a Quote", href: "/contact" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-rose-500 ring-offset-2 ring-offset-[#12203f]">
                <Image
                  src="/images/logo.png"
                  alt="Global Mail Express"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-lg font-bold tracking-tight">Global Mail Express</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/70">
              Reliable air, ocean, road and rail freight forwarding with real-time shipment
              visibility, moving cargo and parcels across more than 120 countries.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="mailto:info@globalmailxpress.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
              >
                <Mail className="size-4" />
                info@globalmailxpress.com
              </Link>
              <Link
                href="tel:+19297942259"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
              >
                <Phone className="size-4" />
                +1 (929) 794-2259
              </Link>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/50">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-primary-foreground/80 transition-colors hover:text-accent"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 text-xs text-primary-foreground/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Global Mail Express. All rights reserved.</p>
          <p>globalmailxpress.com</p>
        </div>
      </div>
    </footer>
  )
}
