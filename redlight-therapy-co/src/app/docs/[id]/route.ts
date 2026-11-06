import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { readDoc } from "@/lib/uploads";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const docId = Number(id);
  if (!Number.isInteger(docId) || docId <= 0) return new Response("Not found", { status: 404 });
  const rows = await db.select().from(schema.productDocuments).where(eq(schema.productDocuments.id, docId)).limit(1);
  const doc = rows[0];
  if (!doc) return new Response("Not found", { status: 404 });
  if (doc.visibility === "customers") {
    const user = await getCurrentUser();
    if (!user) return new Response("Sign in with an approved wholesale account to download this document.", { status: 401 });
  }
  const file = await readDoc(doc.fileName);
  if (!file) return new Response("Not found", { status: 404 });
  const safeName = `${doc.title.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "document"}.pdf`;
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeName}"`,
      "Cache-Control": doc.visibility === "public" ? "public, max-age=3600" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
