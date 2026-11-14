"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="press inline-flex min-h-11 items-center bg-ink px-5 text-[0.95rem] font-medium text-paper"
    >
      Imprimir ou salvar em PDF
    </button>
  );
}
