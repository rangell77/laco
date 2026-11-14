import Link from "next/link";
import { redirect } from "next/navigation";
import { PageTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { EVENT_TYPE_LABEL, type EventRow } from "@/lib/types";

export default async function PainelPage() {
  const { supabase, profile, user } = await requireUser();
  if (profile.papel === "admin") redirect("/admin");

  const { data } = await supabase
    .from("event_members")
    .select("events(id, slug, tipo, titulo, data_evento, ativo)")
    .eq("profile_id", user.id)
    .returns<{ events: EventRow | null }[]>();
  const events = (data ?? []).map((r) => r.events).filter((e): e is EventRow => !!e);

  if (events.length === 1) redirect(`/painel/${events[0].id}`);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Minhas listas</PageTitle>
      {events.length === 0 ? (
        <p className="bg-paper p-8">Nenhuma lista ligada à sua conta ainda. Fale com {BRAND.celebrante}.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((e) => (
            <li key={e.id}>
              <Link href={`/painel/${e.id}`} className="press block bg-paper px-5 py-4 hover:bg-[#fafaf7]">
                <p className="t-lead font-semibold">{e.titulo}</p>
                <p className="text-[0.9375rem] text-muted">{EVENT_TYPE_LABEL[e.tipo]}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
