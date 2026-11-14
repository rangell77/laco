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

/** Temas da página pública: fundo, papel e tinta. O acento é a cor do evento. */
export const TEMAS = {
  classico: { label: "Clássico", fundo: "#e8e8e3", papel: "#f2f2ee", tinta: "#181715", suave: "#5f5e58" },
  jardim: { label: "Jardim", fundo: "#dde4d8", papel: "#f6f7f1", tinta: "#1b261c", suave: "#53604f" },
  praia: { label: "Praia", fundo: "#e1e8ea", papel: "#f8f8f4", tinta: "#13252a", suave: "#4f6266" },
  noite: { label: "Noite de gala", fundo: "#181715", papel: "#f4f1ea", tinta: "#181715", suave: "#5f5e58" },
} as const;

export type TemaId = keyof typeof TEMAS;

export function getTema(id: string | null | undefined) {
  return TEMAS[(id ?? "classico") as TemaId] ?? TEMAS.classico;
}
