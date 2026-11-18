import Link from "next/link";
import { notFound } from "next/navigation";
import { createContribution } from "@/app/actions/guest";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, Input, Textarea } from "@/components/ui";
import { formatBRL } from "@/lib/money";
import { getPublicEvent, getPublicGifts } from "@/lib/public-event";

export const dynamic = "force-dynamic";

export default async function PresentePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; giftId: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { slug, giftId } = await params;
  const { erro } = await searchParams;
  const event = await getPublicEvent(slug);
  if (!event) notFound();

  const gifts = await getPublicGifts(event.id);
  const found = giftId === "livre" ? null : gifts.find((g) => g.item.id === giftId);
  if (giftId !== "livre" && !found) notFound();

  const item = found?.item;
  const tipo = item?.tipo ?? "pix_livre";
  const valorLivre = tipo === "meta" || tipo === "pix_livre";
  const corTexto = "var(--cor-texto)";

  return (
    <main className="mx-auto max-w-lg px-3 pt-8 sm:px-4">
      <Link href={`/${slug}#presentes`} className="on-ground t-small inline-flex min-h-11 items-center hover:underline">
        ← Voltar para a lista
      </Link>

      <article className="tag rise mt-3 bg-paper">
        {item?.imagem_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imagem_url} alt="" className="aspect-[16/10] w-full object-cover" />
        )}
        <div className="p-6 sm:p-8">
          <h1 className="font-display t-head">{item?.titulo ?? "Presente em dinheiro"}</h1>
          {item?.descricao && <p className="mt-3 text-muted">{item.descricao}</p>}
          {item?.valor_centavos != null && tipo !== "meta" && (
            <p className="tabular t-lead mt-4 font-semibold">{formatBRL(item.valor_centavos)}</p>
          )}

          {!event.ativo ? (
            <p className="mt-6 bg-bg p-5 text-center">Prévia: o formulário e o Pix ficam disponíveis depois que a página for publicada.</p>
          ) : found?.esgotado ? (
            <p className="mt-6 bg-bg p-5 text-center">Esse presente já foi escolhido. Que tal outro da lista?</p>
          ) : (
            <form action={createContribution} className="mt-8 flex flex-col gap-5">
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="gift_id" value={giftId} />
              {/* Campo-isca contra robôs: pessoas não veem nem preenchem. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Site
                  <input type="text" name="site" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <Alert erro={erro} />

              {tipo === "link" && item?.url_externa && (
                <div className="bg-bg p-5">
                  <p className="font-medium">Primeiro, compre na loja</p>
                  <a
                    href={item.url_externa}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="press mt-3 inline-flex min-h-11 items-center px-5 font-medium"
                    style={{ background: "var(--cor)", color: corTexto }}
                  >
                    Abrir a loja ↗
                  </a>
                  <p className="mt-4 font-medium">Depois, conte aqui que você comprou:</p>
                </div>
              )}

              {valorLivre && (
                <Field label="Quanto você quer dar? (R$)" hint="Os centavos são ajustados para identificar o seu Pix no extrato.">
                  <Input name="valor" inputMode="decimal" placeholder="100" required />
                </Field>
              )}
              <Field label="Seu nome">
                <Input name="nome" autoComplete="name" required minLength={2} maxLength={80} />
              </Field>
              <Field label="Deixe um recado (opcional)">
                <Textarea name="mensagem" rows={3} maxLength={1000} />
              </Field>
              <Field label="WhatsApp ou e-mail (opcional)" hint="Só se quiser receber um agradecimento.">
                <Input name="contato" maxLength={120} />
              </Field>

              <SubmitButton
                className="mt-2 min-h-13 w-full px-5 py-3.5 font-medium"
                style={{ background: "var(--cor)", color: corTexto }}
                pendingLabel={tipo === "link" ? "Registrando…" : "Gerando o Pix…"}
              >
                {tipo === "link" ? "Já comprei este presente" : "Gerar o Pix"}
              </SubmitButton>
            </form>
          )}
        </div>
      </article>
    </main>
  );
}
