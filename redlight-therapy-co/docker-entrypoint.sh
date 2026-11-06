#!/bin/sh
set -e
# First boot: copy the supplied documentation PDFs into the persistent volume.
mkdir -p /data/docs /data/uploads
for f in /seed-docs/*.pdf; do [ -e "/data/docs/$(basename "$f")" ] || cp "$f" /data/docs/; done
npx tsx scripts/migrate.ts
npx tsx scripts/seed.ts
exec node server.js
