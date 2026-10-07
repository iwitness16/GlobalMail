/**
 * Email Templates — Global Mail Express
 * Professional HTML emails for shipment notifications.
 */

export interface ShipmentEmailData {
  event:           "created" | "updated"
  trackingNumber:  string
  receiverName:    string
  receiverEmail:   string
  shipperName:     string
  origin:          string
  destination:     string
  status:          string
  deliveryMode:    string
  product:         string
  weight:          number
  quantity:        number
  pickupDate:      string | null
  expectedDelivery: string | null
  comments:        string
  adminMessage:    string | null
  siteUrl:         string
}

// ── Shared styles ─────────────────────────────────────────────────────────

const BRAND_RED   = "#e11d48"
const BRAND_DARK  = "#111827"
const GREY_BG     = "#f9fafb"
const GREY_BORDER = "#e5e7eb"
const GREY_TEXT   = "#6b7280"

function baseLayout(content: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Global Mail Express</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${GREY_BG};font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preview text -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${GREY_BG};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${GREY_BORDER};">

        <!-- Header -->
        <tr>
          <td style="background-color:${BRAND_DARK};padding:24px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">
                    Global Mail Express
                  </span>
                  <br/>
                  <span style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">
                    Worldwide Freight &amp; Logistics
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Red accent bar -->
        <tr><td style="background-color:${BRAND_RED};height:4px;"></td></tr>

        <!-- Body -->
        ${content}

        <!-- Footer -->
        <tr>
          <td style="background-color:${GREY_BG};padding:24px 32px;border-top:1px solid ${GREY_BORDER};">
            <p style="margin:0 0 6px;font-size:12px;color:${GREY_TEXT};text-align:center;">
              Global Mail Express &mdash; Worldwide Freight &amp; Logistics
            </p>
            <p style="margin:0;font-size:12px;color:${GREY_TEXT};text-align:center;">
              <a href="mailto:info@globalmailxpress.com" style="color:${BRAND_RED};text-decoration:none;">info@globalmailxpress.com</a>
              &nbsp;&bull;&nbsp;
              <a href="tel:+19297942259" style="color:${BRAND_RED};text-decoration:none;">+1 (929) 794-2259</a>
            </p>
            <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;text-align:center;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Row helper ────────────────────────────────────────────────────────────

function infoRow(label: string, value: string): string {
  if (!value) return ""
  return `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:${GREY_TEXT};width:40%;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-size:13px;color:${BRAND_DARK};font-weight:600;vertical-align:top;">${value}</td>
    </tr>`
}

// ── Status badge ──────────────────────────────────────────────────────────

function statusBadge(status: string): string {
  const s = status.toLowerCase().replace(/_/g, " ")
  const isDelivered  = s === "delivered"
  const isHold       = s.includes("hold")
  const bg = isDelivered ? "#dcfce7" : isHold ? "#fee2e2" : "#dbeafe"
  const fg = isDelivered ? "#15803d" : isHold ? "#b91c1c" : "#1d4ed8"
  const label = s.replace(/\b\w/g, c => c.toUpperCase())
  return `<span style="display:inline-block;background:${bg};color:${fg};font-size:12px;font-weight:700;padding:3px 12px;border-radius:999px;letter-spacing:0.03em;">${label}</span>`
}

// ── Track button ──────────────────────────────────────────────────────────

function trackButton(siteUrl: string, trackingNumber: string): string {
  const url = `${siteUrl}/track?q=${encodeURIComponent(trackingNumber)}`
  return `
    <tr>
      <td align="center" style="padding:28px 32px 32px;">
        <a href="${url}" target="_blank"
          style="display:inline-block;background-color:${BRAND_RED};color:#ffffff;font-size:15px;font-weight:700;
                 padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">
          Track Shipment
        </a>
        <p style="margin:12px 0 0;font-size:12px;color:${GREY_TEXT};">
          Or copy this link:
          <a href="${url}" style="color:${BRAND_RED};word-break:break-all;">${url}</a>
        </p>
      </td>
    </tr>`
}

// ── Main template ─────────────────────────────────────────────────────────

export function buildShipmentEmail(data: ShipmentEmailData): { subject: string; html: string; text: string } {
  const isNew = data.event === "created"

  const subject = isNew
    ? `Shipment Confirmed: ${data.trackingNumber} - Global Mail Express`
    : `Shipment Update: ${data.trackingNumber} - Global Mail Express`

  const previewText = isNew
    ? `Your shipment ${data.trackingNumber} has been registered and is on its way.`
    : `There is an update on your shipment ${data.trackingNumber}.`

  const eventBanner = isNew
    ? `<tr><td style="background:#f0fdf4;border-left:4px solid #22c55e;padding:14px 20px;margin:0 32px;">
         <p style="margin:0;font-size:13px;color:#15803d;font-weight:600;">Your shipment has been successfully registered.</p>
       </td></tr>`
    : `<tr><td style="background:#eff6ff;border-left:4px solid #3b82f6;padding:14px 20px;margin:0 32px;">
         <p style="margin:0;font-size:13px;color:#1d4ed8;font-weight:600;">Your shipment details have been updated.</p>
       </td></tr>`

  const adminMsgBlock = data.adminMessage
    ? `<tr><td style="padding:0 32px 20px;">
         <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;">
           <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#92400e;">
             Message from our team
           </p>
           <p style="margin:0;font-size:13px;color:#78350f;font-style:italic;line-height:1.6;">${data.adminMessage}</p>
         </div>
       </td></tr>`
    : ""

  const expectedDeliveryStr = data.expectedDelivery
    ? new Date(data.expectedDelivery).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : ""

  const content = `
    <!-- Greeting -->
    <tr><td style="padding:32px 32px 20px;">
      <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:${BRAND_DARK};">
        ${isNew ? "Shipment Confirmed" : "Shipment Update"}
      </p>
      <p style="margin:0;font-size:14px;color:${GREY_TEXT};">
        Hello ${data.receiverName}, here is your latest shipment information.
      </p>
    </td></tr>

    <!-- Event banner -->
    <tr><td style="padding:0 32px 20px;">${eventBanner.replace(/<tr>|<\/tr>/g, "")}</td></tr>

    <!-- Tracking number + status -->
    <tr>
      <td style="padding:0 32px 24px;">
        <table role="presentation" width="100%" style="background:${GREY_BG};border-radius:10px;padding:16px 20px;" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:${GREY_TEXT};">
                Consignment Number
              </p>
              <p style="margin:0 0 10px;font-size:18px;font-weight:800;color:${BRAND_DARK};font-family:monospace;letter-spacing:0.05em;">
                ${data.trackingNumber}
              </p>
              ${statusBadge(data.status)}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Route -->
    <tr><td style="padding:0 32px 24px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${GREY_TEXT};">
        Route
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#f0fdf4;border-radius:8px 0 0 8px;padding:12px 16px;width:45%;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">From</p>
            <p style="margin:0;font-size:13px;font-weight:700;color:${BRAND_DARK};">${data.origin}</p>
          </td>
          <td style="background:#f1f5f9;padding:12px 10px;text-align:center;width:10%;">
            <span style="font-size:18px;color:${GREY_TEXT};">&#8594;</span>
          </td>
          <td style="background:#fef2f2;border-radius:0 8px 8px 0;padding:12px 16px;width:45%;">
            <p style="margin:0 0 2px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;">To</p>
            <p style="margin:0;font-size:13px;font-weight:700;color:${BRAND_DARK};">${data.destination}</p>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Shipment details table -->
    <tr><td style="padding:0 32px 24px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${GREY_TEXT};">
        Shipment Details
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${GREY_BORDER};border-radius:8px;overflow:hidden;">
        <tr style="background:${GREY_BG};">
          <th align="left" style="padding:10px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${GREY_TEXT};border-bottom:1px solid ${GREY_BORDER};">Field</th>
          <th align="left" style="padding:10px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${GREY_TEXT};border-bottom:1px solid ${GREY_BORDER};">Value</th>
        </tr>
        ${[
          ["Sender",            data.shipperName],
          ["Delivery Mode",     data.deliveryMode.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())],
          ["Product",           data.product],
          ["Weight",            data.weight ? `${data.weight} kg` : ""],
          ["Quantity",          data.quantity ? String(data.quantity) : ""],
          ["Pickup Date",       data.pickupDate ?? ""],
          ["Expected Delivery", expectedDeliveryStr],
          ["Comments",          data.comments],
        ].filter(([, v]) => v).map(([l, v], i) =>
          `<tr style="background:${i % 2 === 0 ? "#ffffff" : GREY_BG};">
             <td style="padding:10px 16px;font-size:13px;color:${GREY_TEXT};border-bottom:1px solid ${GREY_BORDER};">${l}</td>
             <td style="padding:10px 16px;font-size:13px;color:${BRAND_DARK};font-weight:600;border-bottom:1px solid ${GREY_BORDER};">${v}</td>
           </tr>`
        ).join("")}
      </table>
    </td></tr>

    <!-- Admin message -->
    ${adminMsgBlock}

    <!-- Track button -->
    ${trackButton(data.siteUrl, data.trackingNumber)}
  `

  const html = baseLayout(content, previewText)

  // Plain text fallback
  const text = [
    `Global Mail Express - Shipment ${isNew ? "Confirmation" : "Update"}`,
    ``,
    `Hello ${data.receiverName},`,
    ``,
    isNew
      ? `Your shipment has been successfully registered.`
      : `Your shipment has been updated.`,
    ``,
    `Consignment Number: ${data.trackingNumber}`,
    `Status: ${data.status.replace(/_/g, " ")}`,
    `From: ${data.origin}`,
    `To: ${data.destination}`,
    `Delivery Mode: ${data.deliveryMode.replace(/_/g, " ")}`,
    data.product          ? `Product: ${data.product}`                : "",
    data.weight           ? `Weight: ${data.weight} kg`               : "",
    data.pickupDate       ? `Pickup Date: ${data.pickupDate}`         : "",
    expectedDeliveryStr   ? `Expected Delivery: ${expectedDeliveryStr}` : "",
    data.adminMessage     ? `\nMessage from our team:\n${data.adminMessage}` : "",
    ``,
    `Track your shipment: ${data.siteUrl}/track?q=${encodeURIComponent(data.trackingNumber)}`,
    ``,
    `Global Mail Express`,
    `info@globalmailxpress.com | +1 (929) 794-2259`,
  ].filter(l => l !== undefined).join("\n")

  return { subject, html, text }
}

// ── Admin copy ────────────────────────────────────────────────────────────

export function buildAdminEmail(data: ShipmentEmailData): { subject: string; html: string; text: string } {
  const isNew = data.event === "created"
  const subject = `[ADMIN] Shipment ${isNew ? "Created" : "Updated"}: ${data.trackingNumber}`

  const content = `
    <tr><td style="padding:32px 32px 16px;">
      <p style="margin:0 0 4px;font-size:20px;font-weight:800;color:${BRAND_DARK};">
        Admin Notification
      </p>
      <p style="margin:0;font-size:14px;color:${GREY_TEXT};">
        A shipment was ${isNew ? "created" : "updated"} and a notification was sent to <strong>${data.receiverEmail}</strong>.
      </p>
    </td></tr>
    <tr><td style="padding:0 32px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${GREY_BORDER};border-radius:8px;overflow:hidden;">
        <tr style="background:${GREY_BG};">
          <th align="left" style="padding:10px 16px;font-size:11px;font-weight:700;color:${GREY_TEXT};text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid ${GREY_BORDER};">Field</th>
          <th align="left" style="padding:10px 16px;font-size:11px;font-weight:700;color:${GREY_TEXT};text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid ${GREY_BORDER};">Value</th>
        </tr>
        ${[
          ["Event",           isNew ? "Shipment Created" : "Shipment Updated"],
          ["Tracking Number", data.trackingNumber],
          ["Status",          data.status.replace(/_/g, " ")],
          ["Receiver",        `${data.receiverName} (${data.receiverEmail})`],
          ["Shipper",         data.shipperName],
          ["Origin",          data.origin],
          ["Destination",     data.destination],
          ["Delivery Mode",   data.deliveryMode.replace(/_/g, " ")],
          ["Product",         data.product],
        ].filter(([, v]) => v).map(([l, v], i) =>
          `<tr style="background:${i % 2 === 0 ? "#ffffff" : GREY_BG};">
             <td style="padding:10px 16px;font-size:13px;color:${GREY_TEXT};border-bottom:1px solid ${GREY_BORDER};">${l}</td>
             <td style="padding:10px 16px;font-size:13px;color:${BRAND_DARK};font-weight:600;border-bottom:1px solid ${GREY_BORDER};">${v}</td>
           </tr>`
        ).join("")}
      </table>
    </td></tr>
    ${trackButton(data.siteUrl, data.trackingNumber)}
  `

  return {
    subject,
    html: baseLayout(content, subject),
    text: `Admin copy: Shipment ${isNew ? "created" : "updated"} - ${data.trackingNumber}\nReceiver: ${data.receiverName} (${data.receiverEmail})`,
  }
}
