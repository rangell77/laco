/** Cartas assinadas no convite (ex.: da mãe e da aniversariante). */

type Carta = { de: string | null; texto: string | null };

export function Cartas({ cartas, layout }: { cartas: Carta[]; layout: "sequencia" | "lado" }) {
  const validas = cartas.filter((c): c is { de: string | null; texto: string } => !!c.texto?.trim());
  if (validas.length === 0) return null;

  if (layout === "lado" && validas.length > 1) {
    return (
      <section aria-label="Cartas" className="pt-20 sm:pt-28">
        <ul className="mx-auto flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-6">
          {validas.map((c, i) => (
            <li
              key={i}
              className="reveal w-[86vw] max-w-[560px] shrink-0 snap-center sm:w-auto sm:max-w-none"
              style={{ ["--i" as string]: i }}
            >
              <CartaCard carta={c} />
            </li>
          ))}
        </ul>
        <p className="on-ground t-small mt-2 text-center text-muted sm:hidden" aria-hidden>
          Deslize para ler a outra carta →
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Cartas" className="mx-auto flex max-w-[640px] flex-col gap-10 px-3 pt-20 sm:gap-14 sm:pt-28">
      {validas.map((c, i) => (
        <div key={i} className="reveal" style={{ rotate: i % 2 ? "0.6deg" : "-0.6deg" }}>
          <CartaCard carta={c} />
        </div>
      ))}
    </section>
  );
}

function CartaCard({ carta }: { carta: { de: string | null; texto: string } }) {
  const paragrafos = carta.texto
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <article className="card-scallop h-full px-7 pb-12 pt-11 sm:px-12 sm:pt-14">
      <header className="text-center">
        <p className="t-small font-medium uppercase tracking-[0.2em] text-muted">Carta</p>
        {carta.de && <h2 className="font-display mt-3 text-[clamp(2.25rem,1.6rem+2.6vw,3.25rem)]">{carta.de}</h2>}
        <span aria-hidden className="diamond mt-5" />
      </header>
      <div className="mt-8 flex flex-col gap-4 text-pretty">
        {paragrafos.map((p, i) => (
          <p
            key={i}
            style={i === 0 && p.length < 80 ? { color: "color-mix(in srgb, var(--cor) 70%, var(--ink))" } : undefined}
            className={`whitespace-pre-line ${i === 0 && p.length < 80 ? "t-lead text-center font-medium" : i === 0 ?"first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-[2.9em] first-letter:leading-[0.78] first-letter:text-[color-mix(in_srgb,var(--cor)_70%,var(--ink))]" : ""}`}
          >
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
