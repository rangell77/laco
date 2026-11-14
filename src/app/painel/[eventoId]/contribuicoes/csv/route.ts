import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STATUS: Record<string, string> = {
  aguardando_confirmacao: "Aguardando confirmação",
  confirmado: "Confirmado",
  recusado: "Não recebido",
  expirado: "Expirado",
  pendente: "Pendente",
};

function cell(v: unknown) {
  const s = v == null ? "" : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Lista de presentes recebidos, para o cliente montar os agradecimentos. */
export async function GET(_req: Request, { params }: { params: Promise<{ eventoId: string }> }) {
  const { eventoId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Não autorizado", { status: 401 });

  // RLS garante que só admin ou membro do evento recebe linhas.
  const { data, error } = await supabase
    .from("contributions")
    .select("convidado_nome, convidado_contato, mensagem, valor_base_centavos, valor_cobrado_centavos, metodo, status, pago_em, criado_em, gift_items(titulo)")
    .eq("event_id", eventoId)
    .neq("status", "pendente")
    .order("criado_em");
  if (error) return new NextResponse("Erro", { status: 500 });

  const header = ["Nome", "Contato", "Presente", "Forma", "Valor (R$)", "Valor no extrato (R$)", "Status", "Data", "Recado"];
  const lines = (data ?? []).map((c) => {
    const gift = c.gift_items as unknown as { titulo: string } | null;
    return [
      c.convidado_nome,
      c.convidado_contato,
      gift?.titulo ?? "Pix livre",
      c.metodo === "compra_externa" ? "Loja" : "Pix",
      (c.valor_base_centavos / 100).toFixed(2).replace(".", ","),
      (c.valor_cobrado_centavos / 100).toFixed(2).replace(".", ","),
      STATUS[c.status] ?? c.status,
      new Date(c.pago_em ?? c.criado_em).toLocaleString("pt-BR"),
      c.mensagem,
    ]
      .map(cell)
      .join(";");
  });

  // BOM + ";" para o Excel em português abrir certinho.
  const csv = "﻿" + [header.join(";"), ...lines].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="presentes.csv"`,
    },
  });
}
