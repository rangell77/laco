import type { GiftType } from "@/lib/types";

/** Ideias prontas de presentes. Valores em centavos, só sugestão: o casal edita depois. */
export type Ideia = { id: string; grupo: string; tipo: GiftType; titulo: string; descricao: string; valor: number | null; quantidade?: number };

export const CATALOGO: Ideia[] = [
  // Lua de mel
  { id: "jantar-lua-de-mel", grupo: "Lua de mel", tipo: "cota", titulo: "Jantar na lua de mel", descricao: "Uma noite especial a dois, por nossa conta e por sua causa.", valor: 25000, quantidade: 4 },
  { id: "passeio-barco", grupo: "Lua de mel", tipo: "cota", titulo: "Passeio de barco", descricao: "Um dia no mar para guardar na memória.", valor: 18000, quantidade: 4 },
  { id: "drinks-praia", grupo: "Lua de mel", tipo: "cota", titulo: "Drinks na beira da praia", descricao: "Um brinde a vocês, com os pés na areia.", valor: 8000, quantidade: 6 },
  { id: "diaria-hotel", grupo: "Lua de mel", tipo: "cota", titulo: "Uma diária no hotel", descricao: "Mais um dia de descanso depois da festa.", valor: 45000, quantidade: 3 },
  { id: "spa-casal", grupo: "Lua de mel", tipo: "cota", titulo: "Spa para o casal", descricao: "Massagem para desfazer o nó da organização da festa.", valor: 30000, quantidade: 2 },
  { id: "passagens", grupo: "Lua de mel", tipo: "meta", titulo: "Passagens da lua de mel", descricao: "Ajude a gente a chegar lá.", valor: 600000 },
  // Casa nova
  { id: "primeira-feira", grupo: "Casa nova", tipo: "cota", titulo: "Primeira feira da casa", descricao: "Para encher a geladeira nova.", valor: 12000, quantidade: 5 },
  { id: "jogo-panelas", grupo: "Casa nova", tipo: "cota", titulo: "Jogo de panelas", descricao: "Para os primeiros almoços de domingo.", valor: 40000, quantidade: 1 },
  { id: "roupa-cama", grupo: "Casa nova", tipo: "cota", titulo: "Jogo de cama", descricao: "Lençóis macios para a casa nova.", valor: 22000, quantidade: 2 },
  { id: "cafeteira", grupo: "Casa nova", tipo: "cota", titulo: "Cafeteira", descricao: "Porque todo dia começa com café.", valor: 35000, quantidade: 1 },
  { id: "plantas", grupo: "Casa nova", tipo: "cota", titulo: "Plantas para a varanda", descricao: "Um pouco de verde para a casa.", valor: 9000, quantidade: 3 },
  { id: "sofa", grupo: "Casa nova", tipo: "meta", titulo: "Sofá da sala", descricao: "Onde vamos receber vocês.", valor: 400000 },
  { id: "geladeira", grupo: "Casa nova", tipo: "meta", titulo: "Geladeira nova", descricao: "Para guardar os doces que sobrarem da festa.", valor: 450000 },
  // Momentos
  { id: "noite-cinema", grupo: "Momentos", tipo: "cota", titulo: "Noite de cinema com pipoca", descricao: "Ingressos e pipoca grande, sem dividir.", valor: 10000, quantidade: 5 },
  { id: "aula-danca", grupo: "Momentos", tipo: "cota", titulo: "Aula de dança", descricao: "Para a gente acertar o passo da valsa.", valor: 15000, quantidade: 2 },
  { id: "show", grupo: "Momentos", tipo: "cota", titulo: "Ingressos para um show", descricao: "A trilha sonora do primeiro ano.", valor: 30000, quantidade: 2 },
  { id: "pet", grupo: "Momentos", tipo: "cota", titulo: "Ração do pet por um mês", descricao: "Ele também agradece.", valor: 15000, quantidade: 3 },
  { id: "aniversario-1", grupo: "Momentos", tipo: "cota", titulo: "Jantar de 1 ano de casados", descricao: "Já reservando a comemoração.", valor: 30000, quantidade: 1 },
  // 15 anos
  { id: "vestido-valsa", grupo: "15 anos", tipo: "meta", titulo: "Vestido da valsa", descricao: "Para a noite mais esperada.", valor: 250000 },
  { id: "viagem-15", grupo: "15 anos", tipo: "meta", titulo: "Viagem dos 15 anos", descricao: "Um sonho antigo que pode virar realidade.", valor: 800000 },
  { id: "curso", grupo: "15 anos", tipo: "cota", titulo: "Curso de idiomas", descricao: "Um presente para o futuro.", valor: 30000, quantidade: 4 },
  { id: "camera", grupo: "15 anos", tipo: "cota", titulo: "Câmera instantânea", descricao: "Para registrar a festa do meu jeito.", valor: 50000, quantidade: 1 },
  // Livres
  { id: "pix-livre", grupo: "Valor livre", tipo: "pix_livre", titulo: "Presente em dinheiro", descricao: "Qualquer valor, do jeito que o seu coração mandar.", valor: null },
  { id: "fundo-sonhos", grupo: "Valor livre", tipo: "meta", titulo: "Fundo dos sonhos", descricao: "Para o que a vida a dois pedir primeiro.", valor: 1000000 },
];
