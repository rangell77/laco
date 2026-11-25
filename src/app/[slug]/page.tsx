import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComoChegar } from "@/components/como-chegar";
import { Countdown } from "@/components/countdown";
import { Cartas } from "@/components/landing/cartas";
import { formatHora, locaisDoEvento } from "@/lib/local";
import { formatBRL } from "@/lib/money";
import { getPublicEvent, getPublicGifts } from "@/lib/public-event";
import { EVENT_TYPE_LABEL, type GiftItemRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) return {};
  const title = `${event.titulo} · Lista de presentes`;
  const description = event.historia?.slice(0, 160) ?? `Lista de presentes · ${EVENT_TYPE_LABEL[event.tipo]}`;
  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: event.capa_url ? [event.capa_url] : undefined,
    },
    // Rascunho não deve ser indexado nem pré-visualizado por robôs.
    robots: event.ativo ? undefined : { index: false, follow: false },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) notFound();
  const gifts = await getPublicGifts(event.id);
  const temPixLivre = gifts.some((g) => g.item.tipo === "pix_livre");
  // Um único Pix livre com texto vira um bloco de destaque (ex.: "Presente dos sonhos") em vez da grade.
  const presenteUnico = gifts.length === 1 && gifts[0].item.tipo === "pix_livre" ? gifts[0].item : null;
  const corTexto = "var(--cor-texto)";

  const dataFmt = event.data_evento
    ? new Date(event.data_evento + "T12:00:00").toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const hora = formatHora(event.hora_evento);
  const nomes = splitTitulo(event.titulo);
  const locais = locaisDoEvento(event);
  const foco = { topo: "50% 20%", centro: "50% 45%", baixo: "50% 75%" }[event.foto_foco ?? "centro"];
  const destaque = !!event.capa_url && event.foto_layout !== "retrato";
  const retrato = !!event.capa_url && event.foto_layout === "retrato";

  return (
    <main>
      {/* Capa. Foto em destaque: o casal aparece inteiro e o convite sobe por cima da parte de baixo. */}
      <section className={`relative pb-6 ${destaque ? "" : "pt-20 sm:pt-32"}`}>
        {destaque && (
          <div className="relative h-[64svh] min-h-[380px] overflow-hidden bg-field sm:h-[80svh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.capa_url!}
              alt={`Foto de ${event.titulo}`}
              className="drift h-full w-full object-cover"
              style={{ objectPosition: foco }}
            />
          </div>
        )}
        <div
          className={`card-scallop rise relative z-10 mx-3 px-6 pb-12 text-center sm:mx-auto sm:max-w-[620px] sm:px-14 ${destaque ? "-mt-24 pt-10 sm:-mt-36 sm:pt-12" : "pt-12 sm:pt-14"}`}
        >
          {retrato && (
            <div className="mx-auto mb-8 w-[min(260px,70%)] -rotate-2 bg-white p-2.5 pb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.capa_url!}
                alt={`Foto de ${event.titulo}`}
                className="aspect-[4/5] w-full object-cover"
                style={{ objectPosition: foco }}
              />
            </div>
          )}
          {event.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.logo_url} alt="" className="mx-auto mb-6 max-h-16 w-auto max-w-[60%] object-contain sm:max-h-20" />
          )}
          <h1 className="font-display t-display">
            <span className="block sm:-translate-x-[6%]">{nomes[0]}</span>
            {nomes[1] && <span className="block sm:translate-x-[6%]">{nomes[1]}</span>}
          </h1>
          <ul className="mt-8 flex flex-col items-center gap-1.5">
            <li className="font-medium">{EVENT_TYPE_LABEL[event.tipo]}</li>
            {dataFmt && (
              <li>
                {dataFmt}
                {hora && ` · ${hora}`}
              </li>
            )}
            {event.local && <li>{event.local}</li>}
            <li aria-hidden className="diamond my-2" />
          </ul>
          {event.data_evento && <Countdown date={event.data_evento} />}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#presentes"
              className="press inline-flex min-h-12 items-center px-7 font-medium"
              style={{ background: "var(--cor)", color: corTexto }}
            >
              {presenteUnico ? presenteUnico.titulo : "Ver a lista de presentes"}
            </a>
            {locais.length > 0 && (
              <a href="#local" className="press inline-flex min-h-12 items-center bg-bg px-6 font-medium">
                Como chegar
              </a>
            )}
          </div>
        </div>
      </section>

      {event.historia && (
        <section className="on-ground reveal mx-auto max-w-[44ch] px-5 pt-12 text-center">
          <p className="t-lead whitespace-pre-line">{event.historia}</p>
        </section>
      )}

      <Cartas
        cartas={[
          { de: event.carta1_de, texto: event.carta1_texto },
          { de: event.carta2_de, texto: event.carta2_texto },
        ]}
        layout={event.cartas_layout ?? "sequencia"}
      />

      <ComoChegar locais={locais} slug={event.slug} temData={!!event.data_evento} />

      {presenteUnico ? (
        <PresenteUnico item={presenteUnico} slug={event.slug} />
      ) : (
        <section id="presentes" className="mx-auto max-w-5xl scroll-mt-6 px-3 pt-24 sm:px-6 sm:pt-32">
          <div className="on-ground text-center">
            <h2 className="font-display t-head">Lista de presentes</h2>
            <p className="mt-3 text-muted">Escolha um presente e deixe o seu recado.</p>
          </div>

          {gifts.length === 0 ? (
            <p className="mt-10 bg-paper p-8 text-center">Os presentes ainda estão sendo escolhidos. Volte em breve.</p>
          ) : (
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gifts.map(({ item, progress, esgotado }, i) => {
                const pct =
                  item.tipo === "meta" && item.valor_centavos
                    ? Math.min(100, Math.round(((progress?.confirmado_centavos ?? 0) / item.valor_centavos) * 100))
                    : 0;
                const preco =
                  item.tipo === "cota" || (item.tipo === "link" && item.valor_centavos)
                    ? formatBRL(item.valor_centavos!)
                    : item.tipo === "meta"
                      ? `Meta ${formatBRL(item.valor_centavos!)}`
                      : "Valor livre";
                return (
                  <li key={item.id} className="reveal" style={{ ["--i" as string]: i % 3 }}>
                    <Link
                      href={esgotado ? `/${event.slug}#presentes` : `/${event.slug}/presente/${item.id}`}
                      aria-disabled={esgotado}
                      className={`tag group flex h-full flex-col bg-paper ${esgotado ? "pointer-events-none" : "press"}`}
                    >
                      {item.imagem_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imagem_url}
                          alt=""
                          loading="lazy"
                          className={`aspect-[4/3] w-full object-cover ${esgotado ? "grayscale" : ""}`}
                        />
                      ) : (
                        <div
                          className="grid aspect-[4/3] place-items-center"
                          style={{
                            background: "color-mix(in srgb, var(--cor) 16%, var(--paper))",
                          }}
                        >
                          <span
                            className="font-display px-6 text-center text-5xl leading-[0.95]"
                            style={{
                              color: "color-mix(in srgb, var(--cor) 70%, var(--ink))",
                            }}
                          >
                            {item.titulo}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <h3 className="t-lead font-semibold">{item.titulo}</h3>
                        {item.descricao && <p className="t-small line-clamp-3 text-muted">{item.descricao}</p>}
                        {item.tipo === "meta" && item.valor_centavos && (
                          <div className="mt-1">
                            <div className="h-2 bg-[color-mix(in_srgb,var(--ink)_10%,transparent)]">
                              <div
                                className="h-full"
                                style={{
                                  width: `${pct}%`,
                                  background: "var(--cor)",
                                }}
                              />
                            </div>
                            <p className="t-small tabular mt-1.5 text-muted">
                              {formatBRL(progress?.confirmado_centavos ?? 0)} arrecadados · {pct}%
                            </p>
                          </div>
                        )}
                        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                          <span className="tabular font-semibold">{preco}</span>
                          <span
                            className="t-small px-3 py-1.5 font-medium"
                            style={
                              esgotado
                                ? {
                                    background: "var(--bg)",
                                    color: "var(--muted)",
                                  }
                                : { background: "var(--cor)", color: corTexto }
                            }
                          >
                            {esgotado ? "Presenteado" : "Presentear"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!temPixLivre && (
            <div className="mt-12 text-center">
              <Link
                href={`/${event.slug}/presente/livre`}
                className="press inline-flex min-h-12 items-center bg-paper px-6 font-medium"
              >
                Prefere enviar um valor livre no Pix?
              </Link>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

/** Bloco único de presente em Pix: título, chamada e o texto de quem celebra. */
function PresenteUnico({ item, slug }: { item: GiftItemRow; slug: string }) {
  const [chamada, ...resto] = (item.descricao ?? "")
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <section id="presentes" className="mx-auto max-w-[640px] scroll-mt-6 px-3 pt-24 sm:pt-32">
      <article className="tag reveal bg-paper px-7 pb-12 pt-12 text-center sm:px-12 sm:pt-14">
        <p className="t-small font-medium uppercase tracking-[0.2em] text-muted">Presente</p>
        <h2 className="font-display t-head mt-3">{item.titulo}</h2>
        {chamada && (
          <p className="t-lead mt-5 font-medium" style={{ color: "color-mix(in srgb, var(--cor) 70%, var(--ink))" }}>
            {chamada}
          </p>
        )}
        <span aria-hidden className="diamond mt-6" />
        {resto.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 text-pretty">
            {resto.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        )}
        <Link
          href={`/${slug}/presente/${item.id}`}
          className="press mt-10 inline-flex min-h-13 items-center px-8 font-medium"
          style={{ background: "var(--cor)", color: "var(--cor-texto)" }}
        >
          Contribuir via Pix
        </Link>
      </article>
    </section>
  );
}

/** "Ana & João" -> ["Ana", "& João"] */
function splitTitulo(t: string): [string, string?] {
  const m = t.match(/^(.+?)\s*(&|\se\s)\s*(.+)$/i);
  if (m) return [m[1], `& ${m[3]}`];
  return [t];
}
