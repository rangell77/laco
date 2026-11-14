import { setContributionStatus } from "@/app/actions/gifts";
import { Button, ButtonLink, NavLink, Stat, StatusBadge } from "@/components/ui";
import { requireEventAccess } from "@/lib/auth";
import { formatBRL } from "@/lib/money";
import type { ContributionRow, ContributionStatus } from "@/lib/types";

type Row = ContributionRow & { gift_items: { titulo: string } | null };

const FILTERS: { value: ContributionStatus | "todas"; label: string }[] = [
  { value: "aguardando_confirmacao", label: "Aguardando" },
  { value: "confirmado", label: "Confirmadas" },
  { value: "recusado", label: "Não recebidas" },
  { value: "todas", label: "Todas" },
];

export default async function ContribuicoesPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventoId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { eventoId } = await params;
  const { status: statusRaw = "aguardando_confirmacao" } = await searchParams;
  const status = FILTERS.some((f) => f.value === statusRaw) ? statusRaw : "aguardando_confirmacao";
  const { supabase, event } = await requireEventAccess(eventoId);

  let query = supabase
    .from("contributions")
    .select("*, gift_items(titulo)")
    .eq("event_id", event.id)
    .neq("status", "pendente")
    .neq("status", "expirado")
    .order("criado_em", { ascending: false })
    .limit(500);
  if (status !== "todas") query = query.eq("status", status);
  const { data } = await query.returns<Row[]>();

  const { data: confirmadas } = await supabase
    .from("contributions")
    .select("valor_base_centavos")
    .eq("event_id", event.id)
    .eq("status", "confirmado");
  const total = (confirmadas ?? []).reduce((s, c) => s + c.valor_base_centavos, 0);

  const base = `/painel/${event.id}/contribuicoes`;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <Stat label="Total confirmado" value={formatBRL(total)} />
        <div className="bg-paper p-5 sm:p-6">
          <p className="font-semibold">Como confirmar</p>
          <p className="mt-1 text-[0.9375rem]">
            Procure no extrato o <b>valor exato, com os centavos</b>, e o nome de quem pagou. Bateu? Toque em{" "}
            <b>Confirmar</b>. Não caiu? Toque em <b>Não recebi</b> e o presente volta para a lista.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4" aria-label="Filtrar">
          {FILTERS.map((f) => (
            <NavLink key={f.value} href={`${base}?status=${f.value}`} active={status === f.value}>
              {f.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex gap-2">
          <ButtonLink href={`${base}/imprimir`} variant="ghost">
            Lista para agradecer (PDF)
          </ButtonLink>
          <ButtonLink href={`${base}/csv`} variant="ghost" prefetch={false}>
            Planilha CSV
          </ButtonLink>
        </div>
      </div>

      {(data ?? []).length === 0 ? (
        <p className="bg-paper p-8 text-center text-muted">Nada por aqui ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {(data ?? []).map((c) => (
            <li key={c.id} className="bg-paper p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {c.convidado_nome} <StatusBadge status={c.status} />
                  </p>
                  <p className="text-[0.9375rem] text-muted">
                    {c.gift_items?.titulo ?? "Pix livre"} · {c.metodo === "compra_externa" ? "comprou na loja" : "Pix"} ·{" "}
                    {new Date(c.pago_em ?? c.criado_em).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "America/Sao_Paulo",
                    })}
                  </p>
                  {c.convidado_contato && <p className="text-[0.9375rem] text-muted">{c.convidado_contato}</p>}
                  {c.mensagem && <p className="mt-2 max-w-[60ch] whitespace-pre-line">“{c.mensagem}”</p>}
                </div>
                <div className="text-right">
                  <p className="tabular t-lead font-semibold">{formatBRL(c.valor_cobrado_centavos)}</p>
                  {c.metodo === "pix_estatico" && <p className="text-[0.9375rem] text-muted">valor exato no extrato</p>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.status === "aguardando_confirmacao" && (
                  <>
                    <StatusForm id={c.id} eventId={event.id} acao="confirmar" filtro={status} label="Confirmar" />
                    <StatusForm id={c.id} eventId={event.id} acao="recusar" filtro={status} label="Não recebi" variant="danger" />
                  </>
                )}
                {(c.status === "confirmado" || c.status === "recusado") && (
                  <StatusForm id={c.id} eventId={event.id} acao="reabrir" filtro={status} label="Desfazer" variant="ghost" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusForm({
  id,
  eventId,
  acao,
  filtro,
  label,
  variant = "primary",
}: {
  id: string;
  eventId: string;
  acao: string;
  filtro: string;
  label: string;
  variant?: "primary" | "ghost" | "danger";
}) {
  return (
    <form action={setContributionStatus}>
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="contribution_id" value={id} />
      <input type="hidden" name="acao" value={acao} />
      <input type="hidden" name="filtro" value={filtro} />
      <Button variant={variant}>{label}</Button>
    </form>
  );
}
