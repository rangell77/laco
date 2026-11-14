import Image from "next/image";
import Link from "next/link";
import { ConviteVivo } from "@/components/landing/convite-vivo";
import { Trilho } from "@/components/landing/trilho";
import { Monogram } from "@/components/ui";
import { BRAND, whatsappLink } from "@/lib/brand";

const ZAP = whatsappLink(`Oi! Quero a lista de presentes ${BRAND.nome} para a nossa celebração.`);

const FOTOS = {
  casamento: { src: "/landing/casamento-1920.jpg", w: 1000, h: 739 },
  schmidt: { src: "/landing/casamento-schmidt-1920.jpg", w: 1000, h: 744 },
  buque: { src: "/landing/buque-grama.jpg", w: 1920, h: 2560 },
  bogdani: { src: "/landing/buque-bogdani.jpg", w: 1920, h: 2539 },
  zernichow: { src: "/landing/flores-zernichow.jpg", w: 1200, h: 1145 },
};

const MOMENTOS = [
  {
    titulo: "O celebrante abre a página",
    texto: "No dia em que vocês fecham a cerimônia, a lista ganha um endereço com os nomes de vocês.",
    foto: FOTOS.casamento,
    pos: "35% 50%",
    vao: "h-24",
  },
  {
    titulo: "Vocês escolhem os presentes",
    texto: "Cotas da lua de mel, uma meta para a viagem, produtos de loja ou um Pix de valor livre.",
    foto: FOTOS.buque,
    pos: "50% 40%",
    vao: "h-8",
  },
  {
    titulo: "O link vai no WhatsApp",
    texto: "Mensagem pronta e QR Code para o convite impresso. A foto e os nomes aparecem na prévia.",
    foto: FOTOS.zernichow,
    pos: "50% 50%",
    vao: "h-32",
  },
  {
    titulo: "O convidado escolhe e paga",
    texto: "Sem cadastro e sem senha: nome, recado e o Pix na tela. Leva menos de um minuto.",
    foto: FOTOS.schmidt,
    pos: "50% 45%",
    vao: "h-14",
  },
  {
    titulo: "Os centavos dizem quem foi",
    texto: "Cada Pix sai com centavos só dele, como R$ 250,37. No extrato, vocês sabem de quem é.",
    foto: FOTOS.bogdani,
    pos: "50% 30%",
    vao: "h-28",
  },
  {
    titulo: "Vocês confirmam e agradecem",
    texto: "Um toque confirma o presente. No fim, nomes e recados saem em PDF para os agradecimentos.",
    foto: FOTOS.casamento,
    pos: "62% 40%",
    vao: "h-10",
  },
];

const COMPROVANTES = [
  { item: "Jantar na lua de mel", valor: "R$ 250,37", de: "Marina C.", recado: "Que a vida a dois seja leve e cheia de mesa posta.", status: "Pix · confirmado", h: "h-[40svh]", rot: "-rotate-1" },
  { item: "Passeio de barco", valor: "R$ 180,12", de: "Tio Beto", recado: "Cota 2 de 4. Levem protetor!", status: "Pix · confirmado", h: "h-[30svh]", rot: "" },
  { item: "Viagem para Gramado", valor: "R$ 300,58", de: "Família Souza", recado: "Para o fondue do primeiro inverno.", status: "Pix · aguardando", h: "h-[44svh]", rot: "rotate-2" },
  { item: "Air fryer", valor: "R$ 459,90", de: "Carla e Pedro", recado: "Compramos na loja, chega até sexta.", status: "Loja · já comprado", h: "h-[34svh]", rot: "" },
  { item: "Presente em dinheiro", valor: "R$ 100,41", de: "Dona Lúcia", recado: "Com todo o carinho da vizinha do 302.", status: "Pix · confirmado", h: "h-[38svh]", rot: "-rotate-2" },
  { item: "Primeira feira da casa", valor: "R$ 120,09", de: "Rafa", recado: "Que nunca falte café.", status: "Pix · confirmado", h: "h-[28svh]", rot: "" },
];

