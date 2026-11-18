import { NextResponse, type NextRequest } from "next/server";
import { buildIcs, busca, locaisDoEvento } from "@/lib/local";
import { getPublicEvent } from "@/lib/public-event";

/** /[slug]/agenda?local=cerimonia|recepcao -> arquivo .ics para "Adicionar à agenda". */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event?.data_evento) return new NextResponse("Não encontrado", { status: 404 });

  const qual = request.nextUrl.searchParams.get("local") === "recepcao" ? "recepcao" : "cerimonia";
  const local = locaisDoEvento(event).find((l) => l.id === qual) ?? locaisDoEvento(event)[0];
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  const ics = buildIcs({
    uid: `${event.id}-${qual}@laco`,
    titulo: local && qual === "recepcao" ? `${event.titulo} · Recepção` : event.titulo,
    data: event.data_evento,
    hora: local?.hora ?? event.hora_evento,
    local: local ? busca(local) : "",
    url: `${site}/${event.slug}`,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-${qual}.ics"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
