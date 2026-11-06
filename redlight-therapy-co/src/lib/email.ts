import "server-only";
import nodemailer from "nodemailer";
import { db, schema } from "@/db";
import { BUSINESS_EMAIL, SITE_NAME, siteUrl } from "./site";
import { escapeHtml } from "./security";
import { formatMoney } from "./money";

export type EmailResult = { status: "sent" | "failed" | "not_configured"; provider: string; error?: string };

type Message = {
  to: string;
  subject: string;
  html: string;
  text: string;
  kind: string;
  replyTo?: string;
};

export function enquiryRecipient() {
  return process.env.ENQUIRY_TO || BUSINESS_EMAIL;
}

function fromAddress() {
  return process.env.EMAIL_FROM || `${SITE_NAME} <no-reply@localhost>`;
}

export function emailProvider(): "resend" | "smtp" | null {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST) return "smtp";
  return null;
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
function smtp() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      requireTLS: port !== 465 && process.env.SMTP_REQUIRE_TLS !== "false",
      connectionTimeout: 15_000,
    });
  }
  return transporter;
}

async function deliver(msg: Message): Promise<EmailResult> {
  const provider = emailProvider();
  if (!provider) return { status: "not_configured", provider: "none", error: "No email provider configured" };
  try {
    if (provider === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromAddress(),
          to: [msg.to],
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          reply_to: msg.replyTo ? [msg.replyTo] : undefined,
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) return { status: "failed", provider, error: `Resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
      return { status: "sent", provider };
    }
    await smtp().sendMail({
      from: fromAddress(),
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: msg.replyTo,
    });
    return { status: "sent", provider };
  } catch (err) {
    return { status: "failed", provider, error: err instanceof Error ? err.message.slice(0, 300) : "Unknown error" };
  }
}

/** Send and record every attempt in email_log, so nothing is lost if delivery fails. */
export async function sendEmail(msg: Message): Promise<EmailResult> {
  const result = await deliver(msg);
  await db.insert(schema.emailLog).values({
    to: msg.to,
    subject: msg.subject,
    kind: msg.kind,
    status: result.status,
    provider: result.provider,
    error: result.error ?? "",
  });
  if (result.status !== "sent") console.warn(`[email] ${msg.kind} to ${msg.to}: ${result.status} ${result.error ?? ""}`);
  return result;
}

// ---------- Templates ----------

export type Row = [label: string, value: string];

export function layout(title: string, intro: string, rows: Row[], tableHtml = "", footer = "") {
  const rowHtml = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;color:#6b6b6b;font-size:13px;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:8px 12px;color:#101010;font-size:14px">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html><body style="margin:0;background:#f6f3f0;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3f0;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ece7e2">
<tr><td style="background:#101010;padding:24px 28px"><span style="color:#ffffff;font-weight:800;letter-spacing:.08em;font-size:15px">REDLIGHT</span> <span style="color:#e50920;font-size:15px">■</span> <span style="color:#d9d9d9;letter-spacing:.12em;font-size:12px">THERAPY CO.</span></td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 12px;font-size:22px;color:#101010">${escapeHtml(title)}</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#333">${escapeHtml(intro)}</p>
${rowHtml ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:10px;margin-bottom:20px">${rowHtml}</table>` : ""}
${tableHtml}
${footer ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#6b6b6b">${footer}</p>` : ""}
</td></tr>
<tr><td style="padding:18px 28px;background:#faf8f6;font-size:12px;color:#8a8a8a">${SITE_NAME} · <a href="${siteUrl()}" style="color:#e50920">${siteUrl().replace(/^https?:\/\//, "")}</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = [title, "", intro, "", ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)].join("\n");
  return { html, text };
}

export type ItemLine = { productName: string; model: string; quantity: number; unitPrice: string | null; currency: string };

export function itemsTable(items: ItemLine[], showPrices: boolean) {
  const head = `<tr style="background:#faf8f6"><th align="left" style="padding:10px 12px;font-size:12px;color:#6b6b6b">Product</th><th align="left" style="padding:10px 12px;font-size:12px;color:#6b6b6b">Model</th><th align="right" style="padding:10px 12px;font-size:12px;color:#6b6b6b">Qty</th>${showPrices ? '<th align="right" style="padding:10px 12px;font-size:12px;color:#6b6b6b">Unit price</th>' : ""}</tr>`;
  const body = items
    .map(
      (i) =>
        `<tr><td style="padding:10px 12px;border-top:1px solid #eee;font-size:14px;color:#101010">${escapeHtml(i.productName)}</td><td style="padding:10px 12px;border-top:1px solid #eee;font-size:13px;color:#555">${escapeHtml(i.model || "-")}</td><td align="right" style="padding:10px 12px;border-top:1px solid #eee;font-size:14px;color:#101010"><strong>${i.quantity}</strong></td>${showPrices ? `<td align="right" style="padding:10px 12px;border-top:1px solid #eee;font-size:14px">${i.unitPrice ? escapeHtml(formatMoney(i.unitPrice, i.currency)) : "On request"}</td>` : ""}</tr>`,
    )
    .join("");
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:10px">${head}${body}</table>`;
  const text = items
    .map((i) => `- ${i.quantity} x ${i.productName}${i.model ? ` (${i.model})` : ""}${showPrices && i.unitPrice ? ` @ ${formatMoney(i.unitPrice, i.currency)}` : ""}`)
    .join("\n");
  return { html, text };
}
