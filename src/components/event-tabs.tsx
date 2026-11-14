"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function EventTabs({ eventId, aguardando = 0 }: { eventId: string; aguardando?: number }) {
  const path = usePathname();
  const base = `/painel/${eventId}`;
  const tabs = [
    { href: base, label: "Página" },
    { href: `${base}/presentes`, label: "Presentes" },
    { href: `${base}/contribuicoes`, label: "Contribuições", badge: aguardando },
    { href: `${base}/compartilhar`, label: "Compartilhar" },
  ];
  return (
    <nav className="no-print -mx-4 flex gap-1 overflow-x-auto px-4" aria-label="Seções da lista">
      {tabs.map((t) => {
        const active = t.href === base ? path === base : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`press inline-flex min-h-11 items-center gap-2 whitespace-nowrap px-4 text-[0.9375rem] ${active ? "bg-ink text-paper" : "bg-paper hover:bg-surface"}`}
          >
            {t.label}
            {!!t.badge && (
              <span className="tabular bg-accent px-1.5 text-[0.8125rem] font-semibold text-ink" aria-label={`${t.badge} aguardando`}>
                {t.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
