-- Fase 25: 3 plantillas estándar (Principiante V0-V3, Intermedio V3-V5,
-- Avanzado V5-V7) para que cualquier escalador se las aplique sin pasar por
-- evaluación ni contexto individual. Generadas con el motor de reglas
-- (misma estructura/orden/antagonistas/calentamiento general que el
-- generador automático), con RPE e intensidad de vía escalados por nivel.
--
-- Correr en el SQL Editor de Supabase.


-- ============================================================
-- Estándar Principiante (V0-V3)
-- ============================================================
do $$
declare
  v_meso_principiante uuid;
  v_week uuid;
  v_day uuid;
begin
  insert into template_mesocycles (name, description, phase, is_published)
  values ('Estándar Principiante (V0-V3)', 'Plantilla estándar para escaladores principiantes (V0-V3), sin depender de evaluación ni contexto individual. 5 días/semana: 1 día por cada pilar de escalada (Aerobic Base, Power Endurance, Strength and Power), 1 día de fuerza de dedos, 1 día de físico general. Formato de 4 semanas (3 de carga + 1 de descarga).', 'Base / Acumulación', true)
  returning id into v_meso_principiante;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_principiante, 1, 'Ajuste', 'Acumulación: Adaptación y línea base', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '6', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '11a8ac6a-edd7-49d7-8dc7-40b344f30c01', 'Half Crimp 4 - Levantamiento - Test Máximo', 'Fingerboard', null, '3', '5 s por mano', null, 'Intensidad baja-moderada, priorizar técnica de agarre y tiempos cortos.', '3 min', 'Línea base de fuerza de dedos: registrar el máximo de cada mano.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '7c3bb1e4-7a74-4389-a0ab-0ab9cc69cd8d', 'Test de Repeticiones al 60%', 'Power Endurance', null, '1', 'Hasta el fallo', null, 'V0-V3', '-', 'Línea base de resistencia de dedos: registrar reps y caída de fuerza.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '976bf2a4-134a-4a36-b734-fbab0477a438', 'ARC medio', 'Aerobic Base', null, '1', '20 min continuos', null, 'V0-V3', '-', 'Test de línea base ARC: registrar duración, RPE y si se completó sin caer.', 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'c6a488fa-a18f-4cc3-be2e-c566c531cd51', 'Dominadas - Test de Fuerza', 'Conditioning', null, '8', '2 reps', null, null, '3 min', 'Línea base de tracción: registrar el lastre máximo con técnica limpia.', 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '4', '9', '60s', '60s', 'V0-V3', '60 s entre series', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '5', '2', '8s x 6 reps', null, null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '6', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '2', '3', '5m', '5m', 'V0-V3', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '6', '3', '3 reps', null, 'V0-V3', '6 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '6', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '2', null, '10m', '10m', 'V0-V3', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '6', '9', '20s', '20s', 'V0-V3', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '4', '3', '60s', '60s', null, '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Físico - fuerza general', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '6', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '5', '3', '10s', '10s', 'Peso corporal', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a80d576d-c4f0-4adc-944b-31181f665681', 'Kettlebell swing', 'Conditioning', '6', '3', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'de13ec8a-13b5-4ee9-a7f8-b04ac711a794', 'Apertura de pecho', 'Conditioning', '6', '3', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '6', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '24ccf2c1-729d-475a-8256-1bce10eed203', 'Flexor muñeca (palma abajo)', 'Conditioning', '6', '3', '10 reps', null, 'Definir carga (kg) según RPE objetivo', '2-3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '3', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '3', '10', '7s', '7s', 'Intensidad baja-moderada, priorizar técnica de agarre y tiempos cortos.', '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_principiante, 2, 'Carga', 'Acumulación: Progresión de carga', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '5', '10', '60s', '60s', 'V0-V3', '60 s entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '6', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '2', '3', '5m', '5m', 'V0-V3', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '7', '4', '3 reps', null, 'V0-V3', '6 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '2', null, '10m', '10m', 'V0-V3', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '7', '10', '20s', '20s', 'V0-V3', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Físico - fuerza general', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '6', '4', '10s', '10s', 'Peso corporal', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a80d576d-c4f0-4adc-944b-31181f665681', 'Kettlebell swing', 'Conditioning', '7', '4', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'de13ec8a-13b5-4ee9-a7f8-b04ac711a794', 'Apertura de pecho', 'Conditioning', '7', '4', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '24ccf2c1-729d-475a-8256-1bce10eed203', 'Flexor muñeca (palma abajo)', 'Conditioning', '7', '3', '10 reps', null, 'Definir carga (kg) según RPE objetivo', '2-3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '4', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '4', '10', '7s', '7s', 'Intensidad baja-moderada, priorizar técnica de agarre y tiempos cortos.', '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_principiante, 3, 'Choque', 'Acumulación: Pico de volumen', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '5', '12', '60s', '60s', 'V0-V3', '60 s entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '6', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '2', '3', '5m', '5m', 'V0-V3', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '7', '5', '3 reps', null, 'V0-V3', '6 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '2', null, '10m', '10m', 'V0-V3', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '7', '12', '20s', '20s', 'V0-V3', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Físico - fuerza general', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '6', '5', '10s', '10s', 'Peso corporal', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a80d576d-c4f0-4adc-944b-31181f665681', 'Kettlebell swing', 'Conditioning', '7', '5', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'de13ec8a-13b5-4ee9-a7f8-b04ac711a794', 'Apertura de pecho', 'Conditioning', '7', '5', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '24ccf2c1-729d-475a-8256-1bce10eed203', 'Flexor muñeca (palma abajo)', 'Conditioning', '7', '3', '10 reps', null, 'Definir carga (kg) según RPE objetivo', '2-3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '4', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '4', '11', '7s', '7s', 'Intensidad baja-moderada, priorizar técnica de agarre y tiempos cortos.', '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_principiante, 4, 'Descarga', 'Acumulación: Recuperación activa', '4 días de entrenamiento, 3 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '2', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '2', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '2', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '2', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '3', '6', '60s', '60s', 'V0-V3', '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '4', '1', '8s x 6 reps', null, null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '2', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '2', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '2', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '2', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '2', '2', '5m', '5m', 'V0-V3', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '5', '2', '3 reps', null, 'V0-V3', '6 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '3', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '2', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '2', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '2', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '2', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '2', null, '10m', '10m', 'V0-V3', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '5', '6', '20s', '20s', 'V0-V3', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '3', '2', '60s', '60s', null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', null, true, 4)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', null, true, 5)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

