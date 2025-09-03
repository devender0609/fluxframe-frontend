import fs from "fs";
import path from "path";
import sharp from "sharp";

const cwd = process.cwd();
const src = path.join(cwd, "public", "logo-fluxframe-mark.svg");
const outPublic = path.join(cwd, "public");
const outIcons = path.join(outPublic, "icons");

if (!fs.existsSync(src)) {
  console.error("Missing source SVG:", src);
  process.exit(1);
}
fs.mkdirSync(outPublic, { recursive: true });
fs.mkdirSync(outIcons, { recursive: true });

const bg = { r: 11, g: 15, b: 23, alpha: 1 }; // #0b0f17

async function makePng(w, h, out) {
  await sharp(src).resize(w, h, { fit: "contain", background: bg }).png().toFile(out);
  console.log("?", path.relative(cwd, out));
}

(async () => {
  try {
    // Manifest icons
    await makePng(192, 192, path.join(outIcons, "icon-192.png"));
    await makePng(512, 512, path.join(outIcons, "icon-512.png"));

    // Maskable (full-bleed)
    await sharp(src)
      .resize(512, 512, { fit: "cover", position: "centre", background: bg })
      .png()
      .toFile(path.join(outIcons, "maskable-512.png"));
    console.log("?", path.join("public", "icons", "maskable-512.png"));

    // Apple touch (180)
    await makePng(180, 180, path.join(outPublic, "apple-touch-icon.png"));

    // Favicons
    await makePng(32, 32, path.join(outPublic, "favicon-32.png"));
    await makePng(16, 16, path.join(outPublic, "favicon-16.png"));

    console.log("\nAll icons generated.");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
