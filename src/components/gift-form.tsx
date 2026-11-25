"use client";

import { useState } from "react";
import { saveGift } from "@/app/actions/gifts";
import { ImageUpload } from "@/components/image-upload";
import { SubmitButton } from "@/components/submit-button";
import { Field, Input, Select, Textarea } from "@/components/ui";
import { GIFT_TYPE_LABEL, type GiftItemRow, type GiftType } from "@/lib/types";

const HINTS: Record<GiftType, string> = {
  link: "O convidado compra na loja e marca aqui que já comprou.",
  cota: "Valor fixo pago via Pix. Ex.: “Jantar na lua de mel — R$ 250”.",
  meta: "O convidado escolhe quanto contribuir. Mostra barra de progresso.",
  pix_livre: "Botão para enviar qualquer valor via Pix.",
};

export function GiftForm({ eventId, gift }: { eventId: string; gift?: GiftItemRow }) {
  const [tipo, setTipo] = useState<GiftType>(gift?.tipo ?? "cota");
  const valor = gift?.valor_centavos != null ? (gift.valor_centavos / 100).toFixed(2).replace(".", ",") : "";

  return (
    <form action={saveGift} className="flex flex-col gap-5">
      <input type="hidden" name="event_id" value={eventId} />
      {gift && <input type="hidden" name="gift_id" value={gift.id} />}

      <Field label="Tipo de presente" hint={HINTS[tipo]}>
        <Select name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as GiftType)}>
          {Object.entries(GIFT_TYPE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome do presente">
          <Input name="titulo" defaultValue={gift?.titulo} required placeholder={tipo === "meta" ? "Viagem para Gramado" : ""} />
        </Field>
        {tipo !== "pix_livre" && (
          <Field
            label={tipo === "meta" ? "Valor da meta (R$)" : tipo === "link" ? "Preço de referência (R$)" : "Valor (R$)"}
            hint={tipo === "link" ? "Opcional" : undefined}
          >
            <Input name="valor" inputMode="decimal" defaultValue={valor} placeholder="250,00" required={tipo !== "link"} />
          </Field>
        )}
        {tipo === "link" && (
          <Field label="Link do produto" hint="Amazon, Magalu, Mercado Livre…">
            <Input name="url_externa" type="url" defaultValue={gift?.url_externa ?? ""} placeholder="https://" required />
          </Field>
        )}
        {(tipo === "cota" || tipo === "link") && (
          <Field label="Quantidade disponível" hint={tipo === "cota" ? "Vazio = ilimitado" : "Quantas unidades podem ser dadas"}>
            <Input
              name="quantidade"
              type="number"
              min={1}
              defaultValue={gift?.quantidade ?? (tipo === "link" ? 1 : "")}
            />
          </Field>
        )}
        <Field label="Ordem" hint="Menor aparece primeiro">
          <Input name="ordem" type="number" defaultValue={gift?.ordem ?? 0} />
        </Field>
        <Field label="Visível na página">
          <Select name="ativo" defaultValue={gift?.ativo === false ? "false" : "true"}>
            <option value="true">Sim</option>
            <option value="false">Não (oculto)</option>
          </Select>
        </Field>
      </div>

      <Field
        label="Descrição"
        hint={
          tipo === "pix_livre"
            ? "Opcional. Se este for o único presente visível, o convite mostra um bloco de destaque: a primeira frase vira a chamada e o resto aparece como texto. Pule uma linha entre os parágrafos."
            : "Opcional"
        }
      >
        <Textarea name="descricao" rows={tipo === "pix_livre" ? 10 : 3} defaultValue={gift?.descricao ?? ""} />
      </Field>

      <ImageUpload name="imagem_url" eventId={eventId} defaultValue={gift?.imagem_url} label="Foto do presente" />

      <div>
        <SubmitButton className="min-h-12 bg-ink px-6 font-medium text-paper" pendingLabel="Salvando…">
          Salvar presente
        </SubmitButton>
      </div>
    </form>
  );
}
