/** Formata centavos como "R$ 1.234,56". */
export function formatBRL(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Converte "150,37" / "150.37" / "150" em centavos. Retorna null se inválido. */
export function parseBRL(input: string): number | null {
  const clean = input.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const value = Number(clean);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}
