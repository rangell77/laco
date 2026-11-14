import { GiftForm } from "@/components/gift-form";
import { Alert, Card } from "@/components/ui";
import { requireEventAccess } from "@/lib/auth";

export default async function NovoPresentePage({
  params,
  searchParams,
}: {
  params: Promise<{ eventoId: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { eventoId } = await params;
  const { erro } = await searchParams;
  const { event } = await requireEventAccess(eventoId);
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-5xl">Novo presente</h2>
      <Alert erro={erro} />
      <Card>
        <GiftForm eventId={event.id} />
      </Card>
    </div>
  );
}
