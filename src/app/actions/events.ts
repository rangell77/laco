"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireEventAccess } from "@/lib/auth";
import { TEMAS } from "@/lib/brand";
import { createAdminClient } from "@/lib/supabase/admin";
import { RESERVED_SLUGS, SLUG_RE, slugify } from "@/lib/slug";
import type { EventType } from "@/lib/types";

const q = encodeURIComponent;
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const orNull = (v: string) => (v === "" ? null : v);

const EVENT_TYPES: EventType[] = ["casamento", "quinze_anos", "bodas", "outro"];

const HEX = /^#[0-9a-fA-F]{6}$/;
const hexOrNull = (v: string) => (HEX.test(v) ? v : null);
const timeOrNull = (v: string) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null);
const pick = <T extends string>(v: string, ok: readonly T[], fallback: T): T => (ok.includes(v as T) ? (v as T) : fallback);

/** Só aceita imagens do nosso próprio bucket (evita links externos ou "javascript:"). */
const STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-images/`;
const imageOrNull = (v: string) => (v.startsWith(STORAGE_PREFIX) && !v.includes("..") ? v : null);

/** Campos editáveis por admin e cliente. */
function readEventFields(fd: FormData) {
  const tipo = str(fd, "tipo") as EventType;
  return {
    tipo: EVENT_TYPES.includes(tipo) ? tipo : "casamento",
    titulo: str(fd, "titulo").slice(0, 80),
    data_evento: orNull(str(fd, "data_evento")),
    hora_evento: timeOrNull(str(fd, "hora_evento")),
    local: orNull(str(fd, "local").slice(0, 120)),
    local_endereco: orNull(str(fd, "local_endereco").slice(0, 200)),
    recepcao_local: orNull(str(fd, "recepcao_local").slice(0, 120)),
    recepcao_endereco: orNull(str(fd, "recepcao_endereco").slice(0, 200)),
    recepcao_hora: timeOrNull(str(fd, "recepcao_hora")),
    historia: orNull(str(fd, "historia").slice(0, 1200)),
    carta1_de: orNull(str(fd, "carta1_de").slice(0, 60)),
    carta1_texto: orNull(str(fd, "carta1_texto").slice(0, 4000)),
    carta2_de: orNull(str(fd, "carta2_de").slice(0, 60)),
    carta2_texto: orNull(str(fd, "carta2_texto").slice(0, 4000)),
    cartas_layout: pick(str(fd, "cartas_layout"), ["sequencia", "lado"] as const, "sequencia"),
    capa_url: imageOrNull(str(fd, "capa_url")),
    logo_url: imageOrNull(str(fd, "logo_url")),
    foto_layout: pick(str(fd, "foto_layout"), ["destaque", "retrato"] as const, "destaque"),
    foto_foco: pick(str(fd, "foto_foco"), ["topo", "centro", "baixo"] as const, "centro"),
    tema: str(fd, "tema") in TEMAS ? str(fd, "tema") : "classico",
    cor_principal: hexOrNull(str(fd, "cor_principal")) ?? "#9c6b3f",
    cor_fundo: hexOrNull(str(fd, "cor_fundo")),
    cor_papel: hexOrNull(str(fd, "cor_papel")),
    pix_chave: orNull(str(fd, "pix_chave").slice(0, 77)),
    pix_nome: orNull(str(fd, "pix_nome").slice(0, 25)),
    pix_cidade: orNull(str(fd, "pix_cidade").slice(0, 15)),
  };
}

function validateSlug(slug: string): string | null {
  if (!SLUG_RE.test(slug) || slug.length < 3) return "Link inválido: use letras minúsculas, números e hífen (mín. 3).";
  if (RESERVED_SLUGS.has(slug)) return "Esse link é reservado. Escolha outro.";
  return null;
}

export async function createEvent(fd: FormData) {
  const { supabase, user } = await requireAdmin();
  const fields = readEventFields(fd);
  if (!fields.titulo) redirect(`/admin/eventos/novo?erro=${q("Informe o título do evento.")}`);

  const slug = slugify(str(fd, "slug") || fields.titulo);
  const slugError = validateSlug(slug);
  if (slugError) redirect(`/admin/eventos/novo?erro=${q(slugError)}`);

  const { data, error } = await supabase
    .from("events")
    .insert({ ...fields, slug, criado_por: user.id, ativo: false })
    .select("id")
    .single();

  if (error) {
    const msg = error.code === "23505" ? "Já existe um evento com esse link." : "Não foi possível criar o evento.";
    redirect(`/admin/eventos/novo?erro=${q(msg)}`);
  }
  redirect(`/admin/eventos/${data.id}?ok=${q("Evento criado. Agora cadastre os presentes e convide o cliente.")}`);
}

export async function updateEvent(fd: FormData) {
  const eventId = str(fd, "event_id");
  const back = str(fd, "back") || `/painel/${eventId}`;
  const { supabase, profile } = await requireEventAccess(eventId);
  const fields = readEventFields(fd);
  if (!fields.titulo) redirect(`${back}?erro=${q("Informe o título do evento.")}`);

  const update: Record<string, unknown> = { ...fields };
  if (profile.papel === "admin") {
    const slug = slugify(str(fd, "slug"));
    const slugError = validateSlug(slug);
    if (slugError) redirect(`${back}?erro=${q(slugError)}`);
    update.slug = slug;
  }

  const { error } = await supabase.from("events").update(update).eq("id", eventId);
  if (error) {
    const msg = error.code === "23505" ? "Já existe um evento com esse link." : "Não foi possível salvar.";
    redirect(`${back}?erro=${q(msg)}`);
  }
  revalidatePath("/", "layout");
  redirect(`${back}?ok=${q("Alterações salvas.")}`);
}

export async function setEventActive(fd: FormData) {
  const { supabase } = await requireAdmin();
  const eventId = str(fd, "event_id");
  const ativo = str(fd, "ativo") === "true";
  if (ativo) {
    const { data: ev } = await supabase.from("events").select("pix_chave, pix_nome, pix_cidade").eq("id", eventId).single();
    if (!ev?.pix_chave || !ev.pix_nome || !ev.pix_cidade) {
      redirect(`/admin/eventos/${eventId}?erro=${q("Preencha chave Pix, nome e cidade do recebedor antes de publicar.")}`);
    }
  }
  await supabase.from("events").update({ ativo }).eq("id", eventId);
  revalidatePath("/", "layout");
  redirect(`/admin/eventos/${eventId}?ok=${q(ativo ? "Página publicada." : "Página despublicada.")}`);
}

export async function deleteEvent(fd: FormData) {
  const { supabase } = await requireAdmin();
  const eventId = str(fd, "event_id");
  if (str(fd, "confirmacao") !== "EXCLUIR") {
    redirect(`/admin/eventos/${eventId}?erro=${q('Digite EXCLUIR para confirmar a exclusão.')}`);
  }
  await supabase.from("events").delete().eq("id", eventId);
  redirect(`/admin?ok=${q("Evento excluído.")}`);
}

/** Convida o cliente por e-mail (ou vincula, se já tiver conta). */
export async function inviteClient(fd: FormData) {
  await requireAdmin();
  const eventId = str(fd, "event_id");
  const email = str(fd, "email").toLowerCase();
  const nome = str(fd, "nome");
  const back = `/admin/eventos/${eventId}`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect(`${back}?erro=${q("E-mail inválido.")}`);

  const admin = createAdminClient();
  let { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();

  if (!existing) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { nome },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/definir-senha`,
    });
    if (error || !data.user) redirect(`${back}?erro=${q("Não foi possível enviar o convite: " + (error?.message ?? ""))}`);
    existing = { id: data.user.id };
  }

  const { error } = await admin
    .from("event_members")
    .upsert({ event_id: eventId, profile_id: existing.id }, { onConflict: "event_id,profile_id" });
  if (error) redirect(`${back}?erro=${q("Não foi possível vincular o cliente.")}`);

  revalidatePath(back);
  redirect(`${back}?ok=${q(`Cliente ${email} vinculado ao evento.`)}`);
}

export async function removeMember(fd: FormData) {
  const { supabase } = await requireAdmin();
  const eventId = str(fd, "event_id");
  const profileId = str(fd, "profile_id");
  await supabase.from("event_members").delete().eq("event_id", eventId).eq("profile_id", profileId);
  revalidatePath(`/admin/eventos/${eventId}`);
  redirect(`/admin/eventos/${eventId}?ok=${q("Acesso removido.")}`);
}
