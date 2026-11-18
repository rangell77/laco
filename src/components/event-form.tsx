import { ImageUpload } from "@/components/image-upload";
import { PaletaEditor } from "@/components/paleta-editor";
import { SubmitButton } from "@/components/submit-button";
import { Field, Input, Select, Textarea } from "@/components/ui";
import { EVENT_TYPE_LABEL, type EventFull } from "@/lib/types";

const hhmm = (t: string | null | undefined) => (t ? t.slice(0, 5) : "");

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
  return (
    <form action={action} className="flex flex-col gap-12">
      {event && <input type="hidden" name="event_id" value={event.id} />}
      {back && <input type="hidden" name="back" value={back} />}

      {/* ---------------- O evento ---------------- */}
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
        <Field label="Data">
          <Input name="data_evento" type="date" defaultValue={event?.data_evento ?? ""} />
        </Field>
        <Field label="Mensagem para os convidados" hint="Aparece logo abaixo do convite. Duas ou três frases funcionam melhor.">
          <Textarea name="historia" rows={4} defaultValue={event?.historia ?? ""} maxLength={1200} />
        </Field>
      </fieldset>

      {/* ---------------- Locais ---------------- */}
      <fieldset className="flex min-w-0 flex-col gap-6">
        <legend className="font-display mb-2 text-4xl">Onde vai ser</legend>
        <p className="text-[0.9375rem] text-muted">
          Com o endereço, o convite mostra o mapa de satélite e os botões do Google Maps, do Waze e da agenda.
        </p>
        <div className="grid gap-5 bg-bg p-5 sm:grid-cols-[1fr_1.4fr_auto] sm:p-6">
          <p className="font-semibold sm:col-span-3">Cerimônia</p>
          <Field label="Nome do local">
            <Input name="local" defaultValue={event?.local ?? ""} placeholder="Espaço Jardim" maxLength={120} />
          </Field>
          <Field label="Endereço" hint="Rua, número e cidade">
            <Input name="local_endereco" defaultValue={event?.local_endereco ?? ""} placeholder="Rua das Flores, 120, Campinas" maxLength={200} />
          </Field>
          <Field label="Horário">
            <Input name="hora_evento" type="time" defaultValue={hhmm(event?.hora_evento)} />
          </Field>
        </div>
        <div className="grid gap-5 bg-bg p-5 sm:grid-cols-[1fr_1.4fr_auto] sm:p-6">
          <p className="font-semibold sm:col-span-3">
            Recepção <span className="font-normal text-muted">(opcional, se a festa for em outro lugar)</span>
          </p>
          <Field label="Nome do local">
            <Input name="recepcao_local" defaultValue={event?.recepcao_local ?? ""} placeholder="Salão Villa Real" maxLength={120} />
          </Field>
          <Field label="Endereço">
            <Input name="recepcao_endereco" defaultValue={event?.recepcao_endereco ?? ""} placeholder="Av. Brasil, 900, Campinas" maxLength={200} />
          </Field>
          <Field label="Horário">
            <Input name="recepcao_hora" type="time" defaultValue={hhmm(event?.recepcao_hora)} />
          </Field>
        </div>
      </fieldset>

      {/* ---------------- Visual ---------------- */}
      <fieldset className="flex min-w-0 flex-col gap-8">
        <legend className="font-display mb-2 text-4xl">A cara do convite</legend>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <ImageUpload
              name="capa_url"
              eventId={event?.id}
              defaultValue={event?.capa_url}
              label="Foto do casal ou da homenageada"
              hint="Vertical ou horizontal. Com rostos bem visíveis."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Como mostrar a foto">
                <Select name="foto_layout" defaultValue={event?.foto_layout ?? "destaque"}>
                  <option value="destaque">Em destaque no topo</option>
                  <option value="retrato">Retrato dentro do convite</option>
                </Select>
              </Field>
              <Field label="Enquadramento" hint="Para não cortar os rostos no celular">
                <Select name="foto_foco" defaultValue={event?.foto_foco ?? "centro"}>
                  <option value="topo">Priorizar o topo</option>
                  <option value="centro">Centro</option>
                  <option value="baixo">Priorizar a parte de baixo</option>
                </Select>
              </Field>
            </div>
          </div>
          <ImageUpload
            name="logo_url"
            kind="logo"
            eventId={event?.id}
            defaultValue={event?.logo_url}
            label="Logo ou monograma da festa"
            hint="PNG ou WebP com fundo transparente fica melhor. Aparece no topo do convite e no comprovante do Pix."
          />
        </div>

        <PaletaEditor
          tema={event?.tema ?? "classico"}
          corFundo={event?.cor_fundo ?? null}
          corPapel={event?.cor_papel ?? null}
          corPrincipal={event?.cor_principal ?? "#9c6b3f"}
          titulo={event?.titulo ?? ""}
          logoUrl={event?.logo_url}
        />
      </fieldset>

      {/* ---------------- Pix ---------------- */}
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

      <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-3 bg-paper px-5 py-3 sm:-mx-6 sm:px-6">
        <SubmitButton className="min-h-12 bg-ink px-6 font-medium text-paper" pendingLabel="Salvando…">
          {submitLabel}
        </SubmitButton>
        {event && (
          <a href={`/${event.slug}`} target="_blank" rel="noopener" className="text-[0.9375rem] underline-offset-4 hover:underline">
            Ver como o convidado vê ↗
          </a>
        )}
      </div>
    </form>
  );
}
