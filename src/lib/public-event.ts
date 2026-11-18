import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_EVENT_COLUMNS, type EventRow, type GiftItemRow, type GiftProgress } from "@/lib/types";

/**
 * Evento pelo slug. Quem decide o que aparece é a RLS:
 * visitante só vê eventos publicados; admin e o casal veem também o rascunho (prévia).
 */
export const getPublicEvent = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select(PUBLIC_EVENT_COLUMNS).eq("slug", slug).maybeSingle<EventRow>();
  return data;
});

export async function getPublicGifts(eventId: string) {
  const supabase = await createClient();
  const [{ data: items }, { data: progress }] = await Promise.all([
    supabase
      .from("gift_items")
      .select("id, event_id, tipo, titulo, descricao, imagem_url, valor_centavos, quantidade, url_externa, ordem")
      .eq("event_id", eventId)
      .eq("ativo", true) // admin/membro logado também enxerga ocultos via RLS; a página pública não
      .order("ordem")
      .order("criado_em")
      .returns<GiftItemRow[]>(),
    supabase.rpc("event_gift_progress", { p_event_id: eventId }),
  ]);
  const byItem = new Map(((progress ?? []) as GiftProgress[]).map((p) => [p.gift_item_id, p]));
  return (items ?? []).map((item) => {
    const p = byItem.get(item.id);
    const esgotado = item.quantidade != null && (p?.reservas ?? 0) >= item.quantidade;
    return { item, progress: p, esgotado };
  });
}
