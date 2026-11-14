import { PrintButton } from "@/components/print-button";
import { requireEventAccess } from "@/lib/auth";
import { formatBRL } from "@/lib/money";
import type { ContributionRow } from "@/lib/types";

type Row = ContributionRow & { gift_items: { titulo: string } | null };

/** Lista de agradecimentos pronta para imprimir ou salvar em PDF. */
export default async function ImprimirPage({ params }: { params: Promise<{ eventoId: string }> }) {
  const { eventoId } = await params;
  const { supabase, event } = await requireEventAccess(eventoId);
  const { data } = await supabase
    .from("contributions")
    .select("*, gift_items(titulo)")
    .eq("event_id", event.id)
    .eq("status", "confirmado")
    .order("convidado_nome")
    .returns<Row[]>();
  const rows = data ?? [];
  const total = rows.reduce((s, c) => s + c.valor_base_centavos, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">Só presentes confirmados, em ordem alfabética.</p>
        <PrintButton />
      </div>

      <article className="bg-paper px-6 py-10 sm:px-12 print:p-0">
        <h2 className="font-display text-center text-6xl">{event.titulo}</h2>
        <p className="mt-2 text-center text-muted">
          Presentes recebidos · {rows.length} {rows.length === 1 ? "convidado" : "convidados"} · {formatBRL(total)}
        </p>
        {rows.length === 0 ? (
          <p className="mt-10 text-center text-muted">Nenhum presente confirmado ainda.</p>
        ) : (
          <table className="mt-10 w-full border-collapse text-left text-[0.9375rem]">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="py-2 pr-3 font-semibold">Convidado</th>
                <th className="py-2 pr-3 font-semibold">Presente</th>
                <th className="py-2 pr-3 font-semibold">Recado</th>
                <th className="py-2 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="break-inside-avoid border-b border-ink/15 align-top">
                  <td className="py-3 pr-3 font-medium">
                    {c.convidado_nome}
                    {c.convidado_contato && <span className="block font-normal text-muted">{c.convidado_contato}</span>}
                  </td>
                  <td className="py-3 pr-3">{c.gift_items?.titulo ?? "Pix livre"}</td>
                  <td className="py-3 pr-3 italic">{c.mensagem ?? ""}</td>
                  <td className="tabular py-3 text-right">{formatBRL(c.valor_base_centavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </div>
  );
}