const CARDAPIO = [
  {
    grupo: "Para quem presenteia",
    itens: [
      { nome: "Página com a cara de vocês", desc: "Foto de capa, história, cor e tema.", valor: "incluso" },
      { nome: "Pix na hora", desc: "QR Code e copia e cola com o valor exato.", valor: "sem cadastro" },
      { nome: "Produtos de loja", desc: "Compra no site da loja e avisa na lista.", valor: "1 toque" },
    ],
  },
  {
    grupo: "Para o casal",
    itens: [
      { nome: "Quatro tipos de presente", desc: "Cota, meta com barra, produto de loja e valor livre.", valor: "ilimitados" },
      { nome: "Painel de confirmação", desc: "Aguardando, confirmados e não recebidos, separados.", valor: "no celular" },
      { nome: "Lista para agradecer", desc: "Nomes, recados e valores em PDF ou planilha.", valor: "PDF e CSV" },
      { nome: "Ideias prontas", desc: "Sugestões de presentes para adicionar com um clique.", valor: "24 ideias" },
    ],
  },
  {
    grupo: "Para o celebrante",
    itens: [
      { nome: "Todas as listas num lugar", desc: "Eventos, totais confirmados e pendências.", valor: "painel" },
      { nome: "Publica quando estiver pronta", desc: "Fica em rascunho até o Pix ser conferido.", valor: "controle" },
    ],
  },
];

const RECIBO = [
  ["Página personalizada", "incluso"],
  ["Presentes ilimitados", "incluso"],
  ["QR Code para o convite", "incluso"],
  ["Taxa por Pix recebido", "nenhuma"],
  ["Dinheiro retido no caminho", "nenhum"],
];

const PERGUNTAS = [
  ["O dinheiro passa pelo Laço?", "Não. O Pix vai direto para a chave de vocês, como uma transferência comum. Nada fica retido no caminho."],
  ["O convidado precisa criar conta?", "Não. Ele informa o nome, deixa um recado se quiser e paga no app do banco."],
  ["Como sei quem mandou cada Pix?", "Cada pagamento sai com centavos únicos, como R$ 250,37. É só bater o valor no extrato e confirmar no painel."],
  ["E se alguém clicar em “Já paguei” sem pagar?", "O presente fica aguardando até vocês conferirem. Se não caiu, um toque em “Não recebi” devolve o item à lista."],
  ["Posso colocar produtos de lojas?", "Sim. O convidado compra no site da loja, avisa na lista e o item aparece como presenteado."],
  ["Dá para fazer vaquinha?", "Sim. A meta mostra uma barra com o quanto já foi confirmado, sem expor quem deu quanto."],
  ["Serve para 15 anos e bodas?", "Serve para qualquer celebração: casamento, 15 anos, bodas e chá de casa nova."],
  ["Quem edita a página?", "Vocês mesmos, pelo painel: fotos, textos, cor e presentes, quantas vezes quiserem."],
  ["Um Pix esquecido fica preso?", "Não. Se o convidado gerar o Pix e não pagar, o pedido expira em 24 horas e o presente volta para a lista."],
  ["Meus convidados ficam expostos?", "Não. Guardamos só nome, recado e o contato que o convidado quiser deixar, e só vocês veem."],
];

