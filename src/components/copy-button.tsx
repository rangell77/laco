"use client";

import { useState, type CSSProperties } from "react";

export function CopyButton({
  text,
  label = "Copiar",
  className = "",
  style,
}: {
  text: string;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      style={style}
      className={`press inline-flex min-h-11 items-center justify-center bg-ink px-5 py-2.5 text-[0.9375rem] font-medium text-paper hover:opacity-90 ${className}`}
    >
      <span aria-live="polite">{copied ? "Copiado" : label}</span>
    </button>
  );
}
