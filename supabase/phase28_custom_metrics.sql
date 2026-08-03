-- Fase 28: métricas custom por atleta (equivalente a "Daily Metrics" de
-- Sequence). A diferencia de checkins (esquema fijo: sueño/motivación/dolor),
-- esto permite que cada atleta defina sus propias métricas (ej. "Peso
-- corporal", "Horas de sueño", "Fuerza de agarre") y registre valores
-- puntuales en el tiempo.
--
-- Correr en el SQL Editor de Supabase, despues de phase1_roles.sql.

create table if not exists metric_definitions (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  name text not null,
  unit text,
  created_at timestamptz not null default now()
);

create table if not exists metric_logs (
  id uuid primary key default gen_random_uuid(),
  metric_id uuid not null references metric_definitions(id) on delete cascade,
  athlete_id uuid not null references athletes(id) on delete cascade,
  log_date date not null default current_date,
  value numeric not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_metric_definitions_athlete on metric_definitions(athlete_id);
create index if not exists idx_metric_logs_metric on metric_logs(metric_id, log_date);
create index if not exists idx_metric_logs_athlete on metric_logs(athlete_id, log_date);

alter table metric_definitions enable row level security;
alter table metric_logs enable row level security;

drop policy if exists "metric_definitions all" on metric_definitions;
create policy "metric_definitions all" on metric_definitions for all
  using (can_access_athlete(athlete_id))
  with check (can_access_athlete(athlete_id));

drop policy if exists "metric_logs all" on metric_logs;
create policy "metric_logs all" on metric_logs for all
  using (can_access_athlete(athlete_id))
  with check (can_access_athlete(athlete_id));