end $$;

-- ============================================================
-- Estándar Intermedio (V3-V5)
-- ============================================================
do $$
declare
  v_meso_intermedio uuid;
  v_week uuid;
  v_day uuid;
begin
  insert into template_mesocycles (name, description, phase, is_published)
  values ('Estándar Intermedio (V3-V5)', 'Plantilla estándar para escaladores de nivel intermedio (V3-V5), sin depender de evaluación ni contexto individual. 5 días/semana: 1 día por cada pilar de escalada (Aerobic Base, Power Endurance, Strength and Power), 1 día de fuerza de dedos, 1 día de físico general. Formato de 4 semanas (3 de carga + 1 de descarga).', 'Base / Acumulación', true)
  returning id into v_meso_intermedio;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_intermedio, 1, 'Ajuste', 'Acumulación: Adaptación y línea base', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '11a8ac6a-edd7-49d7-8dc7-40b344f30c01', 'Half Crimp 4 - Levantamiento - Test Máximo', 'Fingerboard', null, '3', '5 s por mano', null, 'Intensidad moderada-alta, carga isométrica progresiva.', '3 min', 'Línea base de fuerza de dedos: registrar el máximo de cada mano.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '7c3bb1e4-7a74-4389-a0ab-0ab9cc69cd8d', 'Test de Repeticiones al 60%', 'Power Endurance', null, '1', 'Hasta el fallo', null, 'V3-V5', '-', 'Línea base de resistencia de dedos: registrar reps y caída de fuerza.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '976bf2a4-134a-4a36-b734-fbab0477a438', 'ARC medio', 'Aerobic Base', null, '1', '20 min continuos', null, 'V3-V5', '-', 'Test de línea base ARC: registrar duración, RPE y si se completó sin caer.', 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'c6a488fa-a18f-4cc3-be2e-c566c531cd51', 'Dominadas - Test de Fuerza', 'Conditioning', null, '8', '2 reps', null, null, '3 min', 'Línea base de tracción: registrar el lastre máximo con técnica limpia.', 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '5', '9', '60s', '60s', 'V3-V5', '60 s entre series', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '6', '2', '8s x 6 reps', null, null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '2', '3', '5m', '5m', 'V3-V5', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '7', '3', '3 reps', null, 'V3-V5', '6 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '2', null, '10m', '10m', 'V3-V5', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '7', '9', '20s', '20s', 'V3-V5', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Físico - fuerza general', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '6', '3', '10s', '10s', 'Peso corporal', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a80d576d-c4f0-4adc-944b-31181f665681', 'Kettlebell swing', 'Conditioning', '7', '3', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'de13ec8a-13b5-4ee9-a7f8-b04ac711a794', 'Apertura de pecho', 'Conditioning', '7', '3', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '24ccf2c1-729d-475a-8256-1bce10eed203', 'Flexor muñeca (palma abajo)', 'Conditioning', '7', '3', '10 reps', null, 'Definir carga (kg) según RPE objetivo', '2-3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '4', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '4', '10', '7s', '7s', 'Intensidad moderada-alta, carga isométrica progresiva.', '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_intermedio, 2, 'Carga', 'Acumulación: Progresión de carga', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '6', '10', '60s', '60s', 'V3-V5', '60 s entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '7', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '3', '3', '5m', '5m', 'V3-V5', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '8', '4', '3 reps', null, 'V3-V5', '6 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '3', null, '10m', '10m', 'V3-V5', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '8', '10', '20s', '20s', 'V3-V5', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Físico - fuerza general', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '7', '4', '10s', '10s', 'Peso corporal', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a80d576d-c4f0-4adc-944b-31181f665681', 'Kettlebell swing', 'Conditioning', '8', '4', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'de13ec8a-13b5-4ee9-a7f8-b04ac711a794', 'Apertura de pecho', 'Conditioning', '8', '4', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '24ccf2c1-729d-475a-8256-1bce10eed203', 'Flexor muñeca (palma abajo)', 'Conditioning', '8', '3', '10 reps', null, 'Definir carga (kg) según RPE objetivo', '2-3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '5', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '5', '10', '7s', '7s', 'Intensidad moderada-alta, carga isométrica progresiva.', '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_intermedio, 3, 'Choque', 'Acumulación: Pico de volumen', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '6', '12', '60s', '60s', 'V3-V5', '60 s entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '7', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '3', '3', '5m', '5m', 'V3-V5', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '8', '5', '3 reps', null, 'V3-V5', '6 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '3', null, '10m', '10m', 'V3-V5', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '8', '12', '20s', '20s', 'V3-V5', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Físico - fuerza general', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '7', '5', '10s', '10s', 'Peso corporal', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a80d576d-c4f0-4adc-944b-31181f665681', 'Kettlebell swing', 'Conditioning', '8', '5', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'de13ec8a-13b5-4ee9-a7f8-b04ac711a794', 'Apertura de pecho', 'Conditioning', '8', '5', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '24ccf2c1-729d-475a-8256-1bce10eed203', 'Flexor muñeca (palma abajo)', 'Conditioning', '8', '3', '10 reps', null, 'Definir carga (kg) según RPE objetivo', '2-3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '5', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '5', '11', '7s', '7s', 'Intensidad moderada-alta, carga isométrica progresiva.', '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_intermedio, 4, 'Descarga', 'Acumulación: Recuperación activa', '4 días de entrenamiento, 3 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '3', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '3', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '3', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '3', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '4', '6', '60s', '60s', 'V3-V5', '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '5', '1', '8s x 6 reps', null, null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '3', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '3', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '3', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '3', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '2', '2', '5m', '5m', 'V3-V5', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '6', '2', '3 reps', null, 'V3-V5', '6 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '4', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '3', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '3', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '3', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '3', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '2', null, '10m', '10m', 'V3-V5', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '6', '6', '20s', '20s', 'V3-V5', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '4', '2', '60s', '60s', null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', null, true, 4)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', null, true, 5)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

