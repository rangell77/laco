import Link from "next/link";
import { EventTabs } from "@/components/event-tabs";
import { requireEventAccess } from "@/lib/auth";

export default async function EventoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventoId: string }>;
}) {
  const { eventoId } = await params;
  const { supabase, event, profile } = await requireEventAccess(eventoId);
  const { count: aguardando } = await supabase
    .from("contributions")
    .select("id", { count: "exact", head: true })
    .eq("event_id", event.id)
    .eq("status", "aguardando_confirmacao");

  return (
    <div className="flex flex-col gap-6">
      <div className="no-print">
        {profile.papel === "admin" && (
          <Link href={`/admin/eventos/${event.id}`} className="inline-flex min-h-11 items-center text-[0.9375rem] text-muted hover:underline">
            ← Configurações do evento
          </Link>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)]">{event.titulo}</h1>
          <a href={`/${event.slug}`} target="_blank" rel="noopener" className="pb-2 text-[0.9375rem] underline-offset-4 hover:underline">
            Ver a página ↗
          </a>
        </div>
        {!event.ativo && (
          <p className="mt-3 bg-accent/30 px-4 py-3 text-[0.9375rem]">
            Página ainda não publicada. Os convidados só conseguem abrir depois que o celebrante publicar.
          </p>
        )}
      </div>
      <EventTabs eventId={event.id} aguardando={aguardando ?? 0} />
      {children}
    </div>
  );
}
