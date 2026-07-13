-- ClimbPlan schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- ATHLETES ------------------------------------------------------------
create table if not exists athletes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int,
  height_cm numeric,
  weight_kg numeric,
  wingspan_cm numeric,
  boulder_indoor_max text,
  boulder_outdoor_max text,
  sport_indoor_max text,
  sport_outdoor_max text,
  consolidated_grade text,
  climbing_style text,
  strengths text,
  weaknesses text,
  main_goal text,
  secondary_goal text,
  current_limiter text,
  periodization_format text default 'Mesociclos de 4 semanas (3 carga + 1 descarga)',
  target_horizon text,
  equipment jsonb not null default '[]',
  has_active_injury boolean not null default false,
  injury_location text,
  injury_description text,
  injury_diagnosis text,
  injury_since date,
  injury_restrictions text,
  pain_threshold int,
  injury_strapping text,
  injury_professional_notes text,
  injury_history jsonb not null default '[]',
  medical_conditions text,
  general_notes text,
  transversal_rules text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- EXERCISE CATALOG -----------------------------------------------------
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  equipment_required jsonb not null default '[]',
  typical_sets text,
  typical_reps text,
  typical_time text,
  typical_duration text,
  typical_effort text,
  description text,
  is_benchmark boolean not null default false,
  created_at timestamptz not null default now()
);

-- MESOCYCLES -------------------------------------------------------------
create table if not exists mesocycles (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  phase text,
  status text not null default 'Planificado',
  ref_weight_kg numeric,
  max_rpe_week numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists weeks (
  id uuid primary key default gen_random_uuid(),
  mesocycle_id uuid not null references mesocycles(id) on delete cascade,
  week_number int not null,
  load_type text,
  focus text,
  distribution text,
  unique (mesocycle_id, week_number)
);

create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references weeks(id) on delete cascade,
  day_of_week text not null,
  day_focus text,
  is_rest boolean not null default false,
  position int not null default 0
);

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references days(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete set null,
  exercise_name_freetext text,
  category text,
  rpe_target text,
  sets text,
  reps_or_time text,
  time text,
  load text,
  rest text,
  kinesio_notes text,
  position int not null default 0,
  -- registro real (lo que el atleta completa al entrenar)
  actual_sets text,
  actual_reps_or_time text,
  actual_load text,
  actual_rpe text,
  pain_during int,
  comment text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- EVALUATIONS ------------------------------------------------------------
create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  eval_date date not null default current_date,
  weight_kg numeric,
  height_cm numeric,
  wingspan_cm numeric,
  health_screening jsonb not null default '{}',
  pain_by_zone jsonb not null default '{}',
  shoulder_ir text,
  shoulder_er text,
  wrist_mobility text,
  deep_squat boolean,
  thomas_test text,
  mobility_notes text,
  pullups_max text,
  horizontal_push text,
  plank_seconds int,
  lsit_seconds int,
  vertical_jump_cm numeric,
  left_mvc_kg numeric,
  left_mvc_bw_pct numeric,
  left_cf_reps int,
  left_cf_avg_force_kg numeric,
  left_cf_drop_pct numeric,
  left_rfd_100 numeric,
  left_rfd_150 numeric,
  left_rfd_200 numeric,
  left_rfd_250 numeric,
  right_mvc_kg numeric,
  right_mvc_bw_pct numeric,
  right_cf_reps int,
  right_cf_avg_force_kg numeric,
  right_cf_drop_pct numeric,
  right_rfd_100 numeric,
  right_rfd_150 numeric,
  right_rfd_200 numeric,
  right_rfd_250 numeric,
  asymmetry_mvc_pct numeric,
  asymmetry_cf_pct numeric,
  arc_duration_min int,
  arc_rpe int,
  arc_completed boolean,
  endurance_notes text,
  boulder_redpoint text,
  boulder_onsight text,
  sport_redpoint text,
  sport_onsight text,
  summary_flags jsonb not null default '[]',
  evaluator_notes text,
  created_at timestamptz not null default now()
);

-- CHECK-INS ----------------------------------------------------------------
create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  week_id uuid references weeks(id) on delete set null,
  checkin_date date not null default current_date,
  sleep_quality int,
  motivation int,
  adherence_pct int,
  pain_by_zone jsonb not null default '{}',
  comment text,
  created_at timestamptz not null default now()
);

-- INDEXES --------------------------------------------------------------
create index if not exists idx_mesocycles_athlete on mesocycles(athlete_id);
create index if not exists idx_weeks_mesocycle on weeks(mesocycle_id);
create index if not exists idx_days_week on days(week_id);
create index if not exists idx_blocks_day on blocks(day_id);
create index if not exists idx_evaluations_athlete on evaluations(athlete_id, eval_date);
create index if not exists idx_checkins_athlete on checkins(athlete_id, checkin_date);

-- ROW LEVEL SECURITY -----------------------------------------------------
-- Uso compartido de confianza (Seba + Diego): cualquier usuario autenticado
-- puede leer/escribir todo. No hay aislamiento por usuario.
alter table athletes enable row level security;
alter table exercises enable row level security;
alter table mesocycles enable row level security;
alter table weeks enable row level security;
alter table days enable row level security;
alter table blocks enable row level security;
alter table evaluations enable row level security;
alter table checkins enable row level security;

create policy "authenticated read/write athletes" on athletes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write exercises" on exercises for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write mesocycles" on mesocycles for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write weeks" on weeks for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write days" on days for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write blocks" on blocks for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write evaluations" on evaluations for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated read/write checkins" on checkins for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- SEED: dos atletas base -------------------------------------------------
insert into athletes (name) values ('Seba'), ('Diego')
on conflict do nothing;
