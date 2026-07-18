-- FASE 9: mesociclos generados/ajustados por IA (Claude) ------------------
-- Correr DESPUES de phase8_free_training_and_requests.sql, en el SQL Editor
-- de Supabase.
--
-- Para escaladores libres (profiles.restricted = false, onboarded_via_free
-- = true): el primer mesociclo se genera solo con IA al completar la
-- primera evaluacion, y despues se ajusta con cada check-in semanal. Esta
-- migracion agrega:
-- 1) ai_generation_runs: tracking/auditoria + lock (una sola generacion en
--    vuelo por atleta a la vez).
-- 2) mesocycles.is_ai_generated / generation_run_id: de donde vino el plan.
-- 3) blocks.manually_edited: cualquier escritura de bloque hecha desde el
--    navegador (rol "authenticated") queda marcada como editada a mano.
--    Las rutas de IA escriben con el service role (no "authenticated"), asi
--    que sus bloques quedan en false por defecto. Esto es lo que garantiza,
--    a nivel de base de datos y no de disciplina en el codigo de la app,
--    que el ajuste semanal nunca pise un ejercicio que el escalador agrego
--    o edito el mismo.

-- AI_GENERATION_RUNS -------------------------------------------------------
create table if not exists ai_generation_runs (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  mesocycle_id uuid references mesocycles(id) on delete set null,
  trigger_type text not null check (trigger_type in ('initial', 'checkin_adjustment', 'manual_next')),
  trigger_ref_id uuid,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed')),
  error_message text,
  model text,
  request_summary jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  acknowledged_at timestamptz,
  created_by uuid references profiles(id) on delete set null
);

-- Un solo run "en vuelo" por atleta a la vez: evita que dos disparos
-- (doble submit, ajuste corriendo mientras se genera el inicial, etc.)
-- escriban al mismo tiempo sobre el mismo mesociclo.
create unique index if not exists idx_ai_runs_athlete_active
  on ai_generation_runs (athlete_id)
  where status in ('pending', 'running');

create index if not exists idx_ai_runs_athlete on ai_generation_runs(athlete_id, started_at desc);

alter table ai_generation_runs enable row level security;

drop policy if exists "ai_generation_runs select" on ai_generation_runs;
create policy "ai_generation_runs select" on ai_generation_runs for select
  using (can_access_athlete(athlete_id));

-- Desde el navegador solo se puede marcar como visto (acknowledged_at); el
-- resto de las columnas las escribe el service role, que bypassea RLS.
drop policy if exists "ai_generation_runs ack update" on ai_generation_runs;
create policy "ai_generation_runs ack update" on ai_generation_runs for update
  using (can_access_athlete(athlete_id))
  with check (can_access_athlete(athlete_id));

create or replace function enforce_ai_run_ack_only()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    if NEW.status is distinct from OLD.status
      or NEW.mesocycle_id is distinct from OLD.mesocycle_id
      or NEW.trigger_type is distinct from OLD.trigger_type
      or NEW.trigger_ref_id is distinct from OLD.trigger_ref_id
      or NEW.error_message is distinct from OLD.error_message
      or NEW.model is distinct from OLD.model
      or NEW.completed_at is distinct from OLD.completed_at
    then
      raise exception 'Solo se puede marcar como visto (acknowledged_at).';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_enforce_ai_run_ack_only on ai_generation_runs;
create trigger trg_enforce_ai_run_ack_only
  before update on ai_generation_runs
  for each row execute function enforce_ai_run_ack_only();

-- METADATA DE MESOCICLO GENERADO POR IA -------------------------------------
alter table mesocycles add column if not exists is_ai_generated boolean not null default false;
alter table mesocycles add column if not exists generation_run_id uuid references ai_generation_runs(id) on delete set null;

-- PROTECCION DE EDICIONES MANUALES DEL ATLETA -------------------------------
alter table blocks add column if not exists manually_edited boolean not null default false;

create or replace function mark_block_manually_edited()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    NEW.manually_edited := true;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_mark_block_manually_edited on blocks;
create trigger trg_mark_block_manually_edited
  before insert or update on blocks
  for each row execute function mark_block_manually_edited();
