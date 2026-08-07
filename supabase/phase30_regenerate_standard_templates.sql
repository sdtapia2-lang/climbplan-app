-- Fase 30: borra y regenera las 3 plantillas estándar (Principiante V0-V3,
-- Intermedio V3-V5, Avanzado V5-V7) con el motor de reglas actual (sesiones
-- combinadas de fuerza+boulder y calentamiento rotado -- fases 28-29). Las
-- versiones anteriores (fase 25) quedaron desactualizadas tras esos cambios.
--
-- Correr en el SQL Editor de Supabase.

delete from template_mesocycles where name in ('Estándar Principiante (V0-V3)', 'Estándar Intermedio (V3-V5)', 'Estándar Avanzado (V5-V7)');

-- ============================================================
-- Estándar Principiante (V0-V3)
-- ============================================================
do $$
declare
  v_meso uuid;
  v_week uuid;
  v_day uuid;
begin
  insert into template_mesocycles (name, description, phase, is_published)
  values ('Estándar Principiante (V0-V3)', 'Plantilla estándar para escaladores de nivel principiante (V0-V3), sin depender de evaluación ni contexto individual. 5 días/semana: 1 día por cada pilar de escalada (Aerobic Base, Power Endurance, Strength and Power -- el de Strength and Power combina fuerza general con boulder de potencia en la misma sesión), 1 día de fuerza de dedos, 1 día de core/antagonistas. Formato de 4 semanas (3 de carga + 1 de descarga).', 'Base / Acumulación', true)
  returning id into v_meso;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 1, 'Ajuste', 'Acumulación: Adaptación y línea base', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '3', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
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
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '3', '17', '60s', '60s', 'V0-V3', '3 min', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '5', '2', '8s x 6 reps', null, null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '3', '17', '60s', '60s', 'V0-V3', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '48a76b2d-b16e-4df9-b0e3-2c70b41d992e', 'A Vista', 'Power Endurance', '5', '3', null, null, 'V0-V3', '20 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '4', null, '30s', '30s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '4', null, '30s', '30s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '4', '3', '60s', '60s', null, '60 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '4', '3', '10s', '10s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '5', '3', '8s x 4 reps', null, null, '60 s entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '4', '2', '30s', '30s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '5', '3', '10s', '10s', 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '3', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '3', '17', '60s', '60s', 'V0-V3', '3 min', null, 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '6', '9', '20s', '20s', 'V0-V3', '3 min entre series', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '4', '3', '60s', '60s', null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '656c4a08-839f-4e11-9e77-ae028d9aecc6', 'Rotación Externa con Banda - Contrae y Relaja', 'Flexibility', '5', '3', '8s x 4 reps', null, null, '1 min 30 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '3', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '3', '10', '7s', '7s', 'Intensidad baja-moderada, priorizar técnica de agarre y tiempos cortos.', '60 s entre series', null, 3);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', 'Core, hombro y antagonistas', false, 6)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '4', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '94a53748-3215-4f68-93f5-300494fa3eae', 'Enhebrar la Aguja', 'Conditioning', '5', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '6', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ea3c84ac-5c1e-4cd4-ac85-65d20a062559', 'Estiramiento de Cuádriceps - Sentado - Estático Pasivo', 'Flexibility', '4', '3', '60s', '60s', null, '60 s entre series', null, 9);

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 2, 'Carga', 'Acumulación: Progresión de carga', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '20', '60s', '60s', 'V0-V3', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '6', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '20', '60s', '60s', 'V0-V3', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '48a76b2d-b16e-4df9-b0e3-2c70b41d992e', 'A Vista', 'Power Endurance', '6', '4', null, null, 'V0-V3', '20 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '5', null, '30s', '30s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '5', null, '30s', '30s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '5', '3', '10s', '10s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '6', '3', '8s x 4 reps', null, null, '60 s entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '5', '2', '30s', '30s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '6', '4', '10s', '10s', 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '20', '60s', '60s', 'V0-V3', '3 min', null, 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '7', '10', '20s', '20s', 'V0-V3', '3 min entre series', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '656c4a08-839f-4e11-9e77-ae028d9aecc6', 'Rotación Externa con Banda - Contrae y Relaja', 'Flexibility', '6', '3', '8s x 4 reps', null, null, '1 min 30 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '4', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '4', '10', '7s', '7s', 'Intensidad baja-moderada, priorizar técnica de agarre y tiempos cortos.', '60 s entre series', null, 3);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', 'Core, hombro y antagonistas', false, 6)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '94a53748-3215-4f68-93f5-300494fa3eae', 'Enhebrar la Aguja', 'Conditioning', '6', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ea3c84ac-5c1e-4cd4-ac85-65d20a062559', 'Estiramiento de Cuádriceps - Sentado - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 9);

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 3, 'Choque', 'Acumulación: Pico de volumen', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '23', '60s', '60s', 'V0-V3', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '6', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '23', '60s', '60s', 'V0-V3', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '48a76b2d-b16e-4df9-b0e3-2c70b41d992e', 'A Vista', 'Power Endurance', '6', '5', null, null, 'V0-V3', '20 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '5', null, '30s', '30s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '5', null, '30s', '30s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '5', '3', '10s', '10s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '6', '3', '8s x 4 reps', null, null, '60 s entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '5', '2', '30s', '30s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '6', '5', '10s', '10s', 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '23', '60s', '60s', 'V0-V3', '3 min', null, 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '7', '12', '20s', '20s', 'V0-V3', '3 min entre series', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '656c4a08-839f-4e11-9e77-ae028d9aecc6', 'Rotación Externa con Banda - Contrae y Relaja', 'Flexibility', '6', '3', '8s x 4 reps', null, null, '1 min 30 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '4', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '4', '11', '7s', '7s', 'Intensidad baja-moderada, priorizar técnica de agarre y tiempos cortos.', '60 s entre series', null, 3);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', 'Core, hombro y antagonistas', false, 6)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '94a53748-3215-4f68-93f5-300494fa3eae', 'Enhebrar la Aguja', 'Conditioning', '6', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ea3c84ac-5c1e-4cd4-ac85-65d20a062559', 'Estiramiento de Cuádriceps - Sentado - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 9);

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 4, 'Descarga', 'Acumulación: Recuperación activa', '4 días de entrenamiento, 3 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '2', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '2', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '2', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '2', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '2', '11', '60s', '60s', 'V0-V3', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '4', '1', '8s x 6 reps', null, null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '3', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '3', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '3', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '3', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '3', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '3', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '2', '11', '60s', '60s', 'V0-V3', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '48a76b2d-b16e-4df9-b0e3-2c70b41d992e', 'A Vista', 'Power Endurance', '4', '2', null, null, 'V0-V3', '20 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '3', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '3', null, '30s', '30s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '3', null, '30s', '30s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '3', '2', '60s', '60s', null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '3', '2', '10s', '10s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '4', '2', '8s x 4 reps', null, null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '3', '1', '30s', '30s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '2', '11', '60s', '60s', 'V0-V3', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);

