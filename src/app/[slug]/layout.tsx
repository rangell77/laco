import Link from "next/link";
import { notFound } from "next/navigation";
import { Monogram } from "@/components/ui";
import { BRAND, resolvePaleta } from "@/lib/brand";
import { getPublicEvent } from "@/lib/public-event";

/** Aplica a paleta do evento (cores próprias ou do tema) em todas as páginas públicas dele. */
export default async function PublicEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) notFound();
  const p = resolvePaleta(event);
  const vars = {
    "--bg": p.fundo,
    "--paper": p.papel,
    "--ink": p.tinta,
    "--muted": p.suave,
    "--cor": p.destaque,
    "--accent": p.destaque,
    "--cor-texto": p.textoDestaque,
    "--ground-ink": p.tintaFundo,
    "--ground-muted": p.suaveFundo,
  } as React.CSSProperties;

  return (
    <div className="min-h-dvh bg-bg text-ink" style={vars}>
      {!event.ativo && (
        <p className="sticky top-0 z-30 bg-accent px-4 py-2.5 text-center text-[0.9375rem] font-medium text-[var(--cor-texto)]">
          Prévia do rascunho: só quem tem acesso ao painel vê esta página. O Pix só funciona depois de publicar.
        </p>
      )}
      {children}
      <footer className="on-ground px-4 pb-10 pt-20 text-center">
        <p className="t-small mx-auto max-w-[44ch] text-muted">
          Seu nome e seu recado são compartilhados apenas com os anfitriões. O Pix vai direto para a conta deles.
        </p>
        <Link href="/" className="t-small mt-5 inline-flex items-center gap-2 text-muted hover:underline">
          <Monogram className="h-5 w-8" /> Lista feita com {BRAND.nome}
        </Link>
      </footer>
    </div>
  );
}
