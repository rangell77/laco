import Link from "next/link";
import { Alert, ButtonLink, PageTitle, Stat } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatBRL } from "@/lib/money";
import { EVENT_TYPE_LABEL, type EventRow } from "@/lib/types";

type Row = EventRow & { contributions: { status: string; valor_base_centavos: number }[] };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("events")
    .select("id, slug, tipo, titulo, data_evento, ativo, contributions(status, valor_base_centavos)")
    .order("data_evento", { ascending: true, nullsFirst: false })
    .returns<Row[]>();

  const events = data ?? [];
  const totals = events.map((e) => ({
    ...e,
    confirmado: e.contributions.filter((c) => c.status === "confirmado").reduce((s, c) => s + c.valor_base_centavos, 0),
    aguardando: e.contributions.filter((c) => c.status === "aguardando_confirmacao").length,
  }));
  const totalConfirmado = totals.reduce((s, e) => s + e.confirmado, 0);
  const totalAguardando = totals.reduce((s, e) => s + e.aguardando, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageTitle action={<ButtonLink href="/admin/eventos/novo">Novo evento</ButtonLink>}>Eventos</PageTitle>
      <Alert ok={ok} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Páginas publicadas" value={events.filter((e) => e.ativo).length} />
        <Stat label="Total confirmado" value={formatBRL(totalConfirmado)} />
        <Stat label="Aguardando confirmação" value={totalAguardando} tone={totalAguardando > 0 ? "accent" : undefined} />
      </div>

      {events.length === 0 ? (
        <div className="bg-paper p-8 sm:p-10">
          <h2 className="font-display text-5xl">Primeira lista</h2>
          <p className="mt-3 max-w-[52ch]">
            Crie o evento com os nomes, a data e o Pix dos noivos. Depois cadastre os presentes (ou use as ideias prontas),
            convide o casal e publique a página.
          </p>
          <ButtonLink href="/admin/eventos/novo" className="mt-6">
            Criar o primeiro evento
          </ButtonLink>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {totals.map((e) => (
            <li key={e.id}>
              <Link
                href={`/admin/eventos/${e.id}`}
                className="press flex flex-wrap items-center justify-between gap-3 bg-paper px-5 py-4 hover:bg-[#fafaf7]"
              >
                <div className="min-w-0">
                  <p className="t-lead font-semibold">{e.titulo}</p>
                  <p className="text-[0.9375rem] text-muted">
                    {EVENT_TYPE_LABEL[e.tipo]} · /{e.slug}
                    {e.data_evento && ` · ${new Date(e.data_evento + "T12:00:00").toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[0.9375rem]">
                  {e.aguardando > 0 && <span className="bg-accent px-2 py-0.5">{e.aguardando} aguardando</span>}
                  <span className="tabular font-medium">{formatBRL(e.confirmado)}</span>
                  <span className={`px-2 py-0.5 ${e.ativo ? "bg-[#dce8d9] text-ok" : "bg-surface text-muted"}`}>
                    {e.ativo ? "Publicada" : "Rascunho"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
