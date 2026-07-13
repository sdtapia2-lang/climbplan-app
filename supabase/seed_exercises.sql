-- Seed del catalogo de ejercicios, tomado del export real de Base44
-- (Base 44/ExerciseCatalog_export.csv). Correr despues de schema.sql.

insert into exercises (name, category, equipment_required, typical_sets, typical_reps, typical_time, typical_duration, typical_effort, description, is_benchmark) values
('Repeaters 7/3 Half Crimp', 'Strength and Power', '["Fingerboard"]', '6', '6 reps', '7s on / 3s off', null, 'RPE 7-8', 'Repeticiones isometricas en fingerboard. 7 segundos colgando, 3 segundos descanso por rep.', false),
('Max Hang 10s Half Crimp', 'Strength and Power', '["Fingerboard"]', '5', '1 rep', '10s', null, 'RPE 9', 'Colgada maxima de 10 segundos en agarre half crimp. Test de fuerza maxima de dedos.', true),
('Max Hang 10s Open Hand', 'Strength and Power', '["Fingerboard"]', '5', '1 rep', '10s', null, 'RPE 9', 'Colgada maxima de 10 segundos en agarre open hand.', true),
('Dominadas lastradas', 'Strength and Power', '["Barra dominadas", "Pesas"]', '5', '5', null, null, 'RPE 7-8', 'Dominadas con peso adicional. Ejercicio fundamental de fuerza de traccion.', false),
('Test dominadas maximas', 'Strength and Power', '["Barra dominadas"]', '1', 'al fallo', null, null, 'RPE 10', 'Maximas dominadas estrictas sin peso adicional.', true),
('Campus board ladders', 'Strength and Power', '["Campus board"]', '4', '3', null, null, 'RPE 8', 'Escaleras en campus board subiendo peldanos alternando manos.', false),
('Boulder proyectos', 'Strength and Power', '["Pared boulder"]', null, 'intentos', null, '60-90 min', 'RPE 8-9', 'Sesion de boulder trabajando proyectos al limite.', false),
('Boulder volumen', 'Power Endurance', '["Pared boulder"]', null, '30-50 problemas', null, '60-90 min', 'RPE 5-6', 'Sesion de volumen en boulder, muchos problemas faciles sin descanso largo.', false),
('ARC training', 'Aerobic Base', '["Pared boulder"]', '3', null, null, '20-30 min', 'RPE 3-4', 'Escalada continua en baja intensidad para base aerobica.', false),
('Test ARC 20min', 'Aerobic Base', '["Pared boulder"]', '1', null, null, '20 min', 'RPE 5-6', 'Test de resistencia aerobica. 20 minutos de escalada continua.', true),
('Kilter/Tension/Moonboard session', 'Strength and Power', '["Tension/Kilter/Moonboard"]', null, null, null, '60-90 min', 'RPE 7-8', 'Sesion en pared de entrenamiento digital (Kilter, Tension o Moonboard).', false),
('4x4 boulder', 'Power Endurance', '["Pared boulder"]', '4', '4 problemas', null, null, 'RPE 8', '4 circuitos de 4 problemas sin descanso entre problemas, descanso entre circuitos.', false),
('Press banca / Push-ups', 'Conditioning', '["Pesas"]', '3', '10-12', null, null, 'RPE 6-7', 'Ejercicio antagonista de empuje horizontal.', false),
('Press hombro', 'Conditioning', '["Pesas"]', '3', '10-12', null, null, 'RPE 6-7', 'Press de hombro para balance de fuerza de empuje.', false),
('Rotacion externa hombro', 'Conditioning', '["Pesas"]', '3', '15', null, null, 'RPE 5', 'Ejercicio de rotacion externa con banda o mancuerna liviana. Preventivo.', false),
('Plancha frontal', 'Conditioning', '[]', '3', null, null, '30-60s', 'RPE 5-6', 'Plancha isometrica frontal para core.', false),
('L-sit', 'Conditioning', '["Barra dominadas"]', '3', null, null, '10-30s', 'RPE 7', 'L-sit en barras paralelas o barra de dominadas.', true),
('Deadlift', 'Conditioning', '["Pesas"]', '4', '5', null, null, 'RPE 7-8', 'Peso muerto convencional o sumo.', false),
('Sentadilla', 'Conditioning', '["Pesas"]', '4', '6-8', null, null, 'RPE 7', 'Sentadilla con barra o goblet squat.', false),
('Extensores de dedos (banda)', 'Flexibility', '[]', '3', '20', null, null, 'RPE 3', 'Apertura de dedos contra banda elastica. Antagonista obligatorio.', false),
('Estiramiento cadena posterior', 'Flexibility', '[]', '1', null, null, '10-15 min', 'RPE 2-3', 'Rutina de flexibilidad para isquios, cadera y espalda baja.', false),
('Movilidad de hombros', 'Flexibility', '[]', '1', null, null, '10 min', 'RPE 2-3', 'Rutina de movilidad articular de hombros.', false),
('Repeater test Tindeq', 'Strength and Power', '["Fingerboard", "Tindeq Progressor"]', '1', 'al fallo', '7/3', null, 'RPE 10', 'Test de critical force con Tindeq Progressor. Registrar repeticiones completadas, fuerza promedio final y % de caida.', true),
('MVC test Tindeq', 'Strength and Power', '["Fingerboard", "Tindeq Progressor"]', '3', '1', '5s', null, 'RPE 10', 'Test de fuerza maxima voluntaria con Tindeq Progressor. Registrar peak force en kg y %BW.', true)
on conflict do nothing;
