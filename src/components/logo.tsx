import Image from "next/image";
import { logoBilgisi } from "@/lib/logo";

/**
 * Logo dosyası public/ klasörüne eklenmişse onu, eklenmemişse "M" rozetini gösterir.
 * `yukseklik` piksel cinsinden görüntülenecek yüksekliktir; genişlik orana göre hesaplanır.
 */
export default function Logo({
  yukseklik = 36,
  className = "",
}: {
  yukseklik?: number;
  className?: string;
}) {
  const logo = logoBilgisi();

  if (!logo) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-sky-600 font-bold text-white ${className}`}
        style={{ width: yukseklik, height: yukseklik }}
      >
        M
      </div>
    );
  }

  const genislik = Math.round((logo.genislik / logo.yukseklik) * yukseklik);

  return (
    <Image
      src={logo.src}
      alt="Mikro Sızdırmazlık"
      width={genislik}
      height={yukseklik}
      className={className}
      style={{ height: yukseklik, width: "auto" }}
      priority
    />
  );
}
