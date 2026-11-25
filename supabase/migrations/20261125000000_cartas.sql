-- =====================================================================
-- Cartas no convite: até duas mensagens assinadas (ex.: da mãe e da aniversariante).
-- =====================================================================

alter table public.events
  add column if not exists carta1_de    text check (length(carta1_de) <= 60),
  add column if not exists carta1_texto text check (length(carta1_texto) <= 4000),
  add column if not exists carta2_de    text check (length(carta2_de) <= 60),
  add column if not exists carta2_texto text check (length(carta2_texto) <= 4000),
  -- Como as cartas aparecem: uma depois da outra ou lado a lado (folhear no celular)
  add column if not exists cartas_layout text not null default 'sequencia'
    check (cartas_layout in ('sequencia', 'lado'));
