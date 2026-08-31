import fs from "node:fs";
import path from "node:path";

/** public/ içinde aranan logo dosyaları — ilk bulunan kullanılır */
const ADAYLAR = ["logo.svg", "logo.png", "logo.webp", "logo.jpg", "logo.jpeg"];

export type LogoBilgisi = {
  src: string;
  genislik: number;
  yukseklik: number;
};

/** PNG başlığındaki IHDR bloğundan gerçek ölçüleri okur. */
function pngOlculeri(dosya: string): { genislik: number; yukseklik: number } | null {
  try {
    const fd = fs.openSync(dosya, "r");
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    fs.closeSync(fd);
    if (buf.toString("ascii", 1, 4) !== "PNG") return null;
    return { genislik: buf.readUInt32BE(16), yukseklik: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}

/** SVG'de viewBox veya width/height özniteliğinden oran çıkarır. */
function svgOlculeri(dosya: string): { genislik: number; yukseklik: number } | null {
  try {
    const icerik = fs.readFileSync(dosya, "utf-8").slice(0, 2000);
    const viewBox = icerik.match(/viewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i);
    if (viewBox) {
      return { genislik: Math.round(Number(viewBox[1])), yukseklik: Math.round(Number(viewBox[2])) };
    }
    const w = icerik.match(/\bwidth\s*=\s*["']([\d.]+)/i);
    const h = icerik.match(/\bheight\s*=\s*["']([\d.]+)/i);
    if (w && h) return { genislik: Math.round(Number(w[1])), yukseklik: Math.round(Number(h[1])) };
    return null;
  } catch {
    return null;
  }
}

/**
 * Logo dosyası eklenmişse yolunu ve gerçek en/boy oranını döndürür, yoksa null.
 * Ölçü okunamazsa 4:1 varsayılır (yatay logo).
 */
export function logoBilgisi(): LogoBilgisi | null {
  for (const ad of ADAYLAR) {
    const dosya = path.join(process.cwd(), "public", ad);
    if (!fs.existsSync(dosya)) continue;

    const olcu = ad.endsWith(".svg") ? svgOlculeri(dosya) : pngOlculeri(dosya);
    return {
      src: `/${ad}`,
      genislik: olcu?.genislik ?? 400,
      yukseklik: olcu?.yukseklik ?? 100,
    };
  }
  return null;
}
