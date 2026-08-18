-- ClimbPlan Fase 41: swap_block_exercise -- alternativas ante dolor (Fase 3.1
-- del plan de entrevistas, pedido #4 de Suri).
-- Correr DESPUES de phase40_coach_alerts.sql, en el SQL Editor de Supabase.
--
-- Un escalador restringido (profiles.restricted, ver phase4_escalador_libre.sql)
-- no puede tocar blocks.exercise_id/exercise_name_freetext directamente: el
-- trigger enforce_restricted_block_edit se lo bloquea porque esos campos son
-- prescriptos por el entrenador. Pero SI debe poder intercambiar un ejercicio
-- por una alternativa sugerida cuando reporta dolor en la sesión guiada --
-- ese es justo el caso de uso mas importante para este RPC. security definer
-- + can_access_athlete() hace el chequeo de permiso explícito adentro de la
-- función (mismo patrón que apply_mesocycle_template); set_config marca la
-- transacción para que el trigger de bloqueo deje pasar este cambio puntual,
-- sin abrir la puerta a que un escalador restringido edite bloques por su cuenta.

create or replace function swap_block_exercise(
  p_block_id uuid,
  p_exercise_id uuid,
  p_exercise_name text,
  p_note text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_day_id uuid;
  v_athlete_id uuid;
begin
  select day_id into v_day_id from blocks where id = p_block_id;
  if v_day_id is null then
    raise exception 'Bloque no encontrado.';
  end if;

  v_athlete_id := day_athlete_id(v_day_id);
  if not can_access_athlete(v_athlete_id) then
    raise exception 'No autorizado.';
  end if;

  perform set_config('app.swap_in_progress', 'true', true);

  update blocks
    set exercise_id = p_exercise_id,
        exercise_name_freetext = coalesce(p_exercise_name, exercise_name_freetext),
        kinesio_notes = p_note,
        manually_edited = true
    where id = p_block_id;
end;
$$;

grant execute on function swap_block_exercise(uuid, uuid, text, text) to authenticated;

-- Deja pasar el swap explícito (marcado por set_config arriba) a través del
-- trigger de bloqueo, sin tocar ninguna otra restricción existente.
create or replace function enforce_restricted_block_edit()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if my_role() = 'escalador' and my_restricted()
     and coalesce(current_setting('app.swap_in_progress', true), '') <> 'true' then
    if TG_OP = 'INSERT' then
      raise exception 'Tu entrenador es quien agrega los ejercicios de tu planificacion.';
    end if;
    if TG_OP = 'DELETE' then
      raise exception 'Tu entrenador es quien puede quitar ejercicios de tu planificacion.';
    end if;
    if TG_OP = 'UPDATE' then
      if NEW.exercise_id is distinct from OLD.exercise_id
        or NEW.exercise_name_freetext is distinct from OLD.exercise_name_freetext
        or NEW.category is distinct from OLD.category
        or NEW.rpe_target is distinct from OLD.rpe_target
        or NEW.sets is distinct from OLD.sets
        or NEW.reps_or_time is distinct from OLD.reps_or_time
        or NEW.time is distinct from OLD.time
        or NEW.load is distinct from OLD.load
        or NEW.rest is distinct from OLD.rest
        or NEW.kinesio_notes is distinct from OLD.kinesio_notes
        or NEW.day_id is distinct from OLD.day_id
        or NEW.position is distinct from OLD.position
      then
        raise exception 'Solo podes registrar lo que hiciste, no modificar el ejercicio planificado.';
      end if;
    end if;
  end if;
  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$;
