/** "Ana & João" -> "ana-e-joao" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Rotas internas que não podem virar slug de evento. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "painel",
  "login",
  "auth",
  "api",
  "definir-senha",
  "_next",
  "favicon-ico",
  "privacidade",
  "termos",
  "landing",
  "robots-txt",
  "sitemap-xml",
]);
