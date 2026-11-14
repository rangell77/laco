-- =====================================================================
-- Lista de Presentes do Celebrante — schema inicial (Fase 1: Pix estático)
-- Valores monetários são guardados em CENTAVOS (bigint) para evitar
-- erros de arredondamento.
-- =====================================================================

create schema if not exists private;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.user_role as enum ('admin', 'cliente');
create type public.event_type as enum ('casamento', 'quinze_anos', 'bodas', 'outro');
create type public.payment_mode as enum ('pix_estatico', 'gateway');
create type public.gift_type as enum ('link', 'cota', 'meta', 'pix_livre');
create type public.contribution_method as enum (
  'pix_estatico',    -- Fase 1: QR estático + "Já paguei"
  'compra_externa',  -- convidado comprou na loja (item tipo link) e clicou "Já comprei"
  'gateway'          -- FASE FUTURA: Pix dinâmico/cartão com webhook
);
create type public.contribution_status as enum (
  'pendente',               -- QR gerado, convidado ainda não clicou "Já paguei"
  'aguardando_confirmacao', -- convidado clicou "Já paguei"
  'confirmado',             -- cliente conferiu no extrato
  'recusado',               -- cliente marcou "Não recebi"
  'expirado'                -- pendente há mais de 24h
);

-- ---------------------------------------------------------------------
-- profiles (1:1 com auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nome       text not null default '',
  email      text,
  papel      public.user_role not null default 'cliente',
  criado_em  timestamptz not null default now()
);

-- Cria o profile automaticamente quando um usuário é criado no Auth.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', ''), lower(new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------
create table public.events (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique
                 check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) between 3 and 60),
  tipo           public.event_type not null default 'casamento',
  titulo         text not null,
  data_evento    date,
  local          text,
  historia       text,
  capa_url       text,
  tema           text not null default 'classico',
  cor_principal  text not null default '#b08968' check (cor_principal ~ '^#[0-9a-fA-F]{6}$'),
  pix_chave      text,
  pix_nome       text check (length(pix_nome) <= 25),
  pix_cidade     text check (length(pix_cidade) <= 15),
  payment_mode   public.payment_mode not null default 'pix_estatico',
  ativo          boolean not null default false,
  criado_por     uuid references public.profiles (id) on delete set null,
  criado_em      timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);

create index events_criado_por_idx on public.events (criado_por);

