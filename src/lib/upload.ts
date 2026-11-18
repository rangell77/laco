"use client";

import { createClient } from "@/lib/supabase/client";

const BUCKET = "event-images";

/** Reduz o lado maior (1600px fotos, 800px logos) e converte para WebP, mantendo transparência. */
async function compressToWebp(file: File, maxSide: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao comprimir"))), "image/webp", quality),
  );
}

/**
 * Sobe uma imagem e devolve a URL pública.
 * Ponto único de troca: para migrar para o Cloudflare R2, muda só esta função.
 */
export async function uploadImage(file: File, eventId: string, kind: "foto" | "logo" = "foto"): Promise<string> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Use PNG, JPG ou WebP.");
  const blob = await compressToWebp(file, kind === "logo" ? 800 : 1600, kind === "logo" ? 0.9 : 0.82);
  const path = `${eventId}/${crypto.randomUUID()}.webp`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/webp",
    cacheControl: "31536000",
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
