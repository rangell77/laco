import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { markPaid } from "@/app/actions/guest";
import { CopyButton } from "@/components/copy-button";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";
import { readableOn } from "@/lib/color";
import { formatBRL } from "@/lib/money";
import { buildPixPayload } from "@/lib/pix";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function PixPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { slug, id } = await params;
  const { erro } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const db = createAdminClient();
  const { data: c } = await db
    .from("contributions")
    .select(
      "id, status, metodo, valor_cobrado_centavos, expira_em, convidado_nome, events!inner(slug, ativo, cor_principal, pix_chave, pix_nome, pix_cidade), gift_items(titulo)",
    )
    .eq("id", id)
    .eq("events.slug", slug)
    .maybeSingle();
  if (!c || c.metodo !== "pix_estatico") notFound();

  const event = c.events as unknown as {
    slug: string;
    ativo: boolean;
    cor_principal: string;
    pix_chave: string;
    pix_nome: string;
    pix_cidade: string;
  };
  const gift = c.gift_items as unknown as { titulo: string } | null;
  if (!event.ativo) notFound();
  if (c.status === "aguardando_confirmacao" || c.status === "confirmado") redirect(`/${slug}/obrigado`);

  const expirado = c.status !== "pendente" || new Date(c.expira_em) < new Date();
  const corTexto = readableOn(event.cor_principal);

  const payload = buildPixPayload({
    chave: event.pix_chave,
    nome: event.pix_nome,
    cidade: event.pix_cidade,
    valorCentavos: c.valor_cobrado_centavos,
    txid: c.id.replace(/-/g, "").slice(0, 25),
  });
  const qr = await QRCode.toDataURL(payload, { margin: 1, width: 560, color: { dark: "#181715", light: "#ffffff" } });
  const [reais, centavos] = formatBRL(c.valor_cobrado_centavos).split(",");

  return (
    <main className="mx-auto max-w-md px-3 pt-8 sm:px-4">
      <Link href={`/${slug}#presentes`} className="on-ground t-small inline-flex min-h-11 items-center hover:underline">
        ← Voltar para a lista
      </Link>

      {/* O comprovante: papel com pé em zigue-zague */}
      <article className="edge-zigzag rise mt-3 bg-paper px-6 pt-8 text-center sm:px-8">
        <p className="font-medium">{gift?.titulo ?? "Presente em dinheiro"}</p>
        <p className="t-small text-muted">de {c.convidado_nome}</p>
        <p className="tabular font-display mt-5 text-[clamp(3.5rem,14vw,5rem)] normal-case">
          {reais},<span style={{ color: "var(--cor)" }}>{centavos}</span>
        </p>
        <p className="t-small mx-auto mt-2 max-w-[32ch]">
          Pague exatamente este valor. Os centavos identificam o seu presente no extrato.
        </p>

        {expirado ? (
          <div className="mt-6 pb-8">
            <Alert erro="Este Pix expirou. Volte à lista e gere um novo, por favor." />
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR Code do Pix" width={280} height={280} className="mx-auto mt-6 w-64 bg-white p-2" />
            <p className="t-small mt-3 text-muted">Escaneie no app do banco, ou copie o código:</p>
            <p className="t-small mt-3 max-h-24 overflow-auto break-all bg-bg p-3 text-left">{payload}</p>
            <CopyButton text={payload} label="Copiar código Pix" className="mt-3 min-h-12 w-full" />

            <form action={markPaid} className="mt-8 pb-10">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="contribution_id" value={c.id} />
              <Alert erro={erro} />
              <p aria-hidden className="mb-5 overflow-hidden whitespace-nowrap text-muted">
                - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              </p>
              <p className="mb-3">Depois de pagar no app do banco, toque aqui:</p>
              <SubmitButton
                className="min-h-13 w-full px-5 py-3.5 font-medium"
                style={{ background: "var(--cor)", color: corTexto }}
                pendingLabel="Avisando os anfitriões…"
              >
                Já paguei
              </SubmitButton>
              <p className="t-small mt-3 text-muted">O pedido vale por 24 horas.</p>
            </form>
          </>
        )}
      </article>
    </main>
  );
}
