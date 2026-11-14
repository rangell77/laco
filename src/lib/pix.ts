/**
 * Geração de Pix ESTÁTICO no padrão BR Code (EMV QRCPS-MPM) do Banco Central.
 * Fase 1 do projeto. A Fase futura (gateway) usará Pix dinâmico do provedor.
 */

type PixInput = {
  chave: string;
  nome: string; // até 25 caracteres
  cidade: string; // até 15 caracteres
  valorCentavos: number;
  txid?: string; // até 25 caracteres alfanuméricos; "***" quando não usado
  descricao?: string;
};

function field(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

/** Remove acentos e caracteres fora do padrão, e corta no limite. */
function sanitize(text: string, max: number): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, max);
}

/** CRC16-CCITT (poly 0x1021, init 0xFFFF), exigido no campo 63. */
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Normaliza a chave como o DICT espera: e-mail em minúsculas, celular "+55...",
 * CPF/CNPJ só com dígitos, chave aleatória em minúsculas.
 */
export function normalizePixKey(raw: string): string {
  const k = raw.trim();
  if (k.includes("@")) return k.toLowerCase();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k)) return k.toLowerCase();
  if (k.startsWith("+")) return "+" + k.replace(/\D/g, "");
  const digits = k.replace(/\D/g, "");
  // "(11) 99999-9999": celular escrito com DDD entre parênteses.
  if (k.startsWith("(") && (digits.length === 10 || digits.length === 11)) return "+55" + digits;
  // CPF (11) ou CNPJ (14), com ou sem pontuação.
  if (digits.length === 11 || digits.length === 14) return digits;
  return k;
}

/** Retorna o código "copia e cola" do Pix. */
export function buildPixPayload(input: PixInput): string {
  const merchantAccount =
    field("00", "br.gov.bcb.pix") +
    field("01", normalizePixKey(input.chave)) +
    (input.descricao ? field("02", sanitize(input.descricao, 40)) : "");

  const txid = (input.txid ?? "***").replace(/[^A-Za-z0-9*]/g, "").slice(0, 25) || "***";

  const payload =
    field("00", "01") +
    field("26", merchantAccount) +
    field("52", "0000") +
    field("53", "986") +
    field("54", (input.valorCentavos / 100).toFixed(2)) +
    field("58", "BR") +
    field("59", sanitize(input.nome, 25) || "RECEBEDOR") +
    field("60", sanitize(input.cidade, 15) || "BRASIL") +
    field("62", field("05", txid)) +
    "6304";

  return payload + crc16(payload);
}

/**
 * Sorteia centavos únicos (01–99) para somar ao valor base,
 * evitando os valores já em uso por contribuições abertas do evento.
 * Ex.: base 15000 (R$ 150,00) -> 15037 (R$ 150,37).
 */
export function pickUniqueCents(valorBaseCentavos: number, emUso: Set<number>): number | null {
  const livres: number[] = [];
  for (let c = 1; c <= 99; c++) {
    const candidato = valorBaseCentavos + c;
    if (!emUso.has(candidato)) livres.push(candidato);
  }
  if (livres.length === 0) return null;
  return livres[Math.floor(Math.random() * livres.length)];
}
