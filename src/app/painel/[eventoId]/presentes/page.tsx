import Link from "next/link";
import { deleteGift } from "@/app/actions/gifts";
import { Alert, Button, ButtonLink } from "@/components/ui";
import { requireEventAccess } from "@/lib/auth";
import { formatBRL } from "@/lib/money";
import { GIFT_TYPE_LABEL, type GiftItemRow, type GiftProgress } from "@/lib/types";

export default async function PresentesPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventoId: string }>;
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const { eventoId } = await params;
  const { ok, erro } = await searchParams;
  const { supabase, event } = await requireEventAccess(eventoId);

  const [{ data: gifts }, { data: progress }] = await Promise.all([
    supabase.from("gift_items").select("*").eq("event_id", event.id).order("ordem").order("criado_em").returns<GiftItemRow[]>(),
    supabase.rpc("event_gift_progress", { p_event_id: event.id }),
  ]);
  const byItem = new Map(((progress ?? []) as GiftProgress[]).map((p) => [p.gift_item_id, p]));
  const lista = gifts ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">{lista.length} presentes cadastrados</p>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/painel/${event.id}/presentes/ideias`} variant="ghost">
            Ideias prontas
          </ButtonLink>
          <ButtonLink href={`/painel/${event.id}/presentes/novo`}>Adicionar presente</ButtonLink>
        </div>
      </div>
      <Alert ok={ok} erro={erro} />

      {lista.length === 0 ? (
        <div className="bg-paper p-8 sm:p-10">
          <h2 className="font-display text-5xl">Lista vazia</h2>
          <p className="mt-3 max-w-[52ch]">
            Comece pelas ideias prontas: cotas da lua de mel, metas para a casa nova e um Pix de valor livre. Dá para
            editar valores e fotos depois.
          </p>
          <ButtonLink href={`/painel/${event.id}/presentes/ideias`} className="mt-6">
            Ver as ideias prontas
          </ButtonLink>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {lista.map((g) => {
            const p = byItem.get(g.id);
            return (
              <li key={g.id} className={`flex flex-wrap items-center gap-4 bg-paper p-3 sm:p-4 ${g.ativo === false ? "opacity-60" : ""}`}>
                {g.imagem_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.imagem_url} alt="" className="h-16 w-16 object-cover" />
                ) : (
                  <div className="grid h-16 w-16 place-items-center bg-surface font-display text-3xl">{g.titulo.charAt(0)}</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {g.titulo} {g.ativo === false && <span className="text-[0.9375rem] font-normal text-muted">(oculto)</span>}
                  </p>
                  <p className="text-[0.9375rem] text-muted">
                    {GIFT_TYPE_LABEL[g.tipo]}
                    {g.valor_centavos != null && ` · ${formatBRL(g.valor_centavos)}`}
                    {p && p.reservas > 0 && ` · ${p.reservas} presenteado(s)`}
                    {g.tipo === "meta" && p && ` · ${formatBRL(p.confirmado_centavos)} confirmado`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/painel/${event.id}/presentes/${g.id}`} className="press inline-flex min-h-11 items-center bg-surface px-4 text-[0.9375rem] hover:bg-[#cfcfc8]">
                    Editar
                  </Link>
                  <form action={deleteGift}>
                    <input type="hidden" name="event_id" value={event.id} />
                    <input type="hidden" name="gift_id" value={g.id} />
                    <Button variant="danger">Excluir</Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
