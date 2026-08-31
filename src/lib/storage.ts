import { createClient } from "@supabase/supabase-js";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "urun-resimleri";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tanımlı değil. .env.local dosyasını kontrol edin.",
    );
  }

  // service role key SADECE sunucu tarafında kullanılır
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function safeFileName(name: string) {
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "jpg";
  return `${crypto.randomUUID()}.${ext}`;
}

export type UploadedImage = { url: string; path: string };

/** Ürün resmini Supabase Storage'a yükler, public URL döndürür. */
export async function uploadProductImage(productId: string, file: File): Promise<UploadedImage> {
  const supabase = getAdminClient();
  const path = `urunler/${productId}/${safeFileName(file.name)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (error) throw new Error(`Resim yüklenemedi: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteProductImage(path: string) {
  const supabase = getAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Resim silinemedi: ${error.message}`);
}