-- ---------------------------------------------------------------------
-- event_members (clientes com acesso a um evento)
-- ---------------------------------------------------------------------
create table public.event_members (
  event_id    uuid not null references public.events (id) on delete cascade,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  criado_em   timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create index event_members_profile_id_idx on public.event_members (profile_id);

-- ---------------------------------------------------------------------
-- gift_items
-- ---------------------------------------------------------------------
create table public.gift_items (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events (id) on delete cascade,
  tipo            public.gift_type not null,
  titulo          text not null,
  descricao       text,
  imagem_url      text,
  valor_centavos  bigint check (valor_centavos is null or valor_centavos > 0),
  quantidade      integer check (quantidade is null or quantidade > 0),
  url_externa     text,
  ordem           integer not null default 0,
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now(),
  -- cota e meta precisam de valor; link precisa de url
  check (tipo not in ('cota', 'meta') or valor_centavos is not null),
  check (tipo <> 'link' or url_externa is not null)
);

create index gift_items_event_id_ordem_idx on public.gift_items (event_id, ordem);

-- ---------------------------------------------------------------------
-- contributions
-- ---------------------------------------------------------------------
create table public.contributions (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references public.events (id) on delete cascade,
  gift_item_id        uuid references public.gift_items (id) on delete set null,
  convidado_nome      text not null check (length(trim(convidado_nome)) between 2 and 80),
  convidado_contato   text check (length(convidado_contato) <= 120),
  mensagem            text check (length(mensagem) <= 1000),
  valor_base_centavos bigint not null check (valor_base_centavos >= 0),
  -- valor com centavos únicos (Pix estático); para "link" é o preço de referência
  valor_cobrado_centavos bigint not null check (valor_cobrado_centavos >= 0),
  metodo              public.contribution_method not null default 'pix_estatico',
  status              public.contribution_status not null default 'pendente',
  payment_id          uuid,  -- FASE FUTURA (gateway): referência a public.payments
  expira_em           timestamptz not null default (now() + interval '24 hours'),
  pago_em             timestamptz,
  confirmado_em       timestamptz,
  criado_em           timestamptz not null default now()
);

create index contributions_event_status_idx on public.contributions (event_id, status, criado_em desc);
create index contributions_gift_item_id_idx on public.contributions (gift_item_id);

-- Garante centavos únicos entre contribuições ABERTAS do mesmo evento:
-- dois convidados nunca recebem o mesmo valor exato ao mesmo tempo.
create unique index contributions_valor_unico_aberto_idx
  on public.contributions (event_id, valor_cobrado_centavos)
  where metodo = 'pix_estatico' and status in ('pendente', 'aguardando_confirmacao');

-- Expira pendentes com mais de 24h. Agendar via pg_cron:
--   select cron.schedule('expirar-contribuicoes', '*/15 * * * *',
--                        'select private.expirar_contribuicoes()');
create or replace function private.expirar_contribuicoes()
returns integer
language sql
security definer
set search_path = ''
as $$
  with upd as (
    update public.contributions
       set status = 'expirado'
     where status = 'pendente' and expira_em < now()
    returning 1
  )
  select count(*)::integer from upd;
$$;

-- ---------------------------------------------------------------------
-- Funções auxiliares de permissão (schema private não é exposto pela API)
-- ---------------------------------------------------------------------
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
     where id = (select auth.uid()) and papel = 'admin'
  );
$$;

