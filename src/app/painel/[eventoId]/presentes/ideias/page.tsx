import Link from "next/link";
import { addFromCatalog } from "@/app/actions/gifts";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";
import { requireEventAccess } from "@/lib/auth";
import { CATALOGO } from "@/lib/catalogo";
import { formatBRL } from "@/lib/money";
import { GIFT_TYPE_LABEL } from "@/lib/types";

export default async function IdeiasPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventoId: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { eventoId } = await params;
  const { erro } = await searchParams;
  const { event } = await requireEventAccess(eventoId);
  const grupos = [...new Set(CATALOGO.map((i) => i.grupo))];

  return (
    <form action={addFromCatalog} className="flex flex-col gap-6">
      <input type="hidden" name="event_id" value={event.id} />
      <div>
        <Link href={`/painel/${event.id}/presentes`} className="inline-flex min-h-11 items-center text-[0.9375rem] text-muted hover:underline">
          ← Presentes
        </Link>
        <h2 className="font-display text-5xl">Ideias prontas</h2>
        <p className="mt-2 max-w-[56ch] text-muted">
          Marque as que combinam com vocês e adicione de uma vez. Valores são sugestões: depois é só editar.
        </p>
      </div>
      <Alert erro={erro} />

      {grupos.map((g) => (
        <section key={g} className="bg-paper p-5 sm:p-6" aria-label={g}>
          <h3 className="mb-4 text-[1.25rem] font-semibold">{g}</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {CATALOGO.filter((i) => i.grupo === g).map((i) => (
              <li key={i.id}>
                <label className="press flex min-h-full cursor-pointer gap-3 bg-bg p-4 has-[:checked]:bg-accent/40">
                  <input type="checkbox" name="ideia" value={i.id} className="mt-1 size-5 shrink-0 accent-[#181715]" />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-medium">{i.titulo}</span>
                      <span className="tabular text-[0.9375rem]">
                        {i.valor ? (i.tipo === "meta" ? `meta ${formatBRL(i.valor)}` : formatBRL(i.valor)) : "valor livre"}
                      </span>
                    </span>
                    <span className="mt-1 block text-[0.9375rem] text-muted">
                      {GIFT_TYPE_LABEL[i.tipo]}
                      {i.quantidade ? ` · ${i.quantidade} cotas` : ""}. {i.descricao}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="sticky bottom-0 -mx-4 bg-bg px-4 py-3">
        <SubmitButton className="min-h-12 w-full bg-ink px-6 font-medium text-paper sm:w-auto" pendingLabel="Adicionando…">
          Adicionar as marcadas
        </SubmitButton>
      </div>
    </form>
  );
}