end $$;

-- ============================================================
-- Estándar Intermedio (V3-V5)
-- ============================================================
do $$
declare
  v_meso uuid;
  v_week uuid;
  v_day uuid;
begin
  insert into template_mesocycles (name, description, phase, is_published)
  values ('Estándar Intermedio (V3-V5)', 'Plantilla estándar para escaladores de nivel intermedio (V3-V5), sin depender de evaluación ni contexto individual. 5 días/semana: 1 día por cada pilar de escalada (Aerobic Base, Power Endurance, Strength and Power -- el de Strength and Power combina fuerza general con boulder de potencia en la misma sesión), 1 día de fuerza de dedos, 1 día de core/antagonistas. Formato de 4 semanas (3 de carga + 1 de descarga).', 'Base / Acumulación', true)
  returning id into v_meso;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 1, 'Ajuste', 'Acumulación: Adaptación y línea base', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '4', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
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
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '17', '60s', '60s', 'V3-V5', '3 min', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '6', '2', '8s x 6 reps', null, null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '17', '60s', '60s', 'V3-V5', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '48a76b2d-b16e-4df9-b0e3-2c70b41d992e', 'A Vista', 'Power Endurance', '6', '3', null, null, 'V3-V5', '20 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '5', null, '30s', '30s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '5', null, '30s', '30s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '5', '3', '10s', '10s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '6', '3', '8s x 4 reps', null, null, '60 s entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '5', '2', '30s', '30s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '6', '3', '10s', '10s', 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '4', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '17', '60s', '60s', 'V3-V5', '3 min', null, 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '7', '9', '20s', '20s', 'V3-V5', '3 min entre series', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '656c4a08-839f-4e11-9e77-ae028d9aecc6', 'Rotación Externa con Banda - Contrae y Relaja', 'Flexibility', '6', '3', '8s x 4 reps', null, null, '1 min 30 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '4', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '4', '10', '7s', '7s', 'Intensidad moderada-alta, carga isométrica progresiva.', '60 s entre series', null, 3);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', 'Core, hombro y antagonistas', false, 6)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '94a53748-3215-4f68-93f5-300494fa3eae', 'Enhebrar la Aguja', 'Conditioning', '6', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ea3c84ac-5c1e-4cd4-ac85-65d20a062559', 'Estiramiento de Cuádriceps - Sentado - Estático Pasivo', 'Flexibility', '5', '3', '60s', '60s', null, '60 s entre series', null, 9);

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 2, 'Carga', 'Acumulación: Progresión de carga', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '5', '20', '60s', '60s', 'V3-V5', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '7', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '5', '20', '60s', '60s', 'V3-V5', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '48a76b2d-b16e-4df9-b0e3-2c70b41d992e', 'A Vista', 'Power Endurance', '7', '4', null, null, 'V3-V5', '20 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '6', null, '30s', '30s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '6', null, '30s', '30s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '6', '3', '10s', '10s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '7', '3', '8s x 4 reps', null, null, '60 s entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '6', '2', '30s', '30s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '7', '4', '10s', '10s', 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '5', '20', '60s', '60s', 'V3-V5', '3 min', null, 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '8', '10', '20s', '20s', 'V3-V5', '3 min entre series', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '656c4a08-839f-4e11-9e77-ae028d9aecc6', 'Rotación Externa con Banda - Contrae y Relaja', 'Flexibility', '7', '3', '8s x 4 reps', null, null, '1 min 30 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '5', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '5', '10', '7s', '7s', 'Intensidad moderada-alta, carga isométrica progresiva.', '60 s entre series', null, 3);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', 'Core, hombro y antagonistas', false, 6)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '94a53748-3215-4f68-93f5-300494fa3eae', 'Enhebrar la Aguja', 'Conditioning', '7', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ea3c84ac-5c1e-4cd4-ac85-65d20a062559', 'Estiramiento de Cuádriceps - Sentado - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 9);

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 3, 'Choque', 'Acumulación: Pico de volumen', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '5', '23', '60s', '60s', 'V3-V5', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '7', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '5', '23', '60s', '60s', 'V3-V5', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '48a76b2d-b16e-4df9-b0e3-2c70b41d992e', 'A Vista', 'Power Endurance', '7', '5', null, null, 'V3-V5', '20 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '6', null, '30s', '30s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '6', null, '30s', '30s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '6', '3', '10s', '10s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '7', '3', '8s x 4 reps', null, null, '60 s entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '6', '2', '30s', '30s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '7', '5', '10s', '10s', 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '5', '23', '60s', '60s', 'V3-V5', '3 min', null, 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '40dfdbd0-db03-445a-baa1-5e688835eb45', 'Boulder foco', 'Strength and Power', '8', '12', '20s', '20s', 'V3-V5', '3 min entre series', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '656c4a08-839f-4e11-9e77-ae028d9aecc6', 'Rotación Externa con Banda - Contrae y Relaja', 'Flexibility', '7', '3', '8s x 4 reps', null, null, '1 min 30 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '5', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '5', '11', '7s', '7s', 'Intensidad moderada-alta, carga isométrica progresiva.', '60 s entre series', null, 3);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', 'Core, hombro y antagonistas', false, 6)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '94a53748-3215-4f68-93f5-300494fa3eae', 'Enhebrar la Aguja', 'Conditioning', '7', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ea3c84ac-5c1e-4cd4-ac85-65d20a062559', 'Estiramiento de Cuádriceps - Sentado - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 9);

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 4, 'Descarga', 'Acumulación: Recuperación activa', '4 días de entrenamiento, 3 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '3', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '3', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '3', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '3', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '3', '11', '60s', '60s', 'V3-V5', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '5', '1', '8s x 6 reps', null, null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '4', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '4', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '4', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '4', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '4', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '4', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '3', '11', '60s', '60s', 'V3-V5', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '48a76b2d-b16e-4df9-b0e3-2c70b41d992e', 'A Vista', 'Power Endurance', '5', '2', null, null, 'V3-V5', '20 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '4', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '4', null, '30s', '30s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '4', null, '30s', '30s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '4', '2', '60s', '60s', null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '4', '2', '10s', '10s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '5', '2', '8s x 4 reps', null, null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '4', '1', '30s', '30s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '3', '11', '60s', '60s', 'V3-V5', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);

