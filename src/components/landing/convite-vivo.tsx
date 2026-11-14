"use client";

import { useId, useState } from "react";
import { slugify } from "@/lib/slug";

/** O convite da capa: o visitante escreve os nomes e vê o endereço da própria lista. */
export function ConviteVivo({ dominio }: { dominio: string }) {
  const [nomes, setNomes] = useState("");
  const id = useId();
  const texto = nomes.trim() || "Ana & João";
  const partes = splitNomes(texto);
  const slug = slugify(texto) || "ana-e-joao";

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="font-display t-display w-full" aria-live="polite">
        <span className="sr-only">Lista de presentes de </span>
        <span className="block sm:-translate-x-[7%]">{partes[0]}</span>
        {partes[1] && <span className="block sm:translate-x-[7%]">{partes[1]}</span>}
      </h1>

      <ul className="t-small mt-8 flex flex-col items-center gap-2">
        <li className="t-body font-medium">Lista de presentes no Pix</li>
        <li className="tabular break-all">
          {dominio}/{slug}
        </li>
        <li aria-hidden className="diamond my-2" />
        <li>Direto na conta de vocês</li>
        <li>R$ 0 de taxa por presente</li>
      </ul>

      <label htmlFor={id} className="t-small mt-9 font-medium">
        Escreva os nomes de vocês
      </label>
      <input
        id={id}
        value={nomes}
        onChange={(e) => setNomes(e.target.value.slice(0, 40))}
        placeholder="Ana & João"
        autoComplete="off"
        className="t-body mt-2 w-full max-w-xs border-0 border-b-2 border-ink/30 bg-transparent px-2 py-2 text-center outline-none focus:border-ink"
      />
    </div>
  );
}

/** "Ana & João" -> ["Ana", "& João"]; nome único fica numa linha. */
function splitNomes(t: string): [string, string?] {
  const m = t.match(/^(.+?)\s*(&|\se\s)\s*(.+)$/i);
  if (m) return [m[1], `& ${m[3]}`];
  const words = t.split(/\s+/);
  if (words.length > 2) {
    const half = Math.ceil(words.length / 2);
    return [words.slice(0, half).join(" "), words.slice(half).join(" ")];
  }
  return [t];
}
