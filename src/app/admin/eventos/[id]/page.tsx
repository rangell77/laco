import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEvent, inviteClient, removeMember, setEventActive, updateEvent } from "@/app/actions/events";
import { EventForm } from "@/components/event-form";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Button, ButtonLink, Card, Field, Input, PageTitle } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import type { EventFull } from "@/lib/types";

type Member = { profile_id: string; profiles: { nome: string; email: string | null } | null };

export default async function EventoAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string; ok?: string }>;
}) {
  const { id } = await params;
  const { erro, ok } = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: event }, { data: members }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle<EventFull>(),
    supabase.from("event_members").select("profile_id, profiles(nome, email)").eq("event_id", id).returns<Member[]>(),
  ]);
  if (!event) notFound();

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="inline-flex min-h-11 items-center text-[0.9375rem] text-muted hover:underline">
          ← Eventos
        </Link>
        <PageTitle
          action={
            <form action={setEventActive}>
              <input type="hidden" name="event_id" value={event.id} />
              <input type="hidden" name="ativo" value={String(!event.ativo)} />
              <Button variant={event.ativo ? "ghost" : "accent"}>{event.ativo ? "Despublicar" : "Publicar a página"}</Button>
            </form>
          }
        >
          {event.titulo}
        </PageTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 text-[0.9375rem] ${event.ativo ? "bg-[#dce8d9] text-ok" : "bg-surface text-muted"}`}>
            {event.ativo ? "Publicada" : "Rascunho"}
          </span>
          <a href={`/${event.slug}`} target="_blank" rel="noopener" className="text-[0.9375rem] hover:underline">
            {siteUrl}/{event.slug} ↗
          </a>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href={`/painel/${event.id}/presentes`} variant="ghost">
            Presentes
          </ButtonLink>
          <ButtonLink href={`/painel/${event.id}/contribuicoes`} variant="ghost">
            Contribuições
          </ButtonLink>
          <ButtonLink href={`/painel/${event.id}/compartilhar`} variant="ghost">
            Compartilhar e Pix de teste
          </ButtonLink>
        </div>
      </div>

      <Alert erro={erro} ok={ok} />

      <Card>
        <EventForm action={updateEvent} event={event} isAdmin back={`/admin/eventos/${event.id}`} />
      </Card>

      <Card className="flex flex-col gap-5">
        <h2 className="font-display text-4xl">Quem pode editar</h2>
        {(members ?? []).length === 0 ? (
          <p className="text-muted">Nenhum cliente com acesso ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(members ?? []).map((m) => (
              <li key={m.profile_id} className="flex flex-wrap items-center justify-between gap-2 bg-bg px-4 py-2">
                <span>
                  {m.profiles?.nome || "Sem nome"} <span className="text-muted">{m.profiles?.email}</span>
                </span>
                <form action={removeMember}>
                  <input type="hidden" name="event_id" value={event.id} />
                  <input type="hidden" name="profile_id" value={m.profile_id} />
                  <Button variant="danger">Remover acesso</Button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <form action={inviteClient} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <input type="hidden" name="event_id" value={event.id} />
          <Field label="Nome do cliente">
            <Input name="nome" maxLength={80} />
          </Field>
          <Field label="E-mail do cliente">
            <Input name="email" type="email" required />
          </Field>
          <SubmitButton className="min-h-11 bg-ink px-5 font-medium text-paper" pendingLabel="Enviando…">
            Convidar
          </SubmitButton>
        </form>
        <p className="text-[0.9375rem] text-muted">O cliente recebe um e-mail para criar a senha e entrar no painel da lista.</p>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-4xl text-danger">Excluir evento</h2>
        <p className="text-muted">Apaga a página, os presentes e todo o histórico de contribuições. Não dá para desfazer.</p>
        <form action={deleteEvent} className="flex flex-wrap gap-2">
          <input type="hidden" name="event_id" value={event.id} />
          <Input name="confirmacao" placeholder="Digite EXCLUIR" className="max-w-56" aria-label="Digite EXCLUIR para confirmar" />
          <Button variant="danger">Excluir</Button>
        </form>
      </Card>
    </div>
  );
}
