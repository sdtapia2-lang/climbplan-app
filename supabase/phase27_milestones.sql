-- Fase 27: hitos (milestones) por atleta.
-- Registro libre de logros/progresos notables (via nueva via, PR de fuerza,
-- primer 7a, etc), similar al feature "Milestones" de apps de referencia
-- (Sequence). Independiente de evaluations (tests formales) y checkins
-- (subjetivo semanal): esto es un timeline de hitos puntuales.
--
-- Correr en el SQL Editor de Supabase, despues de phase1_roles.sql.

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  milestone_date date not null default current_date,
  title text not null,
  category text,
  description text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_milestones_athlete on milestones(athlete_id, milestone_date desc);

alter table milestones enable row level security;

drop policy if exists "milestones all" on milestones;
create policy "milestones all" on milestones for all
  using (can_access_athlete(athlete_id))
  with check (can_access_athlete(athlete_id));
