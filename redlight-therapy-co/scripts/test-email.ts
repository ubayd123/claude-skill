/**
 * Sends one real test email to ENQUIRY_TO through the configured provider and prints the result.
 *   npm run email:test
 */
import { Pool } from "pg";

async function main() {
  const to = process.env.ENQUIRY_TO || "redlighttherapyco.26@gmail.com";
  const from = process.env.EMAIL_FROM || "";
  const subject = `Website email test ${new Date().toISOString()}`;
  const text = "This is a test from the Redlight Therapy Co. website. If you can read this, enquiry emails are working.";
  let result = "not configured";
  if (process.env.RESEND_API_KEY) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    result = r.ok ? "sent via Resend" : `Resend error ${r.status}: ${await r.text()}`;
  } else if (process.env.SMTP_HOST) {
    const nodemailer = (await import("nodemailer")).default;
    const port = Number(process.env.SMTP_PORT || 587);
    const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await t.verify();
    const info = await t.sendMail({ from, to, subject, text });
    result = `sent via SMTP (${info.response})`;
  }
  console.log(`To: ${to}\nResult: ${result}`);
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query("insert into email_log (\"to\", subject, kind, status, provider) values ($1,$2,'test',$3,$4)", [to, subject, result.startsWith("sent") ? "sent" : "failed", process.env.RESEND_API_KEY ? "resend" : process.env.SMTP_HOST ? "smtp" : "none"]);
    await pool.end();
  }
  if (!result.startsWith("sent")) process.exit(1);
}
main().catch((e) => { console.error(e); process.exit(1); });
