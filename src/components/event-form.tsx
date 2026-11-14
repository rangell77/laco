import { ImageUpload } from "@/components/image-upload";
import { SubmitButton } from "@/components/submit-button";
import { Field, Input, Select, Textarea } from "@/components/ui";
import { TEMAS } from "@/lib/brand";
import { EVENT_TYPE_LABEL, type EventFull } from "@/lib/types";

/** Formulário de evento, usado no admin (com link) e no painel do cliente. */
export function EventForm({
  action,
  event,
  isAdmin,
  back,
  submitLabel = "Salvar",
}: {
  action: (fd: FormData) => Promise<void>;
  event?: EventFull;
  isAdmin: boolean;
  back?: string;
  submitLabel?: string;
}) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "");
  const temaAtual = event?.tema ?? "classico";
  return (
    <form action={action} className="flex flex-col gap-10">
      {event && <input type="hidden" name="event_id" value={event.id} />}
      {back && <input type="hidden" name="back" value={back} />}

      <fieldset className="grid min-w-0 gap-5 sm:grid-cols-2">
        <legend className="font-display mb-5 text-4xl">O evento</legend>
        <Field label="Título" hint='Ex.: "Ana & João" ou "15 anos da Maria"'>
          <Input name="titulo" defaultValue={event?.titulo} required maxLength={80} />
        </Field>
        <Field label="Tipo">
          <Select name="tipo" defaultValue={event?.tipo ?? "casamento"}>
            {Object.entries(EVENT_TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        {isAdmin && (
          <Field label="Link da página" hint={`${siteUrl}/${event?.slug ?? "ana-e-joao"}. Vazio gera pelo título.`}>
            <Input name="slug" defaultValue={event?.slug} placeholder="ana-e-joao" pattern="[a-z0-9-]*" />
          </Field>
        )}
        <Field label="Data do evento">
          <Input name="data_evento" type="date" defaultValue={event?.data_evento ?? ""} />
        </Field>
        <Field label="Local">
          <Input name="local" defaultValue={event?.local ?? ""} placeholder="Espaço Jardim, São Paulo" maxLength={120} />
        </Field>
      </fieldset>

      <fieldset className="flex min-w-0 flex-col gap-5">
        <legend className="font-display mb-5 text-4xl">A página</legend>
        <Field label="Mensagem para os convidados" hint="Aparece logo abaixo do convite. Duas ou três frases funcionam melhor.">
          <Textarea name="historia" rows={4} defaultValue={event?.historia ?? ""} maxLength={1200} />
        </Field>
        <ImageUpload name="capa_url" eventId={event?.id} defaultValue={event?.capa_url} label="Foto de capa" />
        <div>
          <p className="text-[0.95rem] font-medium">Tema</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.entries(TEMAS).map(([id, t]) => (
              <label key={id} className="press flex cursor-pointer flex-col gap-2 bg-bg p-2 has-[:checked]:bg-ink has-[:checked]:text-paper">
                <input type="radio" name="tema" value={id} defaultChecked={temaAtual === id} className="sr-only" />
                <span className="grid h-16 place-items-center" style={{ background: t.fundo }}>
                  <span className="h-10 w-8" style={{ background: t.papel }} />
                </span>
                <span className="text-[0.9375rem]">{t.label}</span>
              </label>
            ))}
          </div>
        </div>
        <Field label="Cor de destaque" hint="Botões, barra das metas e centavos do Pix.">
          <Input name="cor_principal" type="color" defaultValue={event?.cor_principal ?? "#b08968"} className="h-12 max-w-32 p-1" />
        </Field>
      </fieldset>

      <fieldset className="grid min-w-0 gap-5 sm:grid-cols-3">
        <legend className="font-display mb-5 text-4xl">Pix dos noivos</legend>
        <p className="bg-bg px-4 py-3 text-[0.9375rem] sm:col-span-3">
          O dinheiro dos presentes cai nesta chave. Confira com cuidado: depois de publicar, faça um Pix de teste na aba
          Compartilhar.
        </p>
        <Field label="Chave Pix" hint="CPF, e-mail, chave aleatória ou celular no formato +5511999999999">
          <Input name="pix_chave" defaultValue={event?.pix_chave ?? ""} maxLength={77} autoComplete="off" />
        </Field>
        <Field label="Nome do recebedor" hint="Como está no banco. Máx. 25 letras.">
          <Input name="pix_nome" maxLength={25} defaultValue={event?.pix_nome ?? ""} />
        </Field>
        <Field label="Cidade" hint="Máx. 15 letras">
          <Input name="pix_cidade" maxLength={15} defaultValue={event?.pix_cidade ?? ""} />
        </Field>
      </fieldset>

      <div>
        <SubmitButton className="min-h-12 bg-ink px-6 font-medium text-paper" pendingLabel="Salvando…">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
