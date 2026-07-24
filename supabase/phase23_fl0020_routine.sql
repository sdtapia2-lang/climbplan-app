-- Fase 23: FL0020 "Mantenimiento de Flexibilidad" es también una rutina.
-- Su descripción dice "patadas, pancake, rana, paloma, estiramiento de sofá,
-- estiramiento de gemelo, estiramiento de pecho y estiramiento de dorsal" --
-- "patadas" y "pancake" son genéricos, así que se asumen ambas variantes que
-- ya existen en el catálogo (frontales+laterales, de pie+pulsos). Para
-- "estiramiento de dorsal" se reutiliza el Pullover de Dorsales existente
-- (mismo grupo muscular; no hay una versión sin mancuerna en el catálogo).
--
-- Depende de que la fase 22 ya haya corrido (crea "Estiramiento de Sofá");
-- si se corre en el mismo batch después de la 22, find_or_create_exercise
-- lo encuentra en vez de duplicarlo.
--
-- Correr en el SQL Editor de Supabase (después de phase22).

do $$
declare
  v_routine_id uuid;
begin
  insert into routines (name, category, description)
  select name, category, description from exercises where code = 'FL0020'
  returning id into v_routine_id;

  insert into routine_items (routine_id, exercise_id, position) values
    (v_routine_id, (select id from exercises where code = 'FL0024'), 1),
    (v_routine_id, (select id from exercises where code = 'FL0025'), 2),
    (v_routine_id, (select id from exercises where code = 'FL0022'), 3),
    (v_routine_id, (select id from exercises where code = 'FL0023'), 4),
    (v_routine_id, (select id from exercises where code = 'FL0032'), 5),
    (v_routine_id, (select id from exercises where code = 'FL0028'), 6),
    (v_routine_id, find_or_create_exercise('Estiramiento de Sofá', 'Flexibility', '["Peso corporal"]'::jsonb, '3', null, '60s', 'Deep Stretch'), 7),
    (v_routine_id, (select id from exercises where code = 'FL0008'), 8),
    (v_routine_id, (select id from exercises where code = 'FL0011'), 9),
    (v_routine_id, (select id from exercises where code = 'FL0029'), 10);

  delete from exercises where code = 'FL0020';
end $$;
