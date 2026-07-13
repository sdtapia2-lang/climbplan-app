-- ClimbPlan Fase 2: planes por defecto (plantillas de mesociclo)
-- Correr DESPUES de phase1_roles.sql, en el SQL Editor de Supabase.
--
-- Una plantilla es una estructura de mesociclo (semanas/dias/bloques) sin
-- atleta ni fechas, armada por el Administrador. Cualquier rol con acceso a
-- un atleta (admin, su entrenador asignado, o el propio escalador) puede
-- "aplicarla" a ese atleta: se genera una copia real (mesociclo/weeks/days/
-- blocks) editable, con fecha de inicio elegida en ese momento.

-- TABLAS ------------------------------------------------------------------
create table if not exists template_mesocycles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  phase text,
  max_rpe_week numeric,
  is_published boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists template_weeks (
  id uuid primary key default gen_random_uuid(),
  template_mesocycle_id uuid not null references template_mesocycles(id) on delete cascade,
  week_number int not null,
  load_type text,
  focus text,
  distribution text
);

create table if not exists template_days (
  id uuid primary key default gen_random_uuid(),
  template_week_id uuid not null references template_weeks(id) on delete cascade,
  day_of_week text not null,
  day_focus text,
  is_rest boolean not null default false,
  position int not null default 0
);

create table if not exists template_blocks (
  id uuid primary key default gen_random_uuid(),
  template_day_id uuid not null references template_days(id) on delete cascade,
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
  position int not null default 0
);

create index if not exists idx_template_weeks_meso on template_weeks(template_mesocycle_id);
create index if not exists idx_template_days_week on template_days(template_week_id);
create index if not exists idx_template_blocks_day on template_blocks(template_day_id);

-- RLS -----------------------------------------------------------------------
alter table template_mesocycles enable row level security;
alter table template_weeks enable row level security;
alter table template_days enable row level security;
alter table template_blocks enable row level security;

create policy "template_mesocycles select" on template_mesocycles for select
  using (is_published or my_role() = 'admin');
create policy "template_mesocycles insert admin" on template_mesocycles for insert
  with check (my_role() = 'admin');
create policy "template_mesocycles update admin" on template_mesocycles for update
  using (my_role() = 'admin') with check (my_role() = 'admin');
create policy "template_mesocycles delete admin" on template_mesocycles for delete
  using (my_role() = 'admin');

create policy "template_weeks select" on template_weeks for select
  using (exists (
    select 1 from template_mesocycles tm
    where tm.id = template_mesocycle_id and (tm.is_published or my_role() = 'admin')
  ));
create policy "template_weeks write admin" on template_weeks for all
  using (my_role() = 'admin') with check (my_role() = 'admin');

create policy "template_days select" on template_days for select
  using (exists (
    select 1 from template_weeks tw
    join template_mesocycles tm on tm.id = tw.template_mesocycle_id
    where tw.id = template_week_id and (tm.is_published or my_role() = 'admin')
  ));
create policy "template_days write admin" on template_days for all
  using (my_role() = 'admin') with check (my_role() = 'admin');

create policy "template_blocks select" on template_blocks for select
  using (exists (
    select 1 from template_days td
    join template_weeks tw on tw.id = td.template_week_id
    join template_mesocycles tm on tm.id = tw.template_mesocycle_id
    where td.id = template_day_id and (tm.is_published or my_role() = 'admin')
  ));
create policy "template_blocks write admin" on template_blocks for all
  using (my_role() = 'admin') with check (my_role() = 'admin');

-- FUNCION: aplicar una plantilla a un atleta -------------------------------
-- security definer: corre como el dueno de las tablas, por eso puede insertar
-- en mesocycles/weeks/days/blocks aunque el que llama (ej. un escalador) no
-- tenga permiso de insert directo sobre esas tablas. La unica verificacion de
-- permiso relevante es can_access_athlete(p_athlete_id) al principio.
create or replace function apply_mesocycle_template(
  p_template_id uuid,
  p_athlete_id uuid,
  p_start_date date
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_template record;
  v_new_mesocycle_id uuid;
  v_week_count int;
  v_week record;
  v_new_week_id uuid;
  v_day record;
  v_new_day_id uuid;
  v_block record;
begin
  if not can_access_athlete(p_athlete_id) then
    raise exception 'No tenes permiso para crear un mesociclo para este atleta';
  end if;

  select * into v_template from template_mesocycles where id = p_template_id;
  if not found then
    raise exception 'Plantilla no encontrada';
  end if;
  if not v_template.is_published and my_role() <> 'admin' then
    raise exception 'Esta plantilla no esta publicada';
  end if;

  select count(*) into v_week_count from template_weeks where template_mesocycle_id = p_template_id;

  insert into mesocycles (athlete_id, name, start_date, end_date, phase, status, max_rpe_week)
  values (
    p_athlete_id,
    v_template.name,
    p_start_date,
    p_start_date + (greatest(v_week_count, 1) * 7 - 1),
    v_template.phase,
    'Planificado',
    v_template.max_rpe_week
  )
  returning id into v_new_mesocycle_id;

  for v_week in select * from template_weeks where template_mesocycle_id = p_template_id order by week_number loop
    insert into weeks (mesocycle_id, week_number, load_type, focus, distribution)
    values (v_new_mesocycle_id, v_week.week_number, v_week.load_type, v_week.focus, v_week.distribution)
    returning id into v_new_week_id;

    for v_day in select * from template_days where template_week_id = v_week.id order by position loop
      insert into days (week_id, day_of_week, day_focus, is_rest, position)
      values (v_new_week_id, v_day.day_of_week, v_day.day_focus, v_day.is_rest, v_day.position)
      returning id into v_new_day_id;

      for v_block in select * from template_blocks where template_day_id = v_day.id order by position loop
        insert into blocks (
          day_id, exercise_id, exercise_name_freetext, category, rpe_target,
          sets, reps_or_time, time, load, rest, kinesio_notes, position
        ) values (
          v_new_day_id, v_block.exercise_id, v_block.exercise_name_freetext, v_block.category, v_block.rpe_target,
          v_block.sets, v_block.reps_or_time, v_block.time, v_block.load, v_block.rest, v_block.kinesio_notes, v_block.position
        );
      end loop;
    end loop;
  end loop;

  return v_new_mesocycle_id;
end;
$$;

grant execute on function apply_mesocycle_template(uuid, uuid, date) to authenticated;