export default function Home() {
  return (
    <>
      <div className="relative z-10 bg-bg">
        {/* ---------------- Capa: o convite ---------------- */}
        <header className="relative h-[100svh] min-h-[680px] overflow-hidden bg-field">
          <Image
            src={FOTOS.casamento.src}
            alt="Fotografia de casamento por volta de 1920: noivos, dama e padrinho com buquês"
            fill
            priority
            sizes="100vw"
            className="drift object-cover opacity-55 grayscale"
            style={{ objectPosition: "50% 35%" }}
          />
          <nav className="relative z-10 flex items-center justify-between gap-4 px-4 pt-5 text-field-ink sm:px-7 sm:pt-7">
            <Link href="/" className="flex items-center gap-2" aria-label={`${BRAND.nome}, início`}>
              <Monogram className="h-8 w-12" />
              <span className="font-display t-lead">{BRAND.nome}</span>
            </Link>
            <ul className="t-small hidden gap-8 md:flex">
              <li><a href="#como" className="hover:underline">Como funciona</a></li>
              <li><a href="#lista" className="hover:underline">O que vem</a></li>
              <li><a href="#perguntas" className="hover:underline">Perguntas</a></li>
            </ul>
            <a href={ZAP} target="_blank" rel="noopener noreferrer" className="press t-small bg-accent px-4 py-2.5 font-medium text-ink hover:bg-[#d4b246]">
              Quero minha lista
            </a>
          </nav>

          <div className="card-scallop rise absolute inset-x-3 -bottom-10 top-24 px-6 pt-14 text-ink sm:inset-x-0 sm:bottom-auto sm:top-[140px] sm:mx-auto sm:aspect-[5/7] sm:w-[min(640px,52vw)] sm:px-14 sm:pt-16">
            <ConviteVivo dominio={BRAND.dominio} />
          </div>
        </header>

        {/* ---------------- Como funciona ---------------- */}
        <section id="como" className="pt-28 sm:pt-40" aria-labelledby="como-t">
          <Trilho titulo={<h2 id="como-t" className="font-display t-head">Do convite ao Pix</h2>}>
            {MOMENTOS.map((m, i) => (
              <article key={m.titulo} className="reveal flex w-[72vw] shrink-0 snap-start flex-col sm:w-[280px]" style={{ ["--i" as string]: i % 3 }}>
                <h3 className="t-body font-semibold leading-snug">{m.titulo}</h3>
                <p className="t-small mt-2 text-muted">{m.texto}</p>
                <div className={`${m.vao} shrink-0`} />
                <div className="relative mt-auto aspect-[4/5] overflow-hidden bg-surface">
                  <Image src={m.foto.src} alt="" fill sizes="(min-width: 640px) 280px, 72vw" className="object-cover grayscale-[35%]" style={{ objectPosition: m.pos }} />
                </div>
              </article>
            ))}
          </Trilho>
        </section>

        {/* ---------------- Comprovantes ---------------- */}
        <section className="relative mt-32 h-[100svh] min-h-[680px] overflow-hidden bg-field sm:mt-48 sm:h-[96svh]" aria-labelledby="pix-t">
          <Image src={FOTOS.schmidt.src} alt="Fotografia de casamento de 1920, noivos e padrinhos posando em estúdio" fill sizes="100vw" className="drift object-cover grayscale" style={{ objectPosition: "50% 30%" }} />
          <div className="absolute inset-0 bg-black/45" />
          <div className="reveal relative px-4 pt-20 text-field-ink sm:ml-[18%] sm:max-w-[40ch] sm:px-0 sm:pt-28">
            <h2 id="pix-t" className="font-display t-head">Cada Pix tem nome</h2>
            <p className="t-lead mt-5">
              O dinheiro cai direto na conta de vocês, sem taxa. Os centavos mostram no extrato quem enviou cada presente.
            </p>
          </div>
          <ul className="absolute inset-x-0 bottom-0 flex items-end gap-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Exemplos de presentes recebidos">
            {COMPROVANTES.map((c, i) => (
              <li
                key={c.item}
                className={`reveal ${c.h} ${c.rot} t-small w-[44vw] min-w-[160px] shrink-0 origin-bottom bg-paper p-4 text-ink sm:w-auto sm:min-w-0 sm:flex-1`}
                style={{ ["--i" as string]: i }}
              >
                <p className="font-semibold">{c.item}</p>
                <p aria-hidden className="mt-1 overflow-hidden whitespace-nowrap text-muted">- - - - - - - - - - - - - - - - - -</p>
                <p className="tabular t-body mt-1 font-semibold">{c.valor}</p>
                <p className="mt-1">de {c.de}</p>
                <p className="mt-2 text-muted">“{c.recado}”</p>
                <p className="mt-2 font-medium">{c.status}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- O que vem: cardápio ---------------- */}
        <section id="lista" className="bg-surface px-3 py-28 sm:px-8 sm:py-44" aria-labelledby="lista-t">
          <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1fr_minmax(0,580px)]">
            <div className="relative hidden aspect-[3/4] overflow-hidden lg:block reveal">
              <Image src={FOTOS.buque.src} alt="Pintura de um buquê de flores, guache sobre papel" fill sizes="40vw" className="object-cover" />
            </div>
            <div className="reveal edge-zigzag bg-paper px-5 pt-12 sm:px-12" style={{ ["--i" as string]: 1 }}>
              <h2 id="lista-t" className="font-display t-head text-center">O que vem na lista</h2>
              <div className="mt-10 flex flex-col gap-11 pb-10">
                {CARDAPIO.map((g) => (
                  <div key={g.grupo}>
                    <h3 className="t-lead font-semibold">{g.grupo}</h3>
                    <ul className="mt-4 flex flex-col gap-[18px]">
                      {g.itens.map((it) => (
                        <li key={it.nome}>
                          <div className="flex items-end">
                            <span>{it.nome}</span>
                            <span className="dot-leader" aria-hidden />
                            <span className="whitespace-nowrap font-medium">{it.valor}</span>
                          </div>
                          <p className="t-small mt-0.5 max-w-[34ch] text-muted">{it.desc}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Quanto custa: recibo ---------------- */}
        <section className="overflow-hidden bg-bg px-4 sm:px-8" aria-labelledby="preco-t">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
            <div className="reveal pt-24 lg:col-span-6 lg:pt-36">
              <h2 id="preco-t" className="font-display t-head">Quanto custa</h2>
              <p className="mt-6 max-w-[46ch]">
                A lista faz parte do pacote de celebração. O Pix vai direto para a conta de vocês: o {BRAND.nome} não toca
                no dinheiro e não cobra nada por presente recebido.
              </p>
              <a href={ZAP} target="_blank" rel="noopener noreferrer" className="press mt-8 hidden bg-ink px-6 py-3.5 font-medium text-paper hover:bg-[#33312d] lg:inline-flex">
                Pedir a minha lista
              </a>
            </div>
            <div className="lg:col-span-4 lg:col-start-8">
              <div className="reveal edge-zigzag mx-auto w-[86%] bg-paper px-7 pt-12 sm:w-[380px] lg:pt-36" style={{ ["--i" as string]: 1 }}>
                <p className="t-lead text-center font-semibold">{BRAND.nome} · lista de presentes</p>
                <ul className="tabular mt-6 flex flex-col gap-3.5">
                  {RECIBO.map(([d, v]) => (
                    <li key={d} className="flex justify-between gap-4">
                      <span>{d}</span>
                      <span className="whitespace-nowrap">{v}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 h-1 bg-ink" />
                <p className="tabular t-lead mt-4 flex items-baseline justify-between gap-4 pb-10 font-semibold">
                  <span>Custo para os noivos</span>
                  <span className="whitespace-nowrap">R$ 0,00</span>
                </p>
              </div>
              <a href={ZAP} target="_blank" rel="noopener noreferrer" className="press mx-auto mt-6 flex h-[52px] w-[86%] items-center justify-center bg-ink font-medium text-paper lg:hidden">
                Pedir a minha lista
              </a>
            </div>
          </div>
        </section>

        {/* ---------------- Perguntas ---------------- */}
        <section id="perguntas" className="bg-bg px-5 py-28 sm:px-8 sm:py-44" aria-labelledby="faq-t">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12">
            <h2 id="faq-t" className="reveal font-display t-head lg:col-span-3">Perguntas</h2>
            <div className="reveal gap-14 lg:col-span-8 lg:col-start-5 lg:columns-2" style={{ ["--i" as string]: 1 }}>
              {PERGUNTAS.map(([p, r]) => (
                <p key={p} className="mb-5 break-inside-avoid">
                  <span className="font-semibold">{p}</span> {r}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Chamada: o cartão-resposta ---------------- */}
        <section className="relative overflow-hidden bg-field px-4 pb-0 pt-24 text-field-ink sm:min-h-[80svh] sm:px-8 sm:pt-0" aria-labelledby="cta-t">
          <div className="mx-auto grid max-w-6xl gap-10 sm:min-h-[80svh] lg:grid-cols-12">
            <p className="reveal t-lead max-w-[28ch] lg:col-span-4 lg:self-end lg:pb-16">
              A lista vai junto com o convite. Quanto antes ela estiver no ar, mais tempo os convidados têm para escolher.
            </p>
            <div className="lg:col-span-7 lg:col-start-6 lg:self-end">
              <div className="reveal mx-auto -mb-16 w-[90%] rotate-1 bg-paper px-6 pb-24 pt-10 text-center text-ink sm:aspect-[7/5] sm:w-full sm:rotate-2 sm:px-12 sm:pt-14" style={{ ["--i" as string]: 1 }}>
                <Monogram className="mx-auto h-9 w-14" />
                <h2 id="cta-t" className="font-display t-head mt-5">Quero a minha</h2>
                <p className="mx-auto mt-4 max-w-[40ch]">
                  Mande os nomes e a data da celebração. {cap(BRAND.celebrante)} prepara a página e envia o acesso de vocês.
                </p>
                <a href={ZAP} target="_blank" rel="noopener noreferrer" className="press mt-8 flex h-14 w-full items-center justify-center bg-ink font-medium text-paper hover:bg-[#33312d]">
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ---------------- Rodapé: o verso do cartão ---------------- */}
      <footer className="bg-field px-3 pt-28 sm:px-8">
        <div className="edge-scallop-top mx-auto max-w-5xl bg-paper px-6 pb-6 pt-16 sm:px-12">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <p className="font-display t-head">Com carinho,</p>
              <p className="mt-4 max-w-[36ch]">
                {BRAND.nome} é a lista de presentes que vem junto com a cerimônia. Pix direto na conta de quem celebra, com
                o nome de cada convidado.
              </p>
            </div>
            <div className="relative">
              <div className="absolute right-0 top-0 hidden w-[88px] bg-paper p-1.5 ring-0 sm:block">
                <div className="relative aspect-[3/4]">
                  <Image src={FOTOS.zernichow.src} alt="" fill sizes="88px" className="object-cover" />
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                <li><a href={ZAP} target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp</a></li>
                {BRAND.email && <li><a href={`mailto:${BRAND.email}`} className="hover:underline">{BRAND.email}</a></li>}
                <li><Link href="/login" className="hover:underline">Entrar no painel</Link></li>
                <li><Link href="/privacidade" className="hover:underline">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <p className="t-small mt-14 text-center text-muted">
            © {new Date().getFullYear()} {BRAND.nome}. Imagens de domínio público via Wikimedia Commons:{" "}
            <a className="underline" href="https://commons.wikimedia.org/wiki/File:StateLibQld_1_80359_Queensland_wedding_party,_ca._1920s.jpg">casamento em Queensland, c. 1920</a>,{" "}
            <a className="underline" href="https://commons.wikimedia.org/wiki/File:StateLibQld_2_178891_Wedding_party_of_Hermann_and_Dora_Schmidt,_1920.jpg">casamento de Hermann e Dora Schmidt, 1920</a>{" "}
            (State Library of Queensland),{" "}
            <a className="underline" href="https://commons.wikimedia.org/w/index.php?curid=77352956">buquê sobre a grama</a> (CC0),{" "}
            <a className="underline" href="https://commons.wikimedia.org/wiki/File:Jakub_Bogdan_-_Still_Life_with_Flower_Bouquet_and_Fruit_-_O_389_-_Slovak_National_Gallery.jpg">Jakob Bogdani</a> e{" "}
            <a className="underline" href="https://commons.wikimedia.org/wiki/File:Cathrine_Helene_Zernichow_Still_life_with_a_bouquet_of_wild_flowers_on_a_table.jpg">Cathrine Helene Zernichow</a>.
          </p>
        </div>
      </footer>
    </>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
