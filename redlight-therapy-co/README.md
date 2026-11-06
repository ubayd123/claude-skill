# Redlight Therapy Co. — wholesale website

A standalone wholesale website for Redlight Therapy Co.: public catalogue, wholesale account applications, a customer dashboard with confidential trade pricing, multi-product order enquiries delivered by email, and an admin dashboard. **No Shopify, no checkout, no online payment.**

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Motion:** GSAP 3.15 + ScrollTrigger, Lenis smooth scrolling, adapted React Bits components
- **Backend:** Next.js server actions and route handlers, PostgreSQL 16 via Drizzle ORM
- **Email:** Resend (HTTP API) or any SMTP provider, every attempt logged to the database

## Quick start (local)

```bash
cp .env.example .env.local        # fill in DATABASE_URL, ADMIN_PASSWORD, APP_SECRET
npm install
npm run db:migrate                # create tables
npm run db:seed                   # products, price list, documents, first admin
npm run dev                       # http://localhost:3000
```

Sign in at `/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. The admin dashboard is at `/admin`.

## Where the content came from

`src/data/catalogue.ts` holds everything transcribed from the two supplied PDFs:

| Source | Used for |
|---|---|
| *Wholesale Range* catalogue (13 pp.) | Product names, photos (extracted at full resolution), models, test/certificate data, light measurements, per-product documentation packs (split from the PDF into `storage/docs/`) |
| *Trade Price List, Nov 2026* | Trade prices, RRP, reseller margins, MOQ, volume tiers, payment and delivery terms. **Confidential: kept in `private/price-list.json`, which is git-ignored.** `npm run db:seed` imports it; without it, enter prices in Admin → Pricing. |

Nothing was invented. Fields the PDFs do not cover (dimensions, what's included, how to use, all details of the 100 LED panel) are left empty and the site shows "Available on request". Fill them in from **Admin → Products**.

**Price links:** the price list's "LED Face Mask" row is linked to the *Red Light Therapy Face Mask*; the *Starter LED Face Mask* has its own price, supplied by the owner after the November 2026 list. Every product has a 20-unit minimum order. Change any link in **Admin → Pricing**.

## How the key features work

### Order enquiries (no checkout)
- Every product page has **Enquire about this product** (quantity, model, contact details) and **Add to enquiry list**.
- The enquiry list collects several products and quantities, then sends them as one enquiry from `/enquiry`.
- On submit the server: validates input (zod), checks a honeypot and a minimum fill time, applies a rate limit (6 per 10 min per IP), resolves products and prices **from the database** (never from the browser), saves the enquiry and its items, emails the business at `ENQUIRY_TO` (Reply-To set to the customer), emails the customer an acknowledgement, and records both delivery results.
- If the customer is a signed-in approved account with price access, their trade price (with the volume tier applied) is included in the business email.

### Wholesale pricing confidentiality
- Prices exist only in the `prices` table and are read through one gate: `canSeePrices()` in `src/lib/pricing.ts`.
- Guests always see "Price on application"; trade prices never appear in public HTML (checked in testing).
- **Admin → Pricing** sets the mode: *Approved customers* (default) or *Quotation only*. Each customer also has a "Can see trade prices" switch.

### Wholesale accounts
1. A business applies at `/wholesale#apply`. The application is saved, the business is emailed, and the applicant gets an acknowledgement.
2. Admin approves or rejects in **Admin → Applications**. Approval creates the customer and emails a one-time set-password link (72 h). If email isn't configured, the admin screen shows the link to copy instead.
3. Customers sign in to `/account`: trade price list, enquiry history, documents, business details.

### Admin dashboard (`/admin`)
Products (add/edit/delete, images, gallery, specs, models, SEO), categories, documents (PDF upload, public or customers-only), pricing (rows, product links, MOQ, tiers, terms, visibility), applications, customers, enquiries (status + notes), website wording and social links, JSON import/export, and an email delivery log.

