"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEventAccess } from "@/lib/auth";
import { CATALOGO } from "@/lib/catalogo";
import { parseBRL } from "@/lib/money";
import type { GiftType } from "@/lib/types";

const q = encodeURIComponent;
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const GIFT_TYPES: GiftType[] = ["link", "cota", "meta", "pix_livre"];

function readGift(fd: FormData): { data?: Record<string, unknown>; erro?: string } {
  const tipo = str(fd, "tipo") as GiftType;
  if (!GIFT_TYPES.includes(tipo)) return { erro: "Tipo de presente inválido." };
  const titulo = str(fd, "titulo");
  if (!titulo) return { erro: "Informe o nome do presente." };

  const valorRaw = str(fd, "valor");
  const valor = valorRaw ? parseBRL(valorRaw) : null;
  if ((tipo === "cota" || tipo === "meta") && !valor) return { erro: "Informe o valor." };

  const url = str(fd, "url_externa");
  if (tipo === "link" && !/^https?:\/\//i.test(url)) return { erro: "Informe o link do produto (começando com https://)." };

  const qtdRaw = str(fd, "quantidade");
  const quantidade = qtdRaw ? Math.max(1, parseInt(qtdRaw, 10) || 1) : tipo === "link" ? 1 : null;

  return {
    data: {
      tipo,
      titulo,
      descricao: str(fd, "descricao") || null,
      // Só imagens do nosso bucket (evita links externos ou "javascript:")
      imagem_url: str(fd, "imagem_url").startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-images/`)
        ? str(fd, "imagem_url")
        : null,
      valor_centavos: tipo === "pix_livre" ? null : valor,
      quantidade: tipo === "meta" || tipo === "pix_livre" ? null : quantidade,
      url_externa: tipo === "link" ? url : null,
      ordem: parseInt(str(fd, "ordem"), 10) || 0,
      ativo: str(fd, "ativo") !== "false",
    },
  };
}

export async function saveGift(fd: FormData) {
  const eventId = str(fd, "event_id");
  const giftId = str(fd, "gift_id");
  const base = `/painel/${eventId}/presentes`;
  const { supabase } = await requireEventAccess(eventId);

  const { data, erro } = readGift(fd);
  if (erro || !data) redirect(`${base}/${giftId || "novo"}?erro=${q(erro ?? "Dados inválidos.")}`);

  const { error } = giftId
    ? await supabase.from("gift_items").update(data).eq("id", giftId).eq("event_id", eventId)
    : await supabase.from("gift_items").insert({ ...data, event_id: eventId });

  if (error) redirect(`${base}/${giftId || "novo"}?erro=${q("Não foi possível salvar o presente.")}`);
  revalidatePath("/", "layout");
  redirect(`${base}?ok=${q("Presente salvo.")}`);
}

/** Adiciona ideias do catálogo (uma ou várias) à lista do evento. */
export async function addFromCatalog(fd: FormData) {
  const eventId = str(fd, "event_id");
  const base = `/painel/${eventId}/presentes`;
  const { supabase } = await requireEventAccess(eventId);
  const ids = new Set(fd.getAll("ideia").map(String));
  const escolhidas = CATALOGO.filter((i) => ids.has(i.id));
  if (escolhidas.length === 0) redirect(`${base}/ideias?erro=${q("Marque pelo menos uma ideia.")}`);

  const { data: ult } = await supabase
    .from("gift_items")
    .select("ordem")
    .eq("event_id", eventId)
    .order("ordem", { ascending: false })
    .limit(1)
    .maybeSingle();
  let ordem = (ult?.ordem ?? 0) + 1;

  const { error } = await supabase.from("gift_items").insert(
    escolhidas.map((i) => ({
      event_id: eventId,
      tipo: i.tipo,
      titulo: i.titulo,
      descricao: i.descricao,
      valor_centavos: i.valor,
      quantidade: i.tipo === "cota" ? (i.quantidade ?? null) : null,
      ordem: ordem++,
      ativo: true,
    })),
  );
  if (error) redirect(`${base}/ideias?erro=${q("Não foi possível adicionar.")}`);
  revalidatePath("/", "layout");
  redirect(`${base}?ok=${q(`${escolhidas.length} presente(s) adicionado(s). Edite valores e fotos à vontade.`)}`);
}

export async function deleteGift(fd: FormData) {
  const eventId = str(fd, "event_id");
  const giftId = str(fd, "gift_id");
  const { supabase } = await requireEventAccess(eventId);
  // Presente com contribuição é só desativado, para não perder o histórico.
  const { count } = await supabase
    .from("contributions")
    .select("id", { count: "exact", head: true })
    .eq("gift_item_id", giftId);
  if (count && count > 0) {
    await supabase.from("gift_items").update({ ativo: false }).eq("id", giftId).eq("event_id", eventId);
  } else {
    await supabase.from("gift_items").delete().eq("id", giftId).eq("event_id", eventId);
  }
  revalidatePath("/", "layout");
  redirect(`/painel/${eventId}/presentes?ok=${q(count ? "Presente ocultado (já tinha contribuições)." : "Presente excluído.")}`);
}

export async function setContributionStatus(fd: FormData) {
  const eventId = str(fd, "event_id");
  const id = str(fd, "contribution_id");
  const acao = str(fd, "acao");
  const { supabase } = await requireEventAccess(eventId);

  const update =
    acao === "confirmar"
      ? { status: "confirmado", confirmado_em: new Date().toISOString() }
      : acao === "recusar"
        ? { status: "recusado", confirmado_em: null }
        : acao === "reabrir"
          ? { status: "aguardando_confirmacao", confirmado_em: null }
          : null;
  if (!update) redirect(`/painel/${eventId}/contribuicoes`);

  await supabase.from("contributions").update(update).eq("id", id).eq("event_id", eventId);
  revalidatePath("/", "layout");
  redirect(`/painel/${eventId}/contribuicoes?status=${str(fd, "filtro") || "aguardando_confirmacao"}`);
}
