"use client";

import { useId, useState } from "react";
import { uploadImage } from "@/lib/upload";

/** Campo de imagem: comprime, sobe e guarda a URL num input escondido. */
export function ImageUpload({
  name,
  eventId,
  defaultValue,
  label = "Imagem",
}: {
  name: string;
  eventId?: string;
  defaultValue?: string | null;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "enviando" | "erro">("idle");
  const id = useId();

  if (!eventId) {
    return <p className="text-[0.9375rem] text-muted">Salve o evento primeiro para poder enviar imagens.</p>;
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !eventId) return;
    setStatus("enviando");
    try {
      setUrl(await uploadImage(file, eventId));
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
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="aspect-[16/10] w-full max-w-sm object-cover" />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={id} className="press inline-flex min-h-11 cursor-pointer items-center bg-surface px-4 text-[0.9375rem] font-medium hover:bg-[#cfcfc8]">
          {url ? "Trocar imagem" : "Escolher imagem"}
        </label>
        <input id={id} type="file" accept="image/*" onChange={onChange} className="sr-only" />
        {url && (
          <button type="button" onClick={() => setUrl("")} className="min-h-11 px-3 text-[0.9375rem] text-danger hover:underline">
            Remover
          </button>
        )}
      </div>
      <span aria-live="polite" className="text-[0.9375rem]">
        {status === "enviando" && <span className="text-muted">Enviando…</span>}
        {status === "erro" && <span className="text-danger">Falha no envio. Tente outra imagem.</span>}
      </span>
    </div>
  );
}
