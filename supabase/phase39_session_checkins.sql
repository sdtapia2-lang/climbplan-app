-- Fase 39: check-in de disponibilidad pre-sesión ("readiness"), pedido
-- explícito de Rorro ("autoevaluación pre-sesión con puntaje que el propio
-- atleta aplica según una pauta, y que ayuda a graduar la sesión") y de Cris
-- (sueño + fatiga capturados el día de la sesión, no dos semanas después).
--
-- Tabla nueva, separada de `checkins` (que es semanal/manual y no se toca):
-- esta se dispara por sesión, con fatiga diferenciada por tipo (pedido
-- puntual de Rorro) que `checkins` no tenía.
--
-- Correr en el SQL Editor de Supabase, despues de phase38.

create table if not exists session_checkins (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  day_id uuid references days(id) on delete set null,
  checkin_at timestamptz not null default now(),
  sleep_hours numeric,
  sleep_quality int,
  fatigue_general int,
  fatigue_fingers int,
  fatigue_upper int,
  motivation int,
  readiness_score int,
  suggested_adjustment text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_session_checkins_athlete on session_checkins(athlete_id, checkin_at);

alter table session_checkins enable row level security;

drop policy if exists "session_checkins all" on session_checkins;
create policy "session_checkins all" on session_checkins for all
  using (can_access_athlete(athlete_id))
  with check (can_access_athlete(athlete_id));
