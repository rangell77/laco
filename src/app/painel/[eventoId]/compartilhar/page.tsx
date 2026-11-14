import QRCode from "qrcode";
import { CopyButton } from "@/components/copy-button";
import { requireEventAccess } from "@/lib/auth";
import { buildPixPayload } from "@/lib/pix";

export default async function CompartilharPage({ params }: { params: Promise<{ eventoId: string }> }) {
  const { eventoId } = await params;
  const { event } = await requireEventAccess(eventoId);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${event.slug}`;
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 600, color: { dark: "#181715", light: "#ffffff" } });
  const mensagem = `Oi! Preparamos uma lista de presentes para ${event.titulo}. Se quiser nos presentear, é só acessar: ${url}`;

  // Pix de teste de R$ 0,01 para o casal conferir nome e chave antes de divulgar.
  const pixOk = event.pix_chave && event.pix_nome && event.pix_cidade;
  const teste = pixOk
    ? buildPixPayload({ chave: event.pix_chave!, nome: event.pix_nome!, cidade: event.pix_cidade!, valorCentavos: 1, txid: "TESTE" })
    : null;
  const qrTeste = teste ? await QRCode.toDataURL(teste, { margin: 1, width: 480 }) : null;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <section className="flex flex-col gap-4 bg-paper p-5 sm:p-6">
        <h2 className="font-display text-4xl">Link da lista</h2>
        <p className="break-all bg-bg px-4 py-3">{url}</p>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={url} label="Copiar link" />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex min-h-11 items-center bg-[#1f7a4d] px-5 text-[0.9375rem] font-medium text-white"
          >
            Enviar no WhatsApp
          </a>
        </div>
        <h3 className="mt-2 font-semibold">Mensagem pronta</h3>
        <p className="bg-bg px-4 py-3">{mensagem}</p>
        <CopyButton text={mensagem} label="Copiar mensagem" className="self-start" />
      </section>

      <section className="flex flex-col gap-4 bg-paper p-5 sm:p-6">
        <h2 className="font-display text-4xl">QR Code para o convite</h2>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="QR Code do link da lista" width={240} height={240} className="w-60 bg-white p-2" />
        <a href={qr} download={`qrcode-${event.slug}.png`} className="press inline-flex min-h-11 items-center self-start bg-surface px-5 text-[0.9375rem] font-medium">
          Baixar o QR Code
        </a>
      </section>

      <section className="flex flex-col gap-4 bg-paper p-5 sm:p-6 lg:col-span-2">
        <h2 className="font-display text-4xl">Pix de teste</h2>
        {teste && qrTeste ? (
          <div className="grid items-start gap-5 sm:grid-cols-[auto_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrTeste} alt="QR Code do Pix de teste de 1 centavo" width={192} height={192} className="w-48 bg-white p-2" />
            <div className="flex flex-col gap-3">
              <p className="max-w-[56ch]">
                Antes de divulgar, pague este Pix de <b>R$ 0,01</b> pelo app do banco. Confira se aparece o nome{" "}
                <b>{event.pix_nome}</b> e se o centavo cai na conta certa.
              </p>
              <CopyButton text={teste} label="Copiar código de teste" className="self-start" />
            </div>
          </div>
        ) : (
          <p className="text-muted">Preencha chave Pix, nome e cidade do recebedor na aba Página para gerar o teste.</p>
        )}
      </section>
    </div>
  );
}
