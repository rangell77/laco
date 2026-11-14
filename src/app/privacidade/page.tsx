import Link from "next/link";
import { Monogram } from "@/components/ui";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "Privacidade" };

export default function PrivacidadePage() {
  return (
    <main className="px-3 py-10">
      <Link href="/" className="mx-auto flex w-fit items-center gap-2">
        <Monogram className="h-8 w-12" />
        <span className="font-display text-4xl">{BRAND.nome}</span>
      </Link>
      <article className="mx-auto mt-10 max-w-[68ch] bg-paper px-6 py-10 sm:px-12">
        <h1 className="font-display text-6xl">Privacidade</h1>
        <p className="mt-6">
          O {BRAND.nome} guarda o mínimo para a lista funcionar, seguindo a Lei Geral de Proteção de Dados (LGPD).
        </p>
        <h2 className="mt-8 text-[1.25rem] font-semibold">O que guardamos de quem presenteia</h2>
        <p className="mt-2">
          O nome, o recado e, se você quiser, um WhatsApp ou e-mail para receber agradecimento. Não pedimos CPF, endereço
          nem dados do cartão ou do banco. O Pix é feito no app do seu banco, direto para a conta dos anfitriões.
        </p>
        <h2 className="mt-8 text-[1.25rem] font-semibold">Quem vê esses dados</h2>
        <p className="mt-2">
          Só os anfitriões do evento e o celebrante que organiza a lista. A página pública mostra apenas o total arrecadado
          de cada presente, sem nomes.
        </p>
        <h2 className="mt-8 text-[1.25rem] font-semibold">Por quanto tempo</h2>
        <p className="mt-2">
          Enquanto a lista existir. Os anfitriões podem pedir a exclusão do evento a qualquer momento, o que apaga
          presentes, nomes e recados.
        </p>
        <h2 className="mt-8 text-[1.25rem] font-semibold">Seus direitos</h2>
        <p className="mt-2">
          Você pode pedir para ver, corrigir ou apagar os seus dados
          {BRAND.email ? (
            <>
              {" "}
              pelo e-mail <a className="underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            </>
          ) : (
            " falando com os anfitriões ou com o celebrante"
          )}
          .
        </p>
      </article>
    </main>
  );
}
