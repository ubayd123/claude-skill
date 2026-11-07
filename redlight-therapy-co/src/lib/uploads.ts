import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { put } from "@vercel/blob";

export const STORAGE_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), "storage");
const UPLOADS = path.join(STORAGE_DIR, "uploads");
export const DOCS = path.join(STORAGE_DIR, "docs");

const MAX_IMAGE = 12 * 1024 * 1024;
const MAX_PDF = 25 * 1024 * 1024;

export class UploadError extends Error {}

/**
 * On hosts without a persistent disk (Vercel), uploads go to Vercel Blob when
 * BLOB_READ_WRITE_TOKEN is set. Otherwise they are written to STORAGE_DIR.
 */
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const BLOB_HOST = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//;
export const isBlobUrl = (v: string) => BLOB_HOST.test(v);

function noDiskError(err: unknown): never {
  const code = typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "";
  if (code === "EROFS" || code === "EACCES") {
    throw new UploadError("This server has no permanent file storage. Connect Vercel Blob storage (see README) to enable uploads.");
  }
  throw err;
}

/** Decode with sharp (rejects anything that is not a real image), strip metadata, re-encode to WebP. */
export async function saveImage(file: File) {
  if (file.size === 0) throw new UploadError("The image is empty.");
  if (file.size > MAX_IMAGE) throw new UploadError("Images must be 12 MB or smaller.");
  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    const meta = await sharp(input).metadata();
    if (!meta.format || !["jpeg", "png", "webp", "avif", "gif", "tiff"].includes(meta.format)) throw new Error();
    output = await sharp(input).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
  } catch {
    throw new UploadError("That file is not a supported image (JPEG, PNG, WebP or AVIF).");
  }
  const name = `${randomUUID()}.webp`;
  if (useBlob()) {
    const blob = await put(`media/${name}`, output, { access: "public", contentType: "image/webp" });
    return blob.url;
  }
  try {
    await mkdir(UPLOADS, { recursive: true });
    await writeFile(path.join(UPLOADS, name), output);
  } catch (err) {
    noDiskError(err);
  }
  return `/media/${name}`;
}

export async function savePdf(file: File) {
  if (file.size === 0) throw new UploadError("The PDF is empty.");
  if (file.size > MAX_PDF) throw new UploadError("PDFs must be 25 MB or smaller.");
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new UploadError("That file is not a PDF.");
  const name = `${randomUUID()}.pdf`;
  if (useBlob()) {
    // Random suffix keeps the URL unguessable; downloads are still served through /docs/[id],
    // which enforces customers-only visibility before fetching the file.
    const blob = await put(`docs/${name}`, buf, { access: "public", contentType: "application/pdf", addRandomSuffix: true });
    return blob.url;
  }
  try {
    await mkdir(DOCS, { recursive: true });
    await writeFile(path.join(DOCS, name), buf);
  } catch (err) {
    noDiskError(err);
  }
  return name;
}

const MEDIA_NAME = /^[0-9a-f-]{36}\.webp$/;
const DOC_NAME = /^[a-z0-9][a-z0-9-]*\.pdf$/;

export async function readMedia(name: string) {
  if (!MEDIA_NAME.test(name)) return null;
  try {
    return await readFile(path.join(UPLOADS, name));
  } catch {
    return null;
  }
}

export async function readDoc(name: string) {
  if (isBlobUrl(name)) {
    const res = await fetch(name, { signal: AbortSignal.timeout(20_000) });
    return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
  }
  if (!DOC_NAME.test(name)) return null;
  try {
    return await readFile(path.join(DOCS, name));
  } catch {
    return null;
  }
}

export async function removeUpload(publicPath: string) {
  const name = publicPath.replace(/^\/media\//, "");
  if (MEDIA_NAME.test(name)) await unlink(path.join(UPLOADS, name)).catch(() => undefined);
}

export function isFile(v: FormDataEntryValue | null): v is File {
  return typeof v === "object" && v !== null && "arrayBuffer" in v && (v as File).size > 0;
}
