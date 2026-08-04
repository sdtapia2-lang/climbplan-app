-- Fase 29: rutina de activación pre-sesión (hombro y dedos), tomada del
-- protocolo real de Lattice usado en Mesociclo_1_Diego ("PROTOCOLO
-- PRE-SESION (3-5 min) — Hombro y dedos"): 1) Prone Shoulder Rotations
-- livianas, 2) Banded External Rotation - Contract Relax, 3) activación
-- liviana de antebrazo/muñeca (flexor de muñeca). Los 3 ejercicios ya existen
-- en el catalogo (CD0078, FL0033, CD0115) -- no hace falta find_or_create.
-- Los 3 son categoria Conditioning/Flexibility (no Fingerboard): esto es a
-- proposito, para no romper la regla "Conditioning siempre antes de la
-- rutina de escalada" del resto del dia (generatePlan.ts).
--
-- Correr en el SQL Editor de Supabase.

do $$
declare
  v_routine_id uuid;
  v_shoulder_rot uuid;
  v_banded_er uuid;
  v_wrist_flexor uuid;
begin
  select id into v_shoulder_rot from exercises where code = 'CD0078';
  select id into v_banded_er from exercises where code = 'FL0033';
  select id into v_wrist_flexor from exercises where code = 'CD0115';

  if v_shoulder_rot is null or v_banded_er is null or v_wrist_flexor is null then
    raise exception 'Faltan ejercicios base (CD0078/FL0033/CD0115) para la rutina de activacion pre-sesion';
  end if;

  insert into routines (name, category, description)
  values (
    'Activación Pre-Sesión - Hombro y Dedos',
    'Conditioning',
    'Activar sin fatigar antes de escalar o entrenar dedos: 2-3 series livianas de rotación de hombro en prono, 2 series de rotación externa con banda (contrae y relaja), y activación liviana de antebrazo/muñeca.'
  )
  returning id into v_routine_id;

  insert into routine_items (routine_id, exercise_id, position, sets, reps_or_time) values
    (v_routine_id, v_shoulder_rot, 1, '2-3', null),
    (v_routine_id, v_banded_er, 2, '2', null),
    (v_routine_id, v_wrist_flexor, 3, '2', null);
end $$;
