export type GiftType = "link" | "cota" | "meta" | "pix_livre";
export type EventType = "casamento" | "quinze_anos" | "bodas" | "outro";
export type ContributionStatus =
  | "pendente"
  | "aguardando_confirmacao"
  | "confirmado"
  | "recusado"
  | "expirado";
export type ContributionMethod = "pix_estatico" | "compra_externa" | "gateway";

export type EventRow = {
  id: string;
  slug: string;
  tipo: EventType;
  titulo: string;
  data_evento: string | null;
  local: string | null;
  historia: string | null;
  capa_url: string | null;
  tema: string;
  cor_principal: string;
  ativo: boolean;
};

export type EventFull = EventRow & {
  pix_chave: string | null;
  pix_nome: string | null;
  pix_cidade: string | null;
  payment_mode: "pix_estatico" | "gateway";
  criado_em: string;
};

export type GiftItemRow = {
  id: string;
  event_id: string;
  tipo: GiftType;
  titulo: string;
  descricao: string | null;
  imagem_url: string | null;
  valor_centavos: number | null;
  quantidade: number | null;
  url_externa: string | null;
  ordem: number;
  ativo?: boolean;
};

export type GiftProgress = {
  gift_item_id: string;
  confirmado_centavos: number;
  aguardando_centavos: number;
  reservas: number;
};

export type ContributionRow = {
  id: string;
  event_id: string;
  gift_item_id: string | null;
  convidado_nome: string;
  convidado_contato: string | null;
  mensagem: string | null;
  valor_base_centavos: number;
  valor_cobrado_centavos: number;
  metodo: ContributionMethod;
  status: ContributionStatus;
  expira_em: string;
  pago_em: string | null;
  confirmado_em: string | null;
  criado_em: string;
};

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  casamento: "Casamento",
  quinze_anos: "15 anos",
  bodas: "Bodas",
  outro: "Outro",
};

export const GIFT_TYPE_LABEL: Record<GiftType, string> = {
  link: "Produto de loja (link)",
  cota: "Presente virtual (cota)",
  meta: "Meta / vaquinha",
  pix_livre: "Pix com valor livre",
};
