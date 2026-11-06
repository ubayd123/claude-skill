# Cut the logo mark out of the supplied JPG onto a transparent background.
import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB").crop((535, 118, 875, 458))
im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
px = im.load(); o = Image.new("RGBA", im.size); op = o.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b = px[x, y]
        sat = max(r, g, b) - min(r, g, b)
        a = max(0.0, min(1.0, (sat - 18) / 70))
        if a <= 0: op[x, y] = (0, 0, 0, 0); continue
        # un-blend from the light background
        bg = 238
        c = [max(0, min(255, int((v - (1 - a) * bg) / a))) for v in (r, g, b)]
        op[x, y] = (*c, int(a * 255))
o = o.crop(o.getbbox()); o.save(out)
print(o.size)
