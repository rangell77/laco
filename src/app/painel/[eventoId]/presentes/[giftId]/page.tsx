import { notFound } from "next/navigation";
import { GiftForm } from "@/components/gift-form";
import { Alert, Card } from "@/components/ui";
import { requireEventAccess } from "@/lib/auth";
import type { GiftItemRow } from "@/lib/types";

export default async function EditarPresentePage({
  params,
  searchParams,
}: {
  params: Promise<{ eventoId: string; giftId: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { eventoId, giftId } = await params;
  const { erro } = await searchParams;
  const { supabase, event } = await requireEventAccess(eventoId);
  const { data: gift } = await supabase
    .from("gift_items")
    .select("*")
    .eq("id", giftId)
    .eq("event_id", event.id)
    .maybeSingle<GiftItemRow>();
  if (!gift) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-5xl">Editar presente</h2>
      <Alert erro={erro} />
      <Card>
        <GiftForm eventId={event.id} gift={gift} />
      </Card>
    </div>
  );
}
