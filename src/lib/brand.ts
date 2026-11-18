import { readableOn } from "@/lib/color";

/**
 * Marca do produto. Ponto único de troca do nome, domínio e contato.
 * NOME PROVISÓRIO: "Laço" (decisão pendente nº 1 do PLANO.md).
 */
export const BRAND = {
  nome: "Laço",
  frase: "Lista de presentes no Pix, direto na conta de quem celebra.",
  /** Domínio exibido nos exemplos (sem https://). */
  dominio: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://laco.app").replace(/^https?:\/\//, "").replace(/\/$/, ""),
  /** Como o celebrante é chamado nas frases ("o celebrante", "o Rubinho"...). */
  celebrante: process.env.NEXT_PUBLIC_CELEBRANTE_NOME ?? "o celebrante",
  /** Só dígitos, com DDI. Ex.: 5511999999999 */
  whatsapp: (process.env.NEXT_PUBLIC_CONTATO_WHATSAPP ?? "").replace(/\D/g, ""),
  email: process.env.NEXT_PUBLIC_CONTATO_EMAIL ?? "",
};

export function whatsappLink(texto: string) {
  const base = BRAND.whatsapp ? `https://wa.me/${BRAND.whatsapp}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(texto)}`;
}

/** Temas: pontos de partida da paleta (fundo, papel e destaque sugeridos). */
export const TEMAS = {
  classico: { label: "Clássico", fundo: "#e8e8e3", papel: "#f2f2ee", destaque: "#9c6b3f" },
  jardim: { label: "Jardim", fundo: "#dde4d8", papel: "#f6f7f1", destaque: "#4f6b45" },
  praia: { label: "Praia", fundo: "#e1e8ea", papel: "#f8f8f4", destaque: "#2f6f80" },
  noite: { label: "Noite de gala", fundo: "#181715", papel: "#f4f1ea", destaque: "#c4a032" },
  rose: { label: "Rosé", fundo: "#efe4e1", papel: "#fbf7f5", destaque: "#a24d5e" },
  lavanda: { label: "Lavanda", fundo: "#e6e3ee", papel: "#f8f7fb", destaque: "#6a5a8c" },
} as const;

export type TemaId = keyof typeof TEMAS;

export function getTema(id: string | null | undefined) {
  return TEMAS[(id ?? "classico") as TemaId] ?? TEMAS.classico;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Paleta final do evento: cores próprias quando definidas, senão as do tema.
 * Tinta e textos suaves são calculados para manter a leitura em qualquer cor.
 */
export function resolvePaleta(e: { tema: string; cor_fundo?: string | null; cor_papel?: string | null; cor_principal: string }) {
  const t = getTema(e.tema);
  const fundo = e.cor_fundo && HEX.test(e.cor_fundo) ? e.cor_fundo : t.fundo;
  const papel = e.cor_papel && HEX.test(e.cor_papel) ? e.cor_papel : t.papel;
  const destaque = HEX.test(e.cor_principal) ? e.cor_principal : t.destaque;
  const tinta = readableOn(papel);
  const tintaFundo = readableOn(fundo);
  return {
    fundo,
    papel,
    destaque,
    tinta,
    suave: mix(tinta, papel, 0.68),
    tintaFundo,
    suaveFundo: mix(tintaFundo, fundo, 0.72),
    textoDestaque: readableOn(destaque),
  };
}

/** Mistura duas cores hex (peso de `a`). */
function mix(a: string, b: string, w: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * w + ((pb >> s) & 255) * (1 - w));
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")}`;
}
