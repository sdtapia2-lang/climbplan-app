-- Fase 26: elimina las rutinas "General Warm Up" duplicadas.
-- El script phase24 se corrio 3 veces (no era idempotente para la rutina en si,
-- solo los ejercicios via find_or_create_exercise), dejando 3 filas identicas
-- en `routines`, cada una con sus 5 routine_items. Nos quedamos con la mas
-- antigua y borramos el resto (routine_items cae en cascada).

do $$
declare
  v_keep_id uuid;
begin
  select id into v_keep_id
  from routines
  where name = 'General Warm Up'
  order by created_at asc
  limit 1;

  delete from routines
  where name = 'General Warm Up'
    and id <> v_keep_id;
end $$;
