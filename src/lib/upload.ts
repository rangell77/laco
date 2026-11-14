"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "event-images";
const MAX_SIDE = 1600;

/** Reduz para no máx. 1600px e converte para WebP (~200 KB). */
async function compressToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao comprimir"))), "image/webp", 0.82),
  );
}

/**
 * Sobe uma imagem e devolve a URL pública.
 * Ponto único de troca: para migrar para o Cloudflare R2, muda só esta função.
 */
export async function uploadImage(file: File, eventId: string): Promise<string> {
  const blob = await compressToWebp(file);
  const path = `${eventId}/${crypto.randomUUID()}.webp`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/webp",
    cacheControl: "31536000",
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
