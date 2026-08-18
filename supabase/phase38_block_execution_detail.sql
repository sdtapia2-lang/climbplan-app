-- Fase 38: detalle de ejecucion por bloque, hallazgo convergente de las
-- entrevistas a Suri, Rorro y Cris. SessionPlayer solo escribia set_logs y
-- los actual_* derivados; el RPE real, el dolor con zona y el comentario
-- quedaban fuera del flujo guiado (solo existian en la vista de lista vieja
-- de /entrenamiento), pese a que ambos prompts de IA los leen.
--
-- pain_zone usa las mismas claves que PAIN_ZONES (src/lib/types.ts), para no
-- repetir la taxonomia distinta de 6 zonas que tenia el formulario de
-- evaluacion (ver phase37 / Fase 0.4).
--
-- work_type separa fisico de tecnico/tactico dentro de un dia, pedido
-- especifico de Rorro. Se agrega tambien en template_blocks para que las
-- plantillas puedan declarar el tipo de trabajo desde el origen.
--
-- Correr en el SQL Editor de Supabase, despues de phase37.

alter table blocks add column if not exists pain_zone text;
alter table blocks add column if not exists work_type text;
alter table template_blocks add column if not exists work_type text;

create index if not exists idx_blocks_pain_during on blocks(day_id) where pain_during is not null;
