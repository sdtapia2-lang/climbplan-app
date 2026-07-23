-- Fase 16: registro set por set en la ejecución guiada de la sesión.
-- Guarda el detalle real de cada serie de un bloque (reps y carga por serie,
-- cuáles se completaron) como un array jsonb, sin romper los campos
-- actual_* existentes que usa la lógica de ajuste post check-in (esos se
-- siguen derivando: actual_sets = cantidad de series completadas, etc.).
--
-- Correr en el SQL Editor de Supabase.

alter table blocks add column if not exists set_logs jsonb not null default '[]';
