import Link from "next/link";
import { notFound } from "next/navigation";
import { Monogram } from "@/components/ui";
import { BRAND, getTema } from "@/lib/brand";
import { getPublicEvent } from "@/lib/public-event";

/** Aplica o tema e a cor do evento em todas as páginas públicas dele. */
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
  const t = getTema(event.tema);
  const vars = {
    "--bg": t.fundo,
    "--paper": t.papel,
    "--ink": t.tinta,
    "--muted": t.suave,
    "--cor": event.cor_principal,
    "--accent": event.cor_principal,
  } as React.CSSProperties;

  return (
    <div className="min-h-dvh bg-bg text-ink" style={vars} data-tema={event.tema}>
      {children}
      <footer className={`px-4 pb-10 pt-20 text-center ${event.tema === "noite" ? "text-[#c9c6bd]" : "text-muted"}`}>
        <p className="t-small mx-auto max-w-[44ch]">
          Seu nome e seu recado são compartilhados apenas com os anfitriões. O Pix vai direto para a conta deles.
        </p>
        <Link href="/" className="t-small mt-5 inline-flex items-center gap-2 hover:underline">
          <Monogram className="h-5 w-8" /> Lista feita com {BRAND.nome}
        </Link>
      </footer>
    </div>
  );
}
