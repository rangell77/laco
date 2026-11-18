"use client";

import { useId, useState } from "react";
import { uploadImage } from "@/lib/upload";

/** Campo de imagem: comprime, sobe e guarda a URL num input escondido. */
export function ImageUpload({
  name,
  eventId,
  defaultValue,
  label = "Imagem",
  hint,
  kind = "foto",
  onChange: onUrl,
}: {
  name: string;
  eventId?: string;
  defaultValue?: string | null;
  label?: string;
  hint?: string;
  kind?: "foto" | "logo";
  onChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "enviando" | "erro">("idle");
  const id = useId();

  if (!eventId) {
    return <p className="text-[0.9375rem] text-muted">Salve o evento primeiro para poder enviar imagens.</p>;
  }

  function set(u: string) {
    setUrl(u);
    onUrl?.(u);
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !eventId) return;
    setStatus("enviando");
    try {
      set(await uploadImage(file, eventId, kind));
      setStatus("idle");
    } catch {
      setStatus("erro");
    }
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.95rem] font-medium">{label}</span>
      <input type="hidden" name={name} value={url} />
      {url &&
        (kind === "logo" ? (
          <div className="grid h-28 w-full max-w-xs place-items-center bg-surface p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="aspect-[16/10] w-full max-w-sm object-cover" />
        ))}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="press inline-flex min-h-11 cursor-pointer items-center bg-surface px-4 text-[0.9375rem] font-medium hover:bg-[#cfcfc8]">
          {url ? "Trocar imagem" : "Escolher imagem"}
        </label>
        <input id={id} type="file" accept="image/png,image/jpeg,image/webp" onChange={onChange} className="sr-only" />
        {url && (
          <button type="button" onClick={() => set("")} className="min-h-11 px-3 text-[0.9375rem] text-danger hover:underline">
            Remover
          </button>
        )}
      </div>
      {hint && <span className="text-sm text-muted">{hint}</span>}
      <span aria-live="polite" className="text-[0.9375rem]">
        {status === "enviando" && <span className="text-muted">Enviando…</span>}
        {status === "erro" && <span className="text-danger">Não deu para enviar. Use PNG, JPG ou WebP de até 2 MB.</span>}
      </span>
    </div>
  );
}
