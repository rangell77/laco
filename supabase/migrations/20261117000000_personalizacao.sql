-- =====================================================================
-- Personalização do convite: paleta própria, logo, foto do casal e locais.
-- =====================================================================

alter table public.events
  -- Paleta do evento (o tema vira ponto de partida; estas cores sobrescrevem)
  add column if not exists cor_fundo   text check (cor_fundo ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists cor_papel   text check (cor_papel ~ '^#[0-9a-fA-F]{6}$'),
  -- Logo/monograma da festa (PNG/WebP no bucket event-images)
  add column if not exists logo_url    text,
  -- Foto de capa: em destaque no topo ou como retrato dentro do convite
  add column if not exists foto_layout text not null default 'destaque'
    check (foto_layout in ('destaque', 'retrato')),
  add column if not exists foto_foco   text not null default 'centro'
    check (foto_foco in ('topo', 'centro', 'baixo')),
  -- Cerimônia (o nome do local já existe em "local")
  add column if not exists hora_evento    time,
  add column if not exists local_endereco text check (length(local_endereco) <= 200),
  -- Recepção (opcional)
  add column if not exists recepcao_local    text check (length(recepcao_local) <= 120),
  add column if not exists recepcao_endereco text check (length(recepcao_endereco) <= 200),
  add column if not exists recepcao_hora     time;
