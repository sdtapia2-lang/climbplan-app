-- Fase 22: 3 ejercicios más de Flexibility que en realidad son rutinas
-- (prosa en la descripción listando varios movimientos), encontrados
-- comparando contra las capturas de la app Lattice Training para confirmar
-- los nombres en inglés de los ítems que no existían sueltos en el catálogo.
--
-- FL0021 "Movilidad Matutina" == "Morning Mobility" de Lattice: sage twist,
--   puppy pose, wall calf stretch (ya existe FL0008), side runner, pigeon
--   pose (ya existe FL0028), yogi squat.
-- FL0018 "Glúteos e Isquiotibiales": estiramiento de sofá (Couch Stretch),
--   pancake de pie (ya existe FL0022), postura de paloma (FL0028), split
--   lateral ISO (FL0038).
-- FL0001 "Aductores de Cadera": mariposa (Butterfly Passive, confirmado por
--   captura de Lattice), split lateral ISO (FL0038), rana (ya existe FL0032
--   Rana Supina), medio split lateral (Half Side Split de Lattice).
--
-- Reusa find_or_create_exercise() de la fase 20 (ya existe en la base).
-- Correr en el SQL Editor de Supabase.

do $$
declare
  v_routine_id uuid;
begin
  -- FL0021 Movilidad Matutina
  insert into routines (name, category, description)
  select name, category, description from exercises where code = 'FL0021'
  returning id into v_routine_id;

  insert into routine_items (routine_id, exercise_id, position) values
    (v_routine_id, find_or_create_exercise('Giro de Sabio', 'Flexibility', '["Peso corporal"]'::jsonb, null, null, '30s', 'Deep Stretch'), 1),
    (v_routine_id, find_or_create_exercise('Postura de Cachorro', 'Flexibility', '["Peso corporal"]'::jsonb, null, null, '30s', 'Deep Stretch'), 2),
    (v_routine_id, (select id from exercises where code = 'FL0008'), 3),
    (v_routine_id, find_or_create_exercise('Side Runner', 'Flexibility', '["Peso corporal"]'::jsonb, '3', null, '10s', 'Deep Stretch'), 4),
    (v_routine_id, (select id from exercises where code = 'FL0028'), 5),
    (v_routine_id, find_or_create_exercise('Sentadilla Yogui', 'Flexibility', '["Peso corporal"]'::jsonb, '2', null, '30s', 'Deep Stretch'), 6);

  delete from exercises where code = 'FL0021';

  -- FL0018 Glúteos e Isquiotibiales
  insert into routines (name, category, description)
  select name, category, description from exercises where code = 'FL0018'
  returning id into v_routine_id;

  insert into routine_items (routine_id, exercise_id, position) values
    (v_routine_id, find_or_create_exercise('Estiramiento de Sofá', 'Flexibility', '["Peso corporal"]'::jsonb, '3', null, '60s', 'Deep Stretch'), 1),
    (v_routine_id, (select id from exercises where code = 'FL0022'), 2),
    (v_routine_id, (select id from exercises where code = 'FL0028'), 3),
    (v_routine_id, (select id from exercises where code = 'FL0038'), 4);

  delete from exercises where code = 'FL0018';

  -- FL0001 Aductores de Cadera
  insert into routines (name, category, description)
  select name, category, description from exercises where code = 'FL0001'
  returning id into v_routine_id;

  insert into routine_items (routine_id, exercise_id, position) values
    (v_routine_id, find_or_create_exercise('Mariposa', 'Flexibility', '["Peso corporal"]'::jsonb, '3', null, '60s', 'Deep Stretch'), 1),
    (v_routine_id, (select id from exercises where code = 'FL0038'), 2),
    (v_routine_id, (select id from exercises where code = 'FL0032'), 3),
    (v_routine_id, find_or_create_exercise('Medio Split Lateral', 'Flexibility', '["Peso corporal"]'::jsonb, '3', null, '60s', 'Deep Stretch'), 4);

  delete from exercises where code = 'FL0001';
end $$;
