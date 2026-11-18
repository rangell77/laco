/**
 * Links de mapa montados a partir do endereço (nunca de um link digitado),
 * todos públicos e sem chave de API.
 */
export type Local = {
  id: "cerimonia" | "recepcao";
  titulo: string; // "Cerimônia", "Recepção", "Festa"
  nome: string | null; // "Espaço Jardim"
  endereco: string | null; // "Rua das Flores, 120, Campinas"
  hora: string | null; // "16:30"
};

const enc = encodeURIComponent;

export function busca(l: Local) {
  return [l.nome, l.endereco].filter(Boolean).join(", ");
}

export const googleMapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${enc(q)}`;
export const wazeUrl = (q: string) => `https://waze.com/ul?q=${enc(q)}&navigate=yes`;
/** Mapa incorporável em modo satélite com nomes de rua (t=h), sem chave. */
export const mapaEmbedUrl = (q: string) => `https://maps.google.com/maps?q=${enc(q)}&t=h&z=17&output=embed`;

/** "16:30:00" -> "16h30"; "16:00:00" -> "16h" */
export function formatHora(h: string | null) {
  if (!h) return null;
  const [hh, mm] = h.split(":");
  return mm && mm !== "00" ? `${Number(hh)}h${mm}` : `${Number(hh)}h`;
}

export function locaisDoEvento(e: {
  tipo: string;
  local: string | null;
  local_endereco: string | null;
  hora_evento: string | null;
  recepcao_local: string | null;
  recepcao_endereco: string | null;
  recepcao_hora: string | null;
}): Local[] {
  const temRecepcao = !!(e.recepcao_local || e.recepcao_endereco);
  const out: Local[] = [];
  if (e.local || e.local_endereco) {
    out.push({
      id: "cerimonia",
      titulo: temRecepcao ? "Cerimônia" : e.tipo === "casamento" ? "Cerimônia e festa" : "Local",
      nome: e.local,
      endereco: e.local_endereco,
      hora: e.hora_evento,
    });
  }
  if (temRecepcao) {
    out.push({ id: "recepcao", titulo: "Recepção", nome: e.recepcao_local, endereco: e.recepcao_endereco, hora: e.recepcao_hora });
  }
  return out;
}

/** Arquivo de agenda (.ics). Horário de Brasília = UTC-3 (sem horário de verão desde 2019). */
export function buildIcs(opts: { uid: string; titulo: string; data: string; hora: string | null; local: string; url: string }) {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  let dt: string[];
  if (opts.hora) {
    const [hh, mm] = opts.hora.split(":").map(Number);
    const start = new Date(`${opts.data}T00:00:00Z`);
    start.setUTCHours(hh + 3, mm); // BRT -> UTC
    const end = new Date(start.getTime() + 5 * 3600_000);
    const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    dt = [`DTSTART:${f(start)}`, `DTEND:${f(end)}`];
  } else {
    const d = opts.data.replace(/-/g, "");
    const next = new Date(`${opts.data}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    dt = [`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, "")}`];
  }
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Laco//Lista de presentes//PT",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${stamp}`,
    ...dt,
    `SUMMARY:${esc(opts.titulo)}`,
    `LOCATION:${esc(opts.local)}`,
    `URL:${opts.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
