// One-off asset preparation: product photos from the catalogue PDF -> optimised WebP,
// and the supplied logo -> transparent PNGs. Run: node scripts/prepare-assets.mjs <srcDir> <logoJpg>
import sharp from "sharp";
import path from "node:path";
const [src, logo] = process.argv.slice(2);
const map = { "img-001.png": "300-led-panel", "img-002.png": "100-led-panel", "img-003.png": "hair-cap", "img-004.png": "knee-strap", "img-005.png": "face-mask", "img-006.png": "starter-face-mask" };
for (const [f, slug] of Object.entries(map)) {
  await sharp(path.join(src, f)).webp({ quality: 86 }).toFile(`public/images/products/${slug}.webp`);
}
// Logo: knock out the off-white background to alpha.
async function knockout(input, out, extract) {
  let img = sharp(input);
  if (extract) img = img.extract(extract);
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const min = Math.min(r, g, b);
    const sat = Math.max(r, g, b) - min;
    if (min > 200 && sat < 25) { const a = Math.max(0, Math.min(255, (255 - min) * 255 / 55)); data[i + 3] = Math.round(a); }
  }
  await sharp(data, { raw: info }).trim().png().toFile(out);
}
await knockout(logo, "public/brand/logo-full.png");
await knockout(logo, "public/brand/logo-mark.png", { left: 530, top: 115, width: 345, height: 345 });
console.log("done");
