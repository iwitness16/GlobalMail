import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { buildShipmentEmail, buildAdminEmail } from "@/lib/email-templates"
import type { ShipmentEmailData } from "@/lib/email-templates"

// ── Transporter ───────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.MAIL_HOST   || "smtp.gmail.com",
    port:   Number(process.env.MAIL_PORT || 587),
    secure: Number(process.env.MAIL_PORT || 587) === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })
}

// ── POST handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const data: ShipmentEmailData = await req.json()

    // Validate minimum required fields
    if (!data.trackingNumber || !data.receiverEmail) {
      return NextResponse.json(
        { error: "Missing trackingNumber or receiverEmail" },
        { status: 400 },
      )
    }

    // Skip sending if email credentials are not configured (dev/demo mode)
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS ||
        process.env.MAIL_USER === "your-email@gmail.com") {
      console.log("[NOTIFY] Email credentials not configured — skipping send.")
      console.log("[NOTIFY] Would email:", data.receiverEmail, "re:", data.trackingNumber)
      return NextResponse.json({ sent: false, reason: "credentials_not_configured" })
    }

    const transporter = createTransporter()

    const from    = process.env.MAIL_FROM    || `Global Mail Express <${process.env.MAIL_USER}>`
    const adminTo = process.env.ADMIN_EMAIL  || process.env.MAIL_USER!
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://globalmailxpress.com"

    const emailData: ShipmentEmailData = { ...data, siteUrl }

    // ── Receiver email ────────────────────────────────────────────────────
    const receiver = buildShipmentEmail(emailData)
    await transporter.sendMail({
      from,
      to:      data.receiverEmail,
      subject: receiver.subject,
      html:    receiver.html,
      text:    receiver.text,
    })

    // ── Admin copy ────────────────────────────────────────────────────────
    const admin = buildAdminEmail(emailData)
    await transporter.sendMail({
      from,
      to:      adminTo,
      subject: admin.subject,
      html:    admin.html,
      text:    admin.text,
    })

    return NextResponse.json({ sent: true })
  } catch (err: any) {
    console.error("[NOTIFY] Email send failed:", err.message)
    // Return 200 even on failure — email is best-effort, must not block the admin save
    return NextResponse.json({ sent: false, error: err.message })
  }
}
