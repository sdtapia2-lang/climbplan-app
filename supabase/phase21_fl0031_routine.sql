-- Fase 21: FL0031 "Pulsos y Patadas" es en realidad una rutina de 3
-- ejercicios (patadas laterales, patadas frontales, pulsos de pancake) que
-- ya existen sueltos en el catálogo (FL0025, FL0024, FL0023) -- no tenía
-- saltos de línea en el name, por eso la migración de fase 20 no lo agarró.
--
-- Correr en el SQL Editor de Supabase.

do $$
declare
  v_routine_id uuid;
begin
  insert into routines (name, category, description)
  select name, category, description from exercises where code = 'FL0031'
  returning id into v_routine_id;

  insert into routine_items (routine_id, exercise_id, position)
  values
    (v_routine_id, (select id from exercises where code = 'FL0025'), 1),
    (v_routine_id, (select id from exercises where code = 'FL0024'), 2),
    (v_routine_id, (select id from exercises where code = 'FL0023'), 3);

  delete from exercises where code = 'FL0031';
end $$;
