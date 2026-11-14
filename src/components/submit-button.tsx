"use client";

import type { CSSProperties, ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Botão de envio que trava enquanto o formulário é processado (evita clique duplo). */
export function SubmitButton({
  children,
  pendingLabel,
  className = "",
  style,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`press disabled:opacity-70 ${className}`} style={style}>
      {pending ? (pendingLabel ?? "Enviando…") : children}
    </button>
  );
}