end $$;

-- ============================================================
-- Estándar Avanzado (V5-V7)
-- ============================================================
do $$
declare
  v_meso uuid;
  v_week uuid;
  v_day uuid;
begin
  insert into template_mesocycles (name, description, phase, is_published)
  values ('Estándar Avanzado (V5-V7)', 'Plantilla estándar para escaladores de nivel avanzado (V5-V7), sin depender de evaluación ni contexto individual. 5 días/semana: 1 día por cada pilar de escalada (Aerobic Base, Power Endurance, Strength and Power -- el de Strength and Power combina fuerza general con boulder de potencia en la misma sesión), 1 día de fuerza de dedos, 1 día de core/antagonistas. Formato de 4 semanas (3 de carga + 1 de descarga).', 'Base / Acumulación', true)
  returning id into v_meso;

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 1, 'Ajuste', 'Acumulación: Adaptación y línea base', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '5', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
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
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '5', '17', '60s', '60s', 'V5-V7', '3 min', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '7', '2', '8s x 6 reps', null, null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '5', '17', '60s', '60s', 'V5-V7', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'dc15388b-4dd3-47eb-99c9-82c2000506ec', '4x4', 'Power Endurance', '7', '3', '4 reps', null, 'V5-V7', '5 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '6', null, '30s', '30s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '6', null, '30s', '30s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '6', '3', '10s', '10s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '7', '3', '8s x 4 reps', null, null, '60 s entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '6', '2', '30s', '30s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '7', '3', '10s', '10s', 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '5', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '5', '17', '60s', '60s', 'V5-V7', '3 min', null, 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e99bd-8c83-407e-954c-7b78f60ebb8b', 'Board send', 'Strength and Power', '7', null, '60m', '60m', 'V5-V7', '3 min', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '656c4a08-839f-4e11-9e77-ae028d9aecc6', 'Rotación Externa con Banda - Contrae y Relaja', 'Flexibility', '7', '3', '8s x 4 reps', null, null, '1 min 30 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '5', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '5', '10', '7s', '7s', 'Intensidad alta, cerca de la capacidad máxima individual.', '60 s entre series', null, 3);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', 'Core, hombro y antagonistas', false, 6)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '6', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '94a53748-3215-4f68-93f5-300494fa3eae', 'Enhebrar la Aguja', 'Conditioning', '7', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '8', '3', '6 reps', null, 'Peso corporal', '3 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ea3c84ac-5c1e-4cd4-ac85-65d20a062559', 'Estiramiento de Cuádriceps - Sentado - Estático Pasivo', 'Flexibility', '6', '3', '60s', '60s', null, '60 s entre series', null, 9);

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 2, 'Carga', 'Acumulación: Progresión de carga', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '6', '20', '60s', '60s', 'V5-V7', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '8', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '6', '20', '60s', '60s', 'V5-V7', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'dc15388b-4dd3-47eb-99c9-82c2000506ec', '4x4', 'Power Endurance', '8', '4', '4 reps', null, 'V5-V7', '5 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '7', null, '30s', '30s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '7', null, '30s', '30s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '7', '3', '60s', '60s', null, '60 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '7', '3', '10s', '10s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '8', '3', '8s x 4 reps', null, null, '60 s entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '7', '2', '30s', '30s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '8', '4', '10s', '10s', 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '6', '20', '60s', '60s', 'V5-V7', '3 min', null, 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e99bd-8c83-407e-954c-7b78f60ebb8b', 'Board send', 'Strength and Power', '8', null, '60m', '60m', 'V5-V7', '3 min', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '7', '3', '60s', '60s', null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '656c4a08-839f-4e11-9e77-ae028d9aecc6', 'Rotación Externa con Banda - Contrae y Relaja', 'Flexibility', '8', '3', '8s x 4 reps', null, null, '1 min 30 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '6', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '6', '10', '7s', '7s', 'Intensidad alta, cerca de la capacidad máxima individual.', '60 s entre series', null, 3);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', 'Core, hombro y antagonistas', false, 6)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '94a53748-3215-4f68-93f5-300494fa3eae', 'Enhebrar la Aguja', 'Conditioning', '8', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '4', '6 reps', null, 'Peso corporal', '3 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ea3c84ac-5c1e-4cd4-ac85-65d20a062559', 'Estiramiento de Cuádriceps - Sentado - Estático Pasivo', 'Flexibility', '7', '3', '60s', '60s', null, '60 s entre series', null, 9);

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 3, 'Choque', 'Acumulación: Pico de volumen', '5 días de entrenamiento, 2 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '6', '2', '6 reps', null, 'Peso corporal', '15 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '6', '23', '60s', '60s', 'V5-V7', '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '8', '2', '8s x 6 reps', null, null, '60 s entre series', null, 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '6', '23', '60s', '60s', 'V5-V7', '3 min', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'dc15388b-4dd3-47eb-99c9-82c2000506ec', '4x4', 'Power Endurance', '8', '5', '4 reps', null, 'V5-V7', '5 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '7', null, '30s', '30s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '7', null, '30s', '30s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '7', '3', '60s', '60s', null, '60 s entre series', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '7', '3', '10s', '10s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '8', '3', '8s x 4 reps', null, null, '60 s entre series', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '7', '2', '30s', '30s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3c4ba132-7b10-42be-921e-c085a3b925d0', 'Constracción escapular', 'Conditioning', '8', '5', '10s', '10s', 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '6', '2', '10 reps', null, 'Peso corporal', '15 s entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '6', '23', '60s', '60s', 'V5-V7', '3 min', null, 9);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e99bd-8c83-407e-954c-7b78f60ebb8b', 'Board send', 'Strength and Power', '8', null, '60m', '60m', 'V5-V7', '3 min', null, 10);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '1bf9d317-ac76-4279-8db7-03a46cf353e3', 'Estiramiento de Bíceps - Estático Pasivo', 'Flexibility', '7', '3', '60s', '60s', null, '60 s entre series', null, 11);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Viernes', 'Fuerza de dedos y antagonistas', false, 5)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '656c4a08-839f-4e11-9e77-ae028d9aecc6', 'Rotación Externa con Banda - Contrae y Relaja', 'Flexibility', '8', '3', '8s x 4 reps', null, null, '1 min 30 s entre series', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ecfe8fa6-be15-4c7b-86d7-8c2e42e6160a', 'Contracción escapular en plancha', 'Conditioning', '6', null, '30s', '30s', 'Peso corporal', '2-3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '579f57b6-1f99-4049-8551-4d7072424bf1', 'F2 Open - Levantamiento - Fácil', 'Fingerboard', '6', '11', '7s', '7s', 'Intensidad alta, cerca de la capacidad máxima individual.', '60 s entre series', null, 3);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Sábado', 'Core, hombro y antagonistas', false, 6)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '7', null, '60s', '60s', null, '3 min', null, 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '94a53748-3215-4f68-93f5-300494fa3eae', 'Enhebrar la Aguja', 'Conditioning', '8', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '9', '5', '6 reps', null, 'Peso corporal', '3 min entre series', null, 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ea3c84ac-5c1e-4cd4-ac85-65d20a062559', 'Estiramiento de Cuádriceps - Sentado - Estático Pasivo', 'Flexibility', '7', '3', '60s', '60s', null, '60 s entre series', null, 9);

  insert into template_weeks (template_mesocycle_id, week_number, load_type, focus, distribution)
  values (v_meso, 4, 'Descarga', 'Acumulación: Recuperación activa', '4 días de entrenamiento, 3 de descanso')
  returning id into v_week;

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Lunes', 'Escalada - capacidad y técnica', false, 1)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '6de03b46-4ba7-4588-aea6-5cd22bae6dd7', 'Leg Swings', 'Conditioning', '4', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b799dd8c-134b-4f3b-9c02-67ab5895c3c8', 'Split Squat Warm Up', 'Conditioning', '4', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '436afa31-4823-430f-b97c-95d943a8bce2', 'Horse Stance Reps', 'Conditioning', '4', '1', '6 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd3eb54a9-071d-4e1a-884b-f5b8dcfdde5e', 'Scapular Press Ups', 'Conditioning', '4', '1', '10 reps', null, 'Peso corporal', '15 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '393716dd-22b4-41b4-a273-5c1689f39f51', 'Face Pulls', 'Conditioning', '7', '2', '6 reps', null, 'Peso corporal', '3 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '11', '60s', '60s', 'V5-V7', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '3fa6df88-c694-4d99-a22c-4fac018024a9', 'Dislocaciones de Hombro', 'Flexibility', '6', '1', '8s x 6 reps', null, null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Martes', 'Escalada - resistencia', false, 2)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'a095ab83-799f-4ed7-abd2-27130a8bc9b5', 'Rotación interna de rodilla', 'Flexibility', '5', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '5537f839-3827-467c-99db-e2d0b684310b', 'Pigeon pose', 'Flexibility', '5', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '36addf2c-4253-4d9b-bdd8-bf0df9895cfe', 'Izquiotibial a ambos lados (sentado)', 'Flexibility', '5', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'f38e2a7d-e5dd-45fb-b578-20a89acc1d55', 'Posición caballo', 'Flexibility', '5', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9a3b1731-87c1-4293-8467-b5a55d07b04c', 'Ranita', 'Flexibility', '5', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '11', '60s', '60s', 'V5-V7', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'dc15388b-4dd3-47eb-99c9-82c2000506ec', '4x4', 'Power Endurance', '6', '2', '4 reps', null, 'V5-V7', '5 min entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 8);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '66b029ce-ca6d-4793-9fcf-b6328165148f', 'Elongación gemelos', 'Flexibility', '5', null, '60s', '60s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 9);

  insert into template_days (template_week_id, day_of_week, day_focus, is_rest, position)
  values (v_week, 'Jueves', 'Escalada - fuerza e intensidad', false, 4)
  returning id into v_day;
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '87ac728d-bf9d-40bc-91d9-d86900475693', 'Giro de Sabio', 'Flexibility', '5', null, '30s', '30s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 1);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '9614b04b-12d7-4633-bb2b-9d019b06d38d', 'Postura de Cachorro', 'Flexibility', '5', null, '30s', '30s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 2);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '0a93ce33-823d-4ffc-b5b3-c2b2059434fb', 'Estiramiento de Gemelo en Pared - Estático Pasivo', 'Flexibility', '5', '2', '60s', '60s', null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 3);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'd37a2178-4557-4a28-8bcc-6c8c6a925fc3', 'Side Runner', 'Flexibility', '5', '2', '10s', '10s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 4);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, '4bc8dc21-b0f4-4b7a-a6d9-9658c5ea4215', 'Postura de Paloma - Contrae y Relaja', 'Flexibility', '6', '2', '8s x 4 reps', null, null, '60 s entre series', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 5);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'ad1dfedf-17fa-4275-a4d6-f7cccb0e5599', 'Sentadilla Yogui', 'Flexibility', '5', '1', '30s', '30s', null, '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 6);
  insert into template_blocks (template_day_id, exercise_id, exercise_name_freetext, category, rpe_target, sets, reps_or_time, time, load, rest, kinesio_notes, position)
  values (v_day, 'b2c05bfd-8629-4073-ac0b-9bc9cb36de43', 'Boulder Volumen', 'Aerobic Base', '4', '11', '60s', '60s', 'V5-V7', '3 min', 'Semana de descarga: prioridad recuperación, no buscar máximos.', 7);

end $$;