end $$;

-- ============================================================
-- Estándar Avanzado (V5-V7)
-- ============================================================
do $$
declare
  v_meso_avanzado uuid;
  v_week uuid;
  v_day uuid;
begin
  insert into template_mesocycles (name, description, phase, is_published)
  values ('Estándar Avanzado (V5-V7)', 'Plantilla estándar para escaladores avanzados (V5-V7), sin depender de evaluación ni contexto individual. Incluye Campus board y Tension/Kilter/Moonboard. 5 días/semana: 1 día por cada pilar de escalada (Aerobic Base, Power Endurance, Strength and Power), 1 día de fuerza de dedos, 1 día de físico general. Formato de 4 semanas (3 de carga + 1 de descarga).', 'Base / Acumulación', true)
  returning id into v_meso_avanzado;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_avanzado, 1, 'Ajuste', 'Acumulación: Adaptación y línea base', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '11a8ac6a-edd7-49d7-8dc7-40b344f30c01', 'Half Crimp 4 - Levantamiento - Test Máximo', 'Fingerboard', null, '3', '5 s por mano', null, 'Intensidad alta, cerca de la capacidad máxima individual.', '3 min', 'Línea base de fuerza de dedos: registrar el máximo de cada mano.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '7c3bb1e4-7a74-4389-a0ab-0ab9cc69cd8d', 'Test de Repeticiones al 60%', 'Power Endurance', null, '1', 'Hasta el fallo', null, 'V5-V7', '-', 'Línea base de resistencia de dedos: registrar reps y caída de fuerza.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '976bf2a4-134a-4a36-b734-fbab0477a438', 'ARC medio', 'Aerobic Base', null, '1', '20 min continuos', null, 'V5-V7', '-', 'Test de línea base ARC: registrar duración, RPE y si se completó sin caer.', 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'c6a488fa-a18f-4cc3-be2e-c566c531cd51', 'Dominadas - Test de Fuerza', 'Conditioning', null, '8', '2 reps', null, null, '3 min', 'Línea base de tracción: registrar el lastre máximo con técnica limpia.', 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '6', '9', '60s', '60s', 'V5-V7', '60 s entre series', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '7', '2', '8s x 6 reps', null, null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '3', '3', '5m', '5m', 'V5-V7', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '8', '3', '3 reps', null, 'V5-V7', '6 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '3', null, '10m', '10m', 'V5-V7', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e99bd-8c83-407e-954c-7b78f60ebb8b', 'Board send', 'Strength and Power', '7', null, '60m', '60m', 'V5-V7', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Físico - fuerza general', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '7', '3', '10s', '10s', 'Peso corporal', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a80d576d-c4f0-4adc-944b-31181f665681', 'Kettlebell swing', 'Conditioning', '8', '3', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'de13ec8a-13b5-4ee9-a7f8-b04ac711a794', 'Apertura de pecho', 'Conditioning', '8', '3', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '24ccf2c1-729d-475a-8256-1bce10eed203', 'Flexor muñeca (palma abajo)', 'Conditioning', '8', '3', '10 reps', null, 'Definir carga (kg) según RPE objetivo', '2-3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '5', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '5', '10', '7s', '7s', 'Intensidad alta, cerca de la capacidad máxima individual.', '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_avanzado, 2, 'Carga', 'Acumulación: Progresión de carga', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '7', '10', '60s', '60s', 'V5-V7', '60 s entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '8', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '4', '3', '5m', '5m', 'V5-V7', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '9', '4', '3 reps', null, 'V5-V7', '6 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '4', null, '10m', '10m', 'V5-V7', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e99bd-8c83-407e-954c-7b78f60ebb8b', 'Board send', 'Strength and Power', '8', null, '60m', '60m', 'V5-V7', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '7', '3', '60s', '60s', null, '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Físico - fuerza general', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '8', '4', '10s', '10s', 'Peso corporal', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a80d576d-c4f0-4adc-944b-31181f665681', 'Kettlebell swing', 'Conditioning', '9', '4', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'de13ec8a-13b5-4ee9-a7f8-b04ac711a794', 'Apertura de pecho', 'Conditioning', '9', '4', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '24ccf2c1-729d-475a-8256-1bce10eed203', 'Flexor muñeca (palma abajo)', 'Conditioning', '9', '3', '10 reps', null, 'Definir carga (kg) según RPE objetivo', '2-3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '6', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '6', '10', '7s', '7s', 'Intensidad alta, cerca de la capacidad máxima individual.', '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_avanzado, 3, 'Choque', 'Acumulación: Pico de volumen', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '7', '12', '60s', '60s', 'V5-V7', '60 s entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '8', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '4', '3', '5m', '5m', 'V5-V7', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '9', '5', '3 reps', null, 'V5-V7', '6 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '4', null, '10m', '10m', 'V5-V7', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e99bd-8c83-407e-954c-7b78f60ebb8b', 'Board send', 'Strength and Power', '8', null, '60m', '60m', 'V5-V7', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '7', '3', '60s', '60s', null, '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Físico - fuerza general', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '8', '5', '10s', '10s', 'Peso corporal', '3 min entre series', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a80d576d-c4f0-4adc-944b-31181f665681', 'Kettlebell swing', 'Conditioning', '9', '5', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'de13ec8a-13b5-4ee9-a7f8-b04ac711a794', 'Apertura de pecho', 'Conditioning', '9', '5', '6 reps', null, 'Definir carga (kg) según RPE objetivo', '3 min entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '24ccf2c1-729d-475a-8256-1bce10eed203', 'Flexor muñeca (palma abajo)', 'Conditioning', '9', '3', '10 reps', null, 'Definir carga (kg) según RPE objetivo', '2-3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '6', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '6', '11', '7s', '7s', 'Intensidad alta, cerca de la capacidad máxima individual.', '60 s entre series', null, 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso_avanzado, 4, 'Descarga', 'Acumulación: Recuperación activa', '4 días de entrenamiento, 3 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3ffab406-0572-43b4-97d3-f4ae301d3dee', '1 on / 1 off', 'Aerobic Base', '5', '6', '60s', '60s', 'V5-V7', '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '6', '1', '8s x 6 reps', null, null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '2c354254-76be-416a-9536-d6c12dce1ffc', '5 on / 3 off', 'Aerobic Base', '3', '2', '5m', '5m', 'V5-V7', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1b82c753-f4cc-4d2b-8dd3-16e95d4acc9b', '30 Movimientos Fraccionados', 'Power Endurance', '7', '2', '3 reps', null, 'V5-V7', '6 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Miércoles', 'Escalada - fuerza e intensidad', false, 3)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '8db73bc2-f31b-46c7-9fca-cec351ab6c31', 'Leg Swings', 'Conditioning', '4', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '347918f3-89c9-4b78-8a90-bb4712f20fd2', 'Split Squat Warm Up', 'Conditioning', '4', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '676757c8-aff3-456d-b1e8-d2ce6cabfeb2', 'Horse Stance Reps', 'Conditioning', '4', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'bcac4c9c-4990-4932-b171-bee24bfb6dc1', 'Scapular Press Ups', 'Conditioning', '4', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '22284c5a-6b85-4221-a651-76574b3c5865', 'ARC bajo', 'Aerobic Base', '3', null, '10m', '10m', 'V5-V7', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e99bd-8c83-407e-954c-7b78f60ebb8b', 'Board send', 'Strength and Power', '6', null, '60m', '60m', 'V5-V7', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '5', '2', '60s', '60s', null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 8);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', null, true, 4)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', null, true, 5)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', null, true, 6)
  returning id into v_day;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Domingo', null, true, 7)
  returning id into v_day;

end $$;
