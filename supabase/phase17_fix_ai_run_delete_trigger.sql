-- Fase 17: permitir borrar un mesociclo que tiene un ai_generation_run asociado.
--
-- Bug: ai_generation_runs.mesocycle_id tiene "on delete set null" (fase 9), asi
-- que al borrar un mesociclo, Postgres hace un UPDATE automatico sobre
-- ai_generation_runs para poner mesocycle_id = null. Ese UPDATE corre con el
-- rol "authenticated" (el del usuario logueado) y activa el trigger
-- enforce_ai_run_ack_only, que solo permite tocar acknowledged_at -- bloqueando
-- tambien este cambio legitimo con "Solo se puede marcar como visto
-- (acknowledged_at)." y dejando el mesociclo sin poder borrarse.
--
-- Fix: permitir puntualmente que mesocycle_id pase a null (el caso del delete
-- en cascada); se sigue bloqueando cualquier otro cambio no autorizado, incluido
-- que mesocycle_id cambie a otro valor no nulo.
--
-- Correr en el SQL Editor de Supabase.

create or replace function enforce_ai_run_ack_only()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'authenticated' then
    if NEW.status is distinct from OLD.status
      or (NEW.mesocycle_id is distinct from OLD.mesocycle_id and NEW.mesocycle_id is not null)
      or NEW.trigger_type is distinct from OLD.trigger_type
      or NEW.trigger_ref_id is distinct from OLD.trigger_ref_id
      or NEW.error_message is distinct from OLD.error_message
      or NEW.model is distinct from OLD.model
      or NEW.completed_at is distinct from OLD.completed_at
    then
      raise exception 'Solo se puede marcar como visto (acknowledged_at).';
    end if;
  end if;
  return NEW;
end;
$$;
