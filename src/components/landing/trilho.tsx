"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Fileira arrastável com barra de progresso e botões de voltar/avançar. */
export function Trilho({ titulo, children }: { titulo: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setP(max > 0 ? el.scrollLeft / max : 1);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const mover = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 312, behavior: "smooth" });

  return (
    <div>
      <div className="flex items-end justify-between gap-4 px-4 sm:px-8">
        {titulo}
        <div className="hidden gap-2 sm:flex">
          <button type="button" onClick={() => mover(-1)} aria-label="Voltar" className="press grid size-12 place-items-center bg-ink text-paper hover:bg-[#33312d]">
            <Seta className="rotate-180" />
          </button>
          <button type="button" onClick={() => mover(1)} aria-label="Avançar" className="press grid size-12 place-items-center bg-ink text-paper hover:bg-[#33312d]">
            <Seta />
          </button>
        </div>
      </div>
      <div className="mx-4 mt-6 h-1.5 bg-surface sm:mx-8" aria-hidden>
        <div className="h-full bg-ink transition-[width] duration-150" style={{ width: `${Math.max(8, p * 100)}%` }} />
      </div>
      <div
        ref={ref}
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] sm:gap-8 sm:scroll-px-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}

function Seta({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`size-5 ${className}`} aria-hidden>
      <path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
    </svg>
  );
}
