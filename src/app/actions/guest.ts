"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseBRL, formatBRL } from "@/lib/money";
import { pickUniqueCents } from "@/lib/pix";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Ações do CONVIDADO (sem login). Usam a service role, então TODA entrada
 * é validada aqui: evento publicado, presente do próprio evento, valores, etc.
 */

const q = encodeURIComponent;
const str = (fd: FormData, k: string, max = 1000) => String(fd.get(k) ?? "").trim().slice(0, max);
const MIN_CENTAVOS = 100; // R$ 1,00
const MAX_CENTAVOS = 10_000_000; // R$ 100.000,00
const OPEN = ["pendente", "aguardando_confirmacao", "confirmado"];
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const RATE_MAX = 40; // pedidos por evento na janela (uma festa real fica bem abaixo disso)

export async function createContribution(fd: FormData) {
  const slug = str(fd, "slug", 60);
  const giftId = str(fd, "gift_id", 40);
  const nome = str(fd, "nome", 80);
  const contato = str(fd, "contato", 120) || null;
  const mensagem = str(fd, "mensagem", 1000) || null;
  const back = `/${slug}/presente/${giftId}`;
  const fail = (msg: string): never => redirect(`${back}?erro=${q(msg)}`);

  // Campo-isca preenchido = robô. Finge sucesso sem gravar nada.
  if (str(fd, "site", 200)) redirect(`/${slug}`);
  if (nome.length < 2) fail("Informe seu nome para os anfitriões saberem quem presenteou.");

  const db = createAdminClient();
  const { data: event } = await db
    .from("events")
    .select("id, ativo, pix_chave, pix_nome, pix_cidade")
    .eq("slug", slug)
    .maybeSingle();
  if (!event?.ativo) redirect("/");

  // Freio contra abuso: muitos pedidos novos no mesmo evento em pouco tempo.
  const { count: recentes } = await db
    .from("contributions")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id)
    .gte("criado_em", new Date(Date.now() - RATE_WINDOW_MS).toISOString());
  if ((recentes ?? 0) >= RATE_MAX) fail("Muitos pedidos agora. Espere alguns minutos e tente de novo.");

  // Expira pendentes antigas deste evento (libera itens e centavos).
  await db
    .from("contributions")
    .update({ status: "expirado" })
    .eq("event_id", event.id)
    .eq("status", "pendente")
    .lt("expira_em", new Date().toISOString());

  // Presente (ou Pix livre avulso)
  let gift: {
    id: string;
    tipo: string;
    valor_centavos: number | null;
    quantidade: number | null;
  } | null = null;
  if (giftId !== "livre") {
    const { data } = await db
      .from("gift_items")
      .select("id, tipo, valor_centavos, quantidade")
      .eq("id", giftId)
      .eq("event_id", event.id)
      .eq("ativo", true)
      .maybeSingle();
    if (!data) fail("Esse presente não está mais disponível.");
    gift = data;
  }
  const tipo = gift?.tipo ?? "pix_livre";

  // Disponibilidade (cota e link com quantidade)
  if (gift?.quantidade != null) {
    const { count } = await db
      .from("contributions")
      .select("id", { count: "exact", head: true })
      .eq("gift_item_id", gift.id)
      .in("status", OPEN);
    if ((count ?? 0) >= gift.quantidade) fail("Esse presente já foi escolhido por outro convidado.");
  }

  // Valor
  let valorBase: number;
  if (tipo === "cota") {
    valorBase = gift!.valor_centavos!;
  } else if (tipo === "link") {
    valorBase = gift!.valor_centavos ?? 0;
  } else {
    const v = parseBRL(str(fd, "valor", 20));
    if (!v || v < MIN_CENTAVOS) fail(`Informe um valor de pelo menos ${formatBRL(MIN_CENTAVOS)}.`);
    if (v! > MAX_CENTAVOS) fail("Valor acima do permitido.");
    valorBase = v!;
  }

  // Produto de loja: o convidado já comprou fora, só registra.
  if (tipo === "link") {
    const { error } = await db.from("contributions").insert({
      event_id: event.id,
      gift_item_id: gift!.id,
      convidado_nome: nome,
      convidado_contato: contato,
      mensagem,
      valor_base_centavos: valorBase,
      valor_cobrado_centavos: valorBase,
      metodo: "compra_externa",
      status: "aguardando_confirmacao",
      pago_em: new Date().toISOString(),
    });
    if (error) fail("Não foi possível registrar. Tente novamente.");
    revalidatePath(`/${slug}`);
    redirect(`/${slug}/obrigado?tipo=loja`);
  }

  if (!event.pix_chave || !event.pix_nome || !event.pix_cidade) fail("Pix ainda não configurado para este evento.");

  // Pix estático: valor com centavos únicos. Tenta algumas vezes em caso de corrida.
  const valorRedondo = Math.floor(valorBase / 100) * 100;
  for (let tentativa = 0; tentativa < 4; tentativa++) {
    const { data: abertos } = await db
      .from("contributions")
      .select("valor_cobrado_centavos")
      .eq("event_id", event.id)
      .eq("metodo", "pix_estatico")
      .in("status", ["pendente", "aguardando_confirmacao"])
      .gt("valor_cobrado_centavos", valorRedondo)
      .lt("valor_cobrado_centavos", valorRedondo + 100);
    const emUso = new Set((abertos ?? []).map((a) => a.valor_cobrado_centavos as number));
    const cobrado = pickUniqueCents(valorRedondo, emUso);
    if (cobrado == null) fail("Muitos pagamentos com esse valor agora. Tente um valor um pouco diferente.");

    const { data, error } = await db
      .from("contributions")
      .insert({
        event_id: event.id,
        gift_item_id: gift?.id ?? null,
        convidado_nome: nome,
        convidado_contato: contato,
        mensagem,
        valor_base_centavos: valorBase,
        valor_cobrado_centavos: cobrado,
        metodo: "pix_estatico",
        status: "pendente",
      })
      .select("id")
      .single();

    if (!error && data) {
      revalidatePath(`/${slug}`);
      redirect(`/${slug}/pix/${data.id}`);
    }
    if (error?.code !== "23505") break; // só repete se colidiu nos centavos
  }
  fail("Não foi possível gerar o Pix. Tente novamente.");
}

export async function markPaid(fd: FormData) {
  const slug = str(fd, "slug", 60);
  const id = str(fd, "contribution_id", 40);
  const db = createAdminClient();

  const { data: event } = await db.from("events").select("id").eq("slug", slug).eq("ativo", true).maybeSingle();
  if (!event) redirect("/");

  const { data, error } = await db
    .from("contributions")
    .update({ status: "aguardando_confirmacao", pago_em: new Date().toISOString() })
    .eq("id", id)
    .eq("event_id", event.id)
    .eq("status", "pendente")
    .select("id");

  if (error || !data?.length) {
    // Já marcado antes (clique duplo) ou expirado.
    const { data: c } = await db.from("contributions").select("status").eq("id", id).eq("event_id", event.id).maybeSingle();
    if (c?.status !== "aguardando_confirmacao" && c?.status !== "confirmado") {
      redirect(`/${slug}/pix/${id}?erro=${q("Este Pix expirou. Gere um novo, por favor.")}`);
    }
  }
  revalidatePath(`/${slug}`);
  redirect(`/${slug}/obrigado`);
}
