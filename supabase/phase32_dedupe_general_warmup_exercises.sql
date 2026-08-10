-- Fase 32: elimina los ejercicios duplicados del calentamiento "General Warm Up".
--
-- Causa raiz: phase24_general_warmup.sql hace `insert into exercises` directo
-- (sin pasar por find_or_create_exercise) para "Leg Swings", "Split Squat
-- Warm Up", "Horse Stance Reps" y "Scapular Press Ups", y phase26 documenta
-- que ese script se corrio 3 veces. phase26 ya dedupe las filas de `routines`
-- (se quedo con la rutina "General Warm Up" mas antigua), pero nunca dedupe
-- la tabla `exercises`: hoy existen 3 filas por cada uno de esos 4 nombres
-- (12 filas en total, codes CD0135/CD0139/CD0143, CD0136/CD0140/CD0144,
-- CD0137/CD0141/CD0145 y CD0138/CD0142/CD0146). Esto rompe las `key` de React
-- en los <datalist> de MesocycleEditor/TemplateEditor y vuelve no
-- deterministico el matching por nombre (onExerciseNameBlur).
--
-- Estrategia: para cada nombre duplicado, nos quedamos con el exercise_id
-- que tiene MAS referencias reales en conjunto entre routine_items, blocks y
-- template_blocks (si hay empate, con el code mas bajo -- el primero creado).
-- Repuntamos todas las referencias de los duplicados a ese id y recien
-- despues borramos las filas ya sin referencias.
--
-- Correr en el SQL Editor de Supabase.

do $$
declare
  v_name text;
  v_names text[] := array[
    'Leg Swings',
    'Split Squat Warm Up',
    'Horse Stance Reps',
    'Scapular Press Ups'
  ];
  v_keep_id uuid;
  v_keep_code text;
  v_total_before int;
  v_total_after int;
  v_dupes_deleted int := 0;
  v_ri_repointed int;
  v_blocks_repointed int;
  v_tb_repointed int;
  v_deleted_count int;
begin
  select count(*) into v_total_before
  from exercises
  where lower(trim(name)) = any (select lower(trim(n)) from unnest(v_names) as n);

  raise notice 'Filas en exercises para los 4 nombres (antes): %', v_total_before;

  foreach v_name in array v_names loop
    select e.id, e.code
    into v_keep_id, v_keep_code
    from exercises e
    left join routine_items ri on ri.exercise_id = e.id
    left join blocks b on b.exercise_id = e.id
    left join template_blocks tb on tb.exercise_id = e.id
    where lower(trim(e.name)) = lower(trim(v_name))
      and e.category = 'Conditioning'
    group by e.id, e.code
    order by (count(distinct ri.id) + count(distinct b.id) + count(distinct tb.id)) desc,
             e.code asc
    limit 1;

    if v_keep_id is null then
      raise notice '"%": no se encontraron filas, se saltea.', v_name;
      continue;
    end if;

    update routine_items
    set exercise_id = v_keep_id
    where exercise_id in (
      select id from exercises
      where lower(trim(name)) = lower(trim(v_name))
        and category = 'Conditioning'
        and id <> v_keep_id
    );
    get diagnostics v_ri_repointed = row_count;

    update blocks
    set exercise_id = v_keep_id
    where exercise_id in (
      select id from exercises
      where lower(trim(name)) = lower(trim(v_name))
        and category = 'Conditioning'
        and id <> v_keep_id
    );
    get diagnostics v_blocks_repointed = row_count;

    update template_blocks
    set exercise_id = v_keep_id
    where exercise_id in (
      select id from exercises
      where lower(trim(name)) = lower(trim(v_name))
        and category = 'Conditioning'
        and id <> v_keep_id
    );
    get diagnostics v_tb_repointed = row_count;

    raise notice '"%": conserva id % (code %) -- repuntados: % routine_items, % blocks, % template_blocks',
      v_name, v_keep_id, v_keep_code, v_ri_repointed, v_blocks_repointed, v_tb_repointed;

    delete from exercises
    where lower(trim(name)) = lower(trim(v_name))
      and category = 'Conditioning'
      and id <> v_keep_id;
    get diagnostics v_deleted_count = row_count;
    v_dupes_deleted := v_dupes_deleted + v_deleted_count;
  end loop;

  select count(*) into v_total_after
  from exercises
  where lower(trim(name)) = any (select lower(trim(n)) from unnest(v_names) as n);

  raise notice 'Filas en exercises para los 4 nombres (despues): % (borradas: %)', v_total_after, v_dupes_deleted;

  if v_total_after <> array_length(v_names, 1) then
    raise exception 'Se esperaban % filas (una por nombre) y quedaron %. Revisar antes de confiar en el resultado.',
      array_length(v_names, 1), v_total_after;
  end if;

  if exists (
    select 1 from blocks b
    join exercises e on e.id = b.exercise_id
    where lower(trim(e.name)) = any (select lower(trim(n)) from unnest(v_names) as n)
    group by lower(trim(e.name))
    having count(distinct e.id) > 1
  ) or exists (
    select 1 from template_blocks tb
    join exercises e on e.id = tb.exercise_id
    where lower(trim(e.name)) = any (select lower(trim(n)) from unnest(v_names) as n)
    group by lower(trim(e.name))
    having count(distinct e.id) > 1
  ) or exists (
    select 1 from routine_items ri
    join exercises e on e.id = ri.exercise_id
    where lower(trim(e.name)) = any (select lower(trim(n)) from unnest(v_names) as n)
    group by lower(trim(e.name))
    having count(distinct e.id) > 1
  ) then
    raise exception 'Quedaron referencias apuntando a mas de un exercise_id distinto para el mismo nombre -- revisar manualmente.';
  end if;
end $$;
