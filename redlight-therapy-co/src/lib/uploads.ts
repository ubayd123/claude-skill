import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const STORAGE_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), "storage");
const UPLOADS = path.join(STORAGE_DIR, "uploads");
export const DOCS = path.join(STORAGE_DIR, "docs");

const MAX_IMAGE = 12 * 1024 * 1024;
const MAX_PDF = 25 * 1024 * 1024;

export class UploadError extends Error {}

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
  await mkdir(UPLOADS, { recursive: true });
  const name = `${randomUUID()}.webp`;
  await writeFile(path.join(UPLOADS, name), output);
  return `/media/${name}`;
}

export async function savePdf(file: File) {
  if (file.size === 0) throw new UploadError("The PDF is empty.");
  if (file.size > MAX_PDF) throw new UploadError("PDFs must be 25 MB or smaller.");
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new UploadError("That file is not a PDF.");
  await mkdir(DOCS, { recursive: true });
  const name = `${randomUUID()}.pdf`;
  await writeFile(path.join(DOCS, name), buf);
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
