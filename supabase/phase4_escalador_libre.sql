-- ClimbPlan Fase 4: escalador "libre" dado de alta por un entrenador
-- Correr DESPUES de phase3_custom_forms.sql, en el SQL Editor de Supabase.
--
-- Un escalador restringido (profiles.restricted = true) es una cuenta que
-- crea directamente un Entrenador (o Admin) para uno de sus clientes, en vez
-- de que la persona se registre sola. Reglas extra sobre el escalador normal:
-- - Solo ve planes por defecto (template_mesocycles) y plantillas de
--   formulario (form_templates) creadas por SU entrenador asignado, no por
--   cualquier otro entrenador/admin publicado.
-- - No puede agregar, editar ni borrar los bloques de ejercicio de su
--   planificacion (solo puede registrar lo que hizo: series/reps/carga
--   reales, RPE real, dolor, comentario, marcar completado).

alter table profiles add column if not exists restricted boolean not null default false;

-- Helper: el usuario autenticado (si es escalador) tiene a target_user_id
-- como uno de sus entrenadores asignados.
create or replace function is_my_coach(target_user_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from coach_athletes
    where athlete_id = my_athlete_id() and coach_id = target_user_id
  )
$$;

create or replace function my_restricted() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce(restricted, false) from profiles where id = auth.uid()
$$;

-- VISIBILIDAD ACOTADA: planes por defecto -----------------------------------
drop policy if exists "template_mesocycles select" on template_mesocycles;
create policy "template_mesocycles select" on template_mesocycles for select
  using (
    my_role() = 'admin'
    or (is_published and (not my_restricted() or is_my_coach(created_by)))
  );

-- VISIBILIDAD ACOTADA: plantillas de formulario ------------------------------
drop policy if exists "form_templates select" on form_templates;
create policy "form_templates select" on form_templates for select
  using (
    my_role() <> 'escalador'
    or not my_restricted()
    or is_my_coach(created_by)
  );

-- BLOQUEO DE EDICION DE EJERCICIOS para escalador restringido ------------------
-- La RLS de "blocks" (Fase 1) ya permite al propio escalador insert/update/
-- delete de sus bloques. Este trigger agrega una capa extra: si quien edita
-- es un escalador restringido, solo puede tocar los campos de "registro
-- real" (actual_*, pain_during, comment, completed*) — nunca el ejercicio,
-- series, reps, carga o estructura del bloque prescriptos por su entrenador.
create or replace function enforce_restricted_block_edit()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if my_role() = 'escalador' and my_restricted() then
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

drop trigger if exists trg_enforce_restricted_block_edit on blocks;
create trigger trg_enforce_restricted_block_edit
  before insert or update or delete on blocks
  for each row execute function enforce_restricted_block_edit();
