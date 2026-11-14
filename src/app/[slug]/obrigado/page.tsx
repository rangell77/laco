import Link from "next/link";
import { notFound } from "next/navigation";
import { Monogram } from "@/components/ui";
import { readableOn } from "@/lib/color";
import { getPublicEvent } from "@/lib/public-event";

export default async function ObrigadoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { slug } = await params;
  const { tipo } = await searchParams;
  const event = await getPublicEvent(slug);
  if (!event) notFound();

  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-md flex-col justify-center px-3 pt-10">
      {/* O cartão-resposta */}
      <article className="card-scallop rise rotate-1 px-7 py-12 text-center sm:px-10">
        <Monogram className="mx-auto h-9 w-14" />
        <h1 className="font-display t-head mt-5">Muito obrigado</h1>
        <p className="mt-4">
          {tipo === "loja"
            ? "Registramos o seu presente. Os anfitriões vão adorar."
            : "Recebemos o seu aviso. Assim que os anfitriões conferirem o Pix no extrato, o presente fica registrado com o seu nome."}
        </p>
        <Link
          href={`/${slug}`}
          className="press mt-8 flex min-h-12 w-full items-center justify-center font-medium"
          style={{ background: "var(--cor)", color: readableOn(event.cor_principal) }}
        >
          Voltar para a lista
        </Link>
      </article>
    </main>
  );
}
