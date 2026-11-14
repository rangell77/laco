/** "Faltam 42 dias". Calculado no servidor (página é dinâmica) no fuso de Brasília. */
export function Countdown({ date, className = "" }: { date: string; className?: string }) {
  const hojeSP = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }); // AAAA-MM-DD
  const dias = Math.round((Date.parse(date) - Date.parse(hojeSP)) / 86_400_000);
  if (Number.isNaN(dias) || dias < 0) return null;
  return (
    <p className={`t-small font-medium ${className}`}>
      {dias === 0 ? "É hoje" : dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`}
    </p>
  );
}
