import Link from "next/link";
import { createEvent } from "@/app/actions/events";
import { EventForm } from "@/components/event-form";
import { Alert, Card, PageTitle } from "@/components/ui";

export default async function NovoEventoPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="inline-flex min-h-11 items-center text-[0.9375rem] text-muted hover:underline">
          ← Eventos
        </Link>
        <PageTitle>Novo evento</PageTitle>
      </div>
      <Alert erro={erro} />
      <Card>
        <EventForm action={createEvent} isAdmin submitLabel="Criar evento" />
      </Card>
    </div>
  );
}