create or replace function private.is_event_member(p_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.event_members
     where event_id = p_event_id and profile_id = (select auth.uid())
  );
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke all on function private.expirar_contribuicoes() from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon;
revoke all on function private.is_event_member(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_event_member(uuid) to authenticated;

-- Cliente (membro) pode editar a página, mas não slug, publicação nem modo
-- de pagamento: só o admin muda esses campos.
create or replace function private.protect_event_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not private.is_admin() then
    if new.slug is distinct from old.slug
       or new.ativo is distinct from old.ativo
       or new.payment_mode is distinct from old.payment_mode
       or new.criado_por is distinct from old.criado_por then
      raise exception 'Somente o administrador pode alterar link, publicação ou modo de pagamento';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.protect_event_admin_fields() from public, anon, authenticated;

create trigger events_protect_admin_fields
  before update on public.events
  for each row execute function private.protect_event_admin_fields();

-- Cliente não pode promover a si mesmo a admin.
create or replace function private.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not private.is_admin() then
    new.papel := old.papel;
    new.email := old.email;
  end if;
  return new;
end;
$$;

revoke all on function private.protect_profile_role() from public, anon, authenticated;

create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function private.protect_profile_role();

-- ---------------------------------------------------------------------
-- RLS
-- Convidado (anon) NÃO acessa contributions direto: criação e "Já paguei"
-- passam pelo servidor (service role), que valida tudo.
-- ---------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.events        enable row level security;
alter table public.event_members enable row level security;
alter table public.gift_items    enable row level security;
alter table public.contributions enable row level security;

-- profiles
create policy "profiles: ler o próprio ou admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

create policy "profiles: editar o próprio nome" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- events (uma policy de SELECT por papel, para não somar policies permissivas)
create policy "events: público vê ativos" on public.events
  for select to anon
  using (ativo);

create policy "events: ativos, admin e membros veem" on public.events
  for select to authenticated
  using (ativo or (select private.is_admin()) or (select private.is_event_member(id)));

create policy "events: admin cria" on public.events
  for insert to authenticated
  with check ((select private.is_admin()));

create policy "events: admin e membros editam" on public.events
  for update to authenticated
  using ((select private.is_admin()) or (select private.is_event_member(id)))
  with check ((select private.is_admin()) or (select private.is_event_member(id)));

create policy "events: admin apaga" on public.events
  for delete to authenticated
  using ((select private.is_admin()));

-- event_members
create policy "event_members: admin vê todos, membro vê os seus" on public.event_members
  for select to authenticated
  using (profile_id = (select auth.uid()) or (select private.is_admin()));

create policy "event_members: admin adiciona" on public.event_members
  for insert to authenticated
  with check ((select private.is_admin()));

create policy "event_members: admin edita" on public.event_members
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "event_members: admin remove" on public.event_members
  for delete to authenticated
  using ((select private.is_admin()));

-- gift_items
create policy "gift_items: público vê ativos de eventos ativos" on public.gift_items
  for select to anon
  using (ativo and exists (select 1 from public.events e where e.id = event_id and e.ativo));

create policy "gift_items: público, admin e membros veem" on public.gift_items
  for select to authenticated
  using (
    (ativo and exists (select 1 from public.events e where e.id = event_id and e.ativo))
    or (select private.is_admin())
    or (select private.is_event_member(event_id))
  );

create policy "gift_items: admin e membros criam" on public.gift_items
  for insert to authenticated
  with check ((select private.is_admin()) or (select private.is_event_member(event_id)));

create policy "gift_items: admin e membros editam" on public.gift_items
  for update to authenticated
  using ((select private.is_admin()) or (select private.is_event_member(event_id)))
  with check ((select private.is_admin()) or (select private.is_event_member(event_id)));

create policy "gift_items: admin e membros apagam" on public.gift_items
  for delete to authenticated
  using ((select private.is_admin()) or (select private.is_event_member(event_id)));

-- contributions
create policy "contributions: admin e membros veem" on public.contributions
  for select to authenticated
  using ((select private.is_admin()) or (select private.is_event_member(event_id)));

create policy "contributions: admin e membros confirmam/recusam" on public.contributions
  for update to authenticated
  using ((select private.is_admin()) or (select private.is_event_member(event_id)))
  with check ((select private.is_admin()) or (select private.is_event_member(event_id)));

-- ---------------------------------------------------------------------
-- Progresso público (sem nomes): quanto cada item já recebeu / reservou
-- ---------------------------------------------------------------------
create or replace function public.event_gift_progress(p_event_id uuid)
returns table (
  gift_item_id         uuid,
  confirmado_centavos  bigint,
  aguardando_centavos  bigint,
  reservas             integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.gift_item_id,
         coalesce(sum(c.valor_base_centavos) filter (where c.status = 'confirmado'), 0)::bigint,
         coalesce(sum(c.valor_base_centavos) filter (where c.status = 'aguardando_confirmacao'), 0)::bigint,
         count(*) filter (where c.status in ('aguardando_confirmacao', 'confirmado'))::integer
    from public.contributions c
   where c.event_id = p_event_id and c.gift_item_id is not null
     -- só eventos publicados, ou o admin/membro do evento (painel)
     and (
       exists (select 1 from public.events e where e.id = p_event_id and e.ativo)
       or private.is_admin()
       or private.is_event_member(p_event_id)
     )
   group by c.gift_item_id;
$$;

revoke all on function public.event_gift_progress(uuid) from public;
grant execute on function public.event_gift_progress(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Storage: bucket público de imagens. Caminho: <event_id>/<arquivo>
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('event-images', 'event-images', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "event-images: admin e membros sobem" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'event-images'
    and exists (
      select 1 from public.events e
       where e.id::text = (storage.foldername(name))[1]
         and ((select private.is_admin()) or (select private.is_event_member(e.id)))
    )
  );

create policy "event-images: admin e membros apagam" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'event-images'
    and exists (
      select 1 from public.events e
       where e.id::text = (storage.foldername(name))[1]
         and ((select private.is_admin()) or (select private.is_event_member(e.id)))
    )
  );
