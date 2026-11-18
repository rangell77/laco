"use client";

import { useId, useState } from "react";
import { resolvePaleta, TEMAS, type TemaId } from "@/lib/brand";
import { contrast } from "@/lib/color";

type Props = {
  tema: string;
  corFundo: string | null;
  corPapel: string | null;
  corPrincipal: string;
  titulo: string;
  logoUrl?: string | null;
};

/** Paleta do evento: parte de um tema e ajusta fundo, cartão e destaque, com prévia e alerta de leitura. */
export function PaletaEditor(p: Props) {
  const inicial = resolvePaleta({ tema: p.tema, cor_fundo: p.corFundo, cor_papel: p.corPapel, cor_principal: p.corPrincipal });
  const [tema, setTema] = useState(p.tema in TEMAS ? p.tema : "classico");
  const [fundo, setFundo] = useState(inicial.fundo);
  const [papel, setPapel] = useState(inicial.papel);
  const [destaque, setDestaque] = useState(inicial.destaque);
  const pal = resolvePaleta({ tema, cor_fundo: fundo, cor_papel: papel, cor_principal: destaque });

  const avisos: string[] = [];
  if (contrast(fundo, papel) < 1.08) avisos.push("Fundo e cartão estão quase iguais: o convite perde o contorno.");
  if (contrast(destaque, papel) < 2.2) avisos.push("A cor de destaque está fraca sobre o cartão: botões e centavos ficam apagados.");

  function aplicarTema(id: TemaId) {
    const t = TEMAS[id];
    setTema(id);
    setFundo(t.fundo);
    setPapel(t.papel);
    setDestaque(t.destaque);
  }

  return (
    <div className="flex flex-col gap-5">
      <input type="hidden" name="tema" value={tema} />
      <input type="hidden" name="cor_fundo" value={fundo} />
      <input type="hidden" name="cor_papel" value={papel} />
      <input type="hidden" name="cor_principal" value={destaque} />

      <div>
        <p className="text-[0.95rem] font-medium">Comece por um tema</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(Object.keys(TEMAS) as TemaId[]).map((id) => {
            const t = TEMAS[id];
            const ativo = tema === id && fundo === t.fundo && papel === t.papel && destaque === t.destaque;
            return (
              <button
                key={id}
                type="button"
                onClick={() => aplicarTema(id)}
                aria-pressed={ativo}
                className={`press flex flex-col gap-1.5 p-1.5 text-left text-[0.875rem] ${ativo ? "bg-ink text-paper" : "bg-bg"}`}
              >
                <span className="grid h-12 place-items-center" style={{ background: t.fundo }}>
                  <span className="flex h-8 w-6 items-end justify-center pb-1" style={{ background: t.papel }}>
                    <span className="h-1.5 w-3.5" style={{ background: t.destaque }} />
                  </span>
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,300px)]">
        <div className="grid content-start gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Cor label="Fundo da página" value={fundo} onChange={setFundo} />
          <Cor label="Cartão do convite" value={papel} onChange={setPapel} />
          <Cor label="Destaque" hint="Botões, metas e centavos do Pix" value={destaque} onChange={setDestaque} />
        </div>

        {/* Prévia em miniatura */}
        <div className="p-5" style={{ background: pal.fundo }} aria-label="Prévia das cores">
          <div className="card-scallop px-5 py-7 text-center" style={{ background: pal.papel, color: pal.tinta, ["--r" as string]: "14px" }}>
            {p.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.logoUrl} alt="" className="mx-auto mb-3 max-h-10 w-auto" />
            )}
            <p className="font-display text-4xl">{p.titulo || "Ana & João"}</p>
            <p className="mt-2 text-[0.875rem]" style={{ color: pal.suave }}>
              17 de abril · 16h30
            </p>
            <p className="mt-4 inline-block px-4 py-2 text-[0.875rem] font-medium" style={{ background: pal.destaque, color: pal.textoDestaque }}>
              Presentear
            </p>
          </div>
          <p className="mt-3 text-center text-[0.875rem]" style={{ color: pal.suaveFundo }}>
            Texto sobre o fundo
          </p>
        </div>
      </div>

      {avisos.length > 0 && (
        <ul className="flex flex-col gap-1 bg-accent/30 px-4 py-3 text-[0.9375rem]" role="status">
          {avisos.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Cor({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.95rem] font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer border-0 bg-transparent p-0" />
        <input
          aria-label={`${label} em hexadecimal`}
          value={value}
          onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)}
          className="tabular w-28 border-0 border-b-2 border-ink/25 bg-paper px-2 py-2 text-base uppercase outline-none focus:border-ink"
          maxLength={7}
        />
      </div>
      {hint && <span className="text-sm text-muted">{hint}</span>}
    </div>
  );
}
