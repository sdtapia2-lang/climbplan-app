-- Fase 24: "General Warm Up" -- calentamiento general fijo que reemplaza al
-- calentamiento de Flexibility elegido al azar como primer bloque del día.
-- Basado en la sesión "General Warm Up" de Lattice Training (12 min,
-- Resistance Bands): Leg Swings, Split Squat Warm Up, Horse Stance Reps,
-- Scapular Press Ups, Face Pulls.
--
-- Face Pulls ya existe (CD0040); los otros 4 son nuevos. Se crea también
-- como Rutina (para poder insertarla a mano desde /catalogo o el editor de
-- mesociclo), y el motor de reglas la prepende como bloques fijos al
-- principio de cada día de entrenamiento (ver generatePlan.ts).
--
-- Correr en el SQL Editor de Supabase.

do $$
declare
  v_routine_id uuid;
  v_leg_swings uuid;
  v_split_squat uuid;
  v_horse_stance uuid;
  v_scapular uuid;
  v_face_pulls uuid;
begin
  insert into exercises (name, category, equipment_required, typical_sets, typical_reps, typical_effort, description, muscle_groups, is_benchmark)
  values ('Leg Swings', 'Conditioning', '["Peso corporal"]'::jsonb, '2', '10 reps', 'Easy Effort', 'Descanso: 15 s entre series', '[]'::jsonb, false)
  returning id into v_leg_swings;

  insert into exercises (name, category, equipment_required, typical_sets, typical_reps, typical_effort, description, muscle_groups, is_benchmark)
  values ('Split Squat Warm Up', 'Conditioning', '["Peso corporal"]'::jsonb, '2', '6 reps', 'Easy Effort', 'Descanso: 15 s entre series', '[]'::jsonb, false)
  returning id into v_split_squat;

  insert into exercises (name, category, equipment_required, typical_sets, typical_reps, typical_effort, description, muscle_groups, is_benchmark)
  values ('Horse Stance Reps', 'Conditioning', '["Peso corporal"]'::jsonb, '2', '6 reps', 'Easy Effort', 'Descanso: 15 s entre series', '[]'::jsonb, false)
  returning id into v_horse_stance;

  insert into exercises (name, category, equipment_required, typical_sets, typical_reps, typical_effort, description, muscle_groups, is_benchmark)
  values ('Scapular Press Ups', 'Conditioning', '["Peso corporal"]'::jsonb, '2', '10 reps', 'Easy Effort', 'Descanso: 15 s entre series', '[]'::jsonb, false)
  returning id into v_scapular;

  select id into v_face_pulls from exercises where code = 'CD0040';

  insert into routines (name, category, description)
  values (
    'General Warm Up',
    'Conditioning',
    'Un calentamiento general que combina movilidad y activación para preparar el cuerpo antes de entrenar. Objetivo: activar los grupos musculares clave y generar flujo sanguíneo con movimiento progresivo y controlado.'
  )
  returning id into v_routine_id;

  insert into routine_items (routine_id, exercise_id, position, sets, reps_or_time, rest) values
    (v_routine_id, v_leg_swings, 1, '2', '10 reps', '15s'),
    (v_routine_id, v_split_squat, 2, '2', '6 reps', '15s'),
    (v_routine_id, v_horse_stance, 3, '2', '6 reps', '15s'),
    (v_routine_id, v_scapular, 4, '2', '10 reps', '15s'),
    (v_routine_id, v_face_pulls, 5, '2', '10 reps', '15s');
end $$;
