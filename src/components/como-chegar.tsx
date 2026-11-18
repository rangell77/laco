import { busca, formatHora, googleMapsUrl, mapaEmbedUrl, wazeUrl, type Local } from "@/lib/local";

/** Cartões de local com mapa de satélite (sem chave de API) e atalhos para Maps, Waze e agenda. */
export function ComoChegar({ locais, slug, temData }: { locais: Local[]; slug: string; temData: boolean }) {
  if (locais.length === 0) return null;
  return (
    <section id="local" className="mx-auto max-w-5xl scroll-mt-6 px-3 pt-24 sm:px-6 sm:pt-32" aria-labelledby="local-t">
      <h2 id="local-t" className="on-ground font-display t-head text-center">
        Como chegar
      </h2>
      <div className={`mt-10 grid gap-4 ${locais.length > 1 ? "md:grid-cols-2" : "mx-auto max-w-2xl"}`}>
        {locais.map((l, i) => {
          const q = busca(l);
          const hora = formatHora(l.hora);
          return (
            <article key={l.id} className="reveal bg-paper p-5 sm:p-7" style={{ ["--i" as string]: i }}>
              <p className="t-lead font-semibold">
                {l.titulo}
                {hora && <span className="font-normal text-muted"> · {hora}</span>}
              </p>
              {l.nome && <p className="mt-1 font-medium">{l.nome}</p>}
              {l.endereco && <p className="text-muted">{l.endereco}</p>}

              {q && (
                <div className="relative mt-5 aspect-[4/3] overflow-hidden bg-surface sm:aspect-[16/10]">
                  <iframe
                    src={mapaEmbedUrl(q)}
                    title={`Mapa de satélite: ${q}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full border-0"
                    tabIndex={-1}
                  />
                  {/* O mapa inteiro é um atalho: tocar abre o Google Maps no celular. */}
                  <a
                    href={googleMapsUrl(q)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir ${l.nome ?? "o local"} no Google Maps`}
                    className="absolute inset-0 flex items-end justify-end p-3"
                  >
                    <span className="bg-paper px-3 py-1.5 text-[0.875rem] font-medium text-ink">Toque para abrir o mapa</span>
                  </a>
                </div>
              )}

              {q && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={googleMapsUrl(q)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press inline-flex min-h-11 items-center px-4 text-[0.9375rem] font-medium"
                    style={{ background: "var(--cor)", color: "var(--cor-texto)" }}
                  >
                    Google Maps
                  </a>
                  <a
                    href={wazeUrl(q)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press inline-flex min-h-11 items-center bg-ink px-4 text-[0.9375rem] font-medium text-paper"
                  >
                    Waze
                  </a>
                  {temData && (
                    <a
                      href={`/${slug}/agenda?local=${l.id}`}
                      className="press inline-flex min-h-11 items-center bg-bg px-4 text-[0.9375rem] font-medium"
                    >
                      Adicionar à agenda
                    </a>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
