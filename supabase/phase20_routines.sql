-- Fase 20: rutinas (circuitos armados por el entrenador a partir de
-- ejercicios individuales) + migración de los ejercicios "compuestos" que
-- hoy existen en el catálogo (un solo registro que en realidad agrupa varios
-- ejercicios distintos, ej. "Core Piso 1: - V sits - Hollow body - ...").
--
-- El objetivo: el catálogo (/catalogo) muestra solo ejercicios individuales;
-- las Rutinas son una entidad aparte, dentro del mismo módulo, que el
-- entrenador arma eligiendo ejercicios individuales existentes. El generador
-- automático de mesociclos sigue trabajando solo con ejercicios individuales
-- (no elige Rutinas); las Rutinas son una herramienta manual del editor de
-- mesociclo (+ Insertar rutina), que expande la rutina en N bloques
-- individuales.
--
-- Correr en el SQL Editor de Supabase.

-- RUTINAS ------------------------------------------------------------------
create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists routine_items (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  position int not null default 0,
  -- Overrides opcionales: si son null, se usa el typical_* del ejercicio.
  sets text,
  reps_or_time text,
  time text,
  rest text,
  created_at timestamptz not null default now()
);

create index if not exists idx_routine_items_routine on routine_items(routine_id, position);

alter table routines enable row level security;
alter table routine_items enable row level security;

drop policy if exists "routines select" on routines;
create policy "routines select" on routines for select
  using (auth.role() = 'authenticated');
drop policy if exists "routines write admin only" on routines;
create policy "routines write admin only" on routines for insert
  with check (my_role() = 'admin');
drop policy if exists "routines update admin only" on routines;
create policy "routines update admin only" on routines for update
  using (my_role() = 'admin') with check (my_role() = 'admin');
drop policy if exists "routines delete admin only" on routines;
create policy "routines delete admin only" on routines for delete
  using (my_role() = 'admin');

drop policy if exists "routine_items select" on routine_items;
create policy "routine_items select" on routine_items for select
  using (auth.role() = 'authenticated');
drop policy if exists "routine_items write admin only" on routine_items;
create policy "routine_items write admin only" on routine_items for insert
  with check (my_role() = 'admin');
drop policy if exists "routine_items update admin only" on routine_items;
create policy "routine_items update admin only" on routine_items for update
  using (my_role() = 'admin') with check (my_role() = 'admin');
drop policy if exists "routine_items delete admin only" on routine_items;
create policy "routine_items delete admin only" on routine_items for delete
  using (my_role() = 'admin');

-- MIGRACIÓN DE COMPUESTOS ----------------------------------------------------
-- Un "compuesto" es un ejercicio cuyo name tiene varias líneas: la primera es
-- el título del circuito, el resto son los ítems ("- Sit up", "- Plancha...").
-- Reutiliza un ejercicio individual existente si el nombre ya matchea
-- (case-insensitive) uno de la misma categoría, para no duplicar catálogo
-- (ej. "Push up", "Peso Muerto", "Press Banca" ya existen sueltos).

create or replace function find_or_create_exercise(
  p_name text,
  p_category text,
  p_equipment jsonb,
  p_typical_sets text,
  p_typical_reps text,
  p_typical_time text,
  p_typical_effort text
) returns uuid
language plpgsql as $$
declare
  v_id uuid;
begin
  select id into v_id
  from exercises
  where category = p_category
    and lower(trim(name)) = lower(trim(p_name))
  limit 1;

  if v_id is null then
    insert into exercises (name, category, equipment_required, typical_sets, typical_reps, typical_time, typical_effort, muscle_groups, is_benchmark)
    values (trim(p_name), p_category, coalesce(p_equipment, '[]'::jsonb), p_typical_sets, p_typical_reps, p_typical_time, p_typical_effort, '[]'::jsonb, false)
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

create or replace function migrate_composite_to_routine(p_exercise_id uuid) returns uuid
language plpgsql as $$
declare
  v_exercise record;
  v_lines text[];
  v_title text;
  v_item text;
  v_position int := 0;
  v_routine_id uuid;
  v_item_exercise_id uuid;
begin
  select * into v_exercise from exercises where id = p_exercise_id;
  if not found then
    raise exception 'Ejercicio % no encontrado', p_exercise_id;
  end if;

  v_lines := regexp_split_to_array(v_exercise.name, E'\r?\n');
  v_title := trim(trailing ':' from trim(v_lines[1]));

  insert into routines (name, category, description)
  values (v_title, v_exercise.category, v_exercise.description)
  returning id into v_routine_id;

  for i in 2 .. array_length(v_lines, 1) loop
    v_item := trim(v_lines[i]);
    v_item := regexp_replace(v_item, '^-+\s*', '');
    v_item := trim(trailing ':' from v_item);
    if v_item = '' then
      continue;
    end if;

    v_position := v_position + 1;
    v_item_exercise_id := find_or_create_exercise(
      v_item, v_exercise.category, v_exercise.equipment_required,
      v_exercise.typical_sets, v_exercise.typical_reps, v_exercise.typical_time, v_exercise.typical_effort
    );

    insert into routine_items (routine_id, exercise_id, position)
    values (v_routine_id, v_item_exercise_id, v_position);
  end loop;

  delete from exercises where id = p_exercise_id;

  return v_routine_id;
end;
$$;

do $$
declare
  v_id uuid;
begin
  for v_id in select id from exercises where position(chr(10) in name) > 0 loop
    perform migrate_composite_to_routine(v_id);
  end loop;
end $$;
