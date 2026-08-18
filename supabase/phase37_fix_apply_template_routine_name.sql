-- FIX: apply_mesocycle_template omitia routine_name -------------------------
-- phase33_routine_grouping.sql agrego la columna routine_name a blocks y
-- template_blocks, pero nunca redefinio apply_mesocycle_template (phase2).
-- Resultado: al aplicar cualquier plantilla, los bloques que venian agrupados
-- como rutina (ej. el calentamiento) se insertaban sueltos, con routine_name
-- null, y el agrupamiento visual de MesocycleEditor.groupBlocksForRender se
-- perdia.
--
-- No hay backfill confiable para mesociclos ya aplicados: no queda registro de
-- que bloques venian de que rutina en el momento de la aplicacion original.
-- Este fix solo corrige las aplicaciones futuras.

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
          sets, reps_or_time, time, load, rest, kinesio_notes, routine_name, position
        ) values (
          v_new_day_id, v_block.exercise_id, v_block.exercise_name_freetext, v_block.category, v_block.rpe_target,
          v_block.sets, v_block.reps_or_time, v_block.time, v_block.load, v_block.rest, v_block.kinesio_notes,
          v_block.routine_name, v_block.position
        );
      end loop;
    end loop;
  end loop;

  return v_new_mesocycle_id;
end;
$$;

grant execute on function apply_mesocycle_template(uuid, uuid, date) to authenticated;
