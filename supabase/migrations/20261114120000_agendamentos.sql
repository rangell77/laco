-- =====================================================================
-- Agendamentos: expira Pix pendentes (sem "Já paguei") a cada 15 minutos.
-- A aplicação também expira na hora de gerar um novo Pix; o job garante
-- que itens e centavos sejam liberados mesmo sem novos acessos.
-- =====================================================================

create extension if not exists pg_cron with schema pg_catalog;

-- Busca rápida das pendentes vencidas.
create index if not exists contributions_pendentes_expira_idx
  on public.contributions (expira_em)
  where status = 'pendente';

-- Idempotente: remove o job anterior com o mesmo nome antes de recriar.
select cron.unschedule(jobid) from cron.job where jobname = 'expirar-contribuicoes';

select cron.schedule(
  'expirar-contribuicoes',
  '*/15 * * * *',
  $$select private.expirar_contribuicoes()$$
);