## Email setup (required before launch)

The code sends through **Resend** (`RESEND_API_KEY`) or **SMTP** (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). Credentials live only in server environment variables.

1. Use a domain you own (e.g. `redlighttherapy.co.uk`) and verify it with the provider. The provider gives you DNS records:
   - **SPF** — TXT on the sending domain, e.g. `v=spf1 include:amazonses.com ~all` (Resend) — use exactly what the provider shows.
   - **DKIM** — the CNAME/TXT keys the provider shows.
   - **DMARC** — TXT at `_dmarc.yourdomain`, start with `v=DMARC1; p=none; rua=mailto:redlighttherapyco.26@gmail.com`, move to `p=quarantine` once reports look clean.
2. Set `EMAIL_FROM="Redlight Therapy Co. <enquiries@yourdomain>"`.
3. Run `npm run email:test`. It sends a real message to `ENQUIRY_TO` and prints the result. Then submit a real enquiry on the site and check **Admin → Email log**.

Sending *from* a @gmail.com address through a third-party provider fails DMARC, which is why a verified domain is needed. Enquiries are still delivered *to* redlighttherapyco.26@gmail.com.

## Deployment

Any Node 22 host works. Two tested routes:

**Docker (VPS such as Hetzner or DigitalOcean):**
```bash
cp .env.example .env    # set SITE_URL, ADMIN_*, APP_SECRET, email settings; add POSTGRES_PASSWORD
docker compose up -d --build
```
Put Caddy or Nginx in front for HTTPS (Caddy gets Let's Encrypt certificates automatically). Uploaded images and PDFs persist in the `files` volume.

**Managed (Railway, Render or Fly.io + managed Postgres):** build `npm run build`, start `node .next/standalone/server.js`, run `npm run db:migrate && npm run db:seed` once, set `DATABASE_SSL=require`, and mount a persistent disk at `STORAGE_DIR` for uploads. Platforms such as Vercel have no persistent disk, so uploads there need object storage; ask if you want that added.

**Domain:** point an `A`/`CNAME` record at the host, set `SITE_URL` to the final `https://` address (used for emails, canonical URLs and the sitemap).

**Backups:** `npm run db:backup` writes a compressed `pg_dump` to `backups/` and keeps 30 days. Schedule it nightly (cron) and copy dumps off the server; managed Postgres providers also offer automatic point-in-time backups. Back up the `storage/` folder (or volume) too.

**Monitoring:** `GET /api/health` returns 200 with database status. Point an uptime monitor (UptimeRobot, Better Stack) at it. Email failures appear on the admin dashboard and in the email log.

## Security summary
- Passwords hashed with bcrypt (cost 12); sessions are random tokens stored hashed, in `httpOnly`, `SameSite=Lax`, `Secure` cookies; 14-day expiry; sessions revoked on deactivate and password change.
- Role checks on every admin page, action and route; customer pages require a customer session.
- Server-side validation on every form; Next.js server actions reject cross-origin posts.
- Spam: honeypot + minimum fill time + Postgres-backed rate limits (enquiries, applications, login per IP and per account, password resets). IPs are stored only as keyed hashes.
- Uploads: images are decoded and re-encoded to WebP (metadata stripped, size-capped); PDFs are checked by signature and size; files are served from outside `public/` with strict names and `nosniff`.
- Security headers (HSTS, frame denial, nosniff, referrer and permissions policy). No secrets reach the browser.

## Scripts
| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Develop, build, run |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | New migration after editing `src/db/schema.ts` |
| `npm run db:migrate` / `db:seed` | Apply migrations / seed (re-runnable, never overwrites admin edits; `-- --force` re-applies PDF content) |
| `npm run db:backup` | Database backup |
| `npm run email:test` | Send a real test email to `ENQUIRY_TO` |

See `docs/REPOSITORY_EVALUATION.md` for how the six supplied repositories were assessed, and `CREDITS.md` for third-party licences.
