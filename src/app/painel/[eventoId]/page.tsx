import { updateEvent } from "@/app/actions/events";
import { EventForm } from "@/components/event-form";
import { Alert, Card } from "@/components/ui";
import { requireEventAccess } from "@/lib/auth";

export default async function PaginaEventoPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventoId: string }>;
  searchParams: Promise<{ erro?: string; ok?: string }>;
}) {
  const { eventoId } = await params;
  const { erro, ok } = await searchParams;
  const { event } = await requireEventAccess(eventoId);
  return (
    <div className="flex flex-col gap-4">
      <Alert erro={erro} ok={ok} />
      <Card>
        <EventForm action={updateEvent} event={event} isAdmin={false} back={`/painel/${event.id}`} />
      </Card>
    </div>
  );
}
