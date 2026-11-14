import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* Componentes do painel e dos formulários. Papel e tinta: separação por tom,
   botões retos e chapados, sem sombra em repouso. */

export function Alert({ erro, ok }: { erro?: string; ok?: string }) {
  if (!erro && !ok) return null;
  return (
    <p
      role={erro ? "alert" : "status"}
      className={`px-4 py-3 text-[0.95rem] ${erro ? "bg-[#f3dcd6] text-danger" : "bg-[#dce8d9] text-ok"}`}
    >
      {erro ?? ok}
    </p>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.95rem] font-medium">{label}</span>
      {children}
      {hint && <span className="text-sm text-muted">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full border-0 border-b-2 border-ink/25 bg-paper px-3 py-2.5 text-base outline-none transition-colors placeholder:text-muted/70 focus:border-ink";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

const buttonStyles = {
  primary: "bg-ink text-paper hover:bg-[#33312d]",
  accent: "bg-accent text-ink hover:bg-[#d4b246]",
  ghost: "bg-surface text-ink hover:bg-[#cfcfc8]",
  danger: "bg-[#f3dcd6] text-danger hover:bg-[#ecc9c0]",
};

const buttonBase =
  "press inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-[0.95rem] font-medium disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonStyles }) {
  return <button {...props} className={`${buttonBase} ${buttonStyles[variant]} ${className}`} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
  prefetch,
}: {
  href: string;
  variant?: keyof typeof buttonStyles;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
}) {
  return (
    <Link href={href} prefetch={prefetch} className={`${buttonBase} ${buttonStyles[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function NavLink({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`press whitespace-nowrap px-4 py-2 text-[0.95rem] ${active ? "bg-ink text-paper" : "text-ink hover:bg-surface"}`}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-paper p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "accent" }) {
  return (
    <div className={`p-5 sm:p-6 ${tone === "accent" ? "bg-accent text-ink" : "bg-paper"}`}>
      <p className="text-[0.95rem] text-ink/70">{label}</p>
      <p className="tabular mt-2 font-display text-5xl normal-case">{value}</p>
    </div>
  );
}

export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)]">{children}</h1>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    pendente: ["Pendente", "bg-surface text-muted"],
    aguardando_confirmacao: ["Aguardando confirmação", "bg-accent text-ink"],
    confirmado: ["Confirmado", "bg-[#dce8d9] text-ok"],
    recusado: ["Não recebido", "bg-[#f3dcd6] text-danger"],
    expirado: ["Expirado", "bg-surface text-muted"],
  };
  const [label, cls] = map[status] ?? [status, "bg-surface"];
  return <span className={`inline-block px-2 py-0.5 align-middle text-sm font-medium ${cls}`}>{label}</span>;
}

/** Monograma da marca: um laço desenhado em traço único. */
export function Monogram({ className = "", title = "Laço" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} role="img" aria-label={title}>
      <path
        d="M32 20c-6-9-20-15-24-9s6 14 24 9c-6 6-11 14-9 17M32 20c6-9 20-15 24-9s-6 14-24 9c6 6 11 14 9 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="20" r="3.6" fill="currentColor" />
    </svg>
  );
}
