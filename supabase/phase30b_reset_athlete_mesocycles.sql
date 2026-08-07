-- Fase 30b: borra todos los mesociclos reales de atletas (no las plantillas
-- estandar, esas van en phase30_regenerate_standard_templates.sql). Cascada
-- a weeks/days/blocks via foreign keys. Pedido explicito para limpiar el
-- estado antes de regenerar las plantillas estandar.
--
-- Correr en el SQL Editor de Supabase.

delete from mesocycles;
