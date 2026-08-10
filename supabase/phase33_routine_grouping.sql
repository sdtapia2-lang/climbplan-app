-- Fase 33: agrupa visualmente los bloques que vienen de una Rutina (en vez
-- de mostrarlos como N ejercicios sueltos sin relacion aparente). Guarda el
-- nombre de la rutina de origen en el bloque -- no una FK a `routines`,
-- porque el bloque debe seguir existiendo tal cual aunque la rutina se
-- edite/borre despues (mismo criterio que exercise_name_freetext).
--
-- Correr en el SQL Editor de Supabase.

alter table blocks add column if not exists routine_name text;
alter table template_blocks add column if not exists routine_name text;
