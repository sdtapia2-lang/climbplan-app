-- Fase 18: sentadilla goblet como proxy de peso muerto cuando no hay test real.
--
-- El motor de reglas usa evaluations.deadlift_kg para calcular cargas
-- concretas de peso muerto/rack pull. Cuando el atleta no tiene ese test pero
-- sí tiene una carga de sentadilla goblet, se estima peso muerto = goblet x 2
-- (heurística de coaching, no una fórmula validada) y se marca el bloque con
-- una nota de baja confianza -- ver profile.ts (deadliftEstimated) y
-- prescription.ts.
--
-- Correr en el SQL Editor de Supabase.

alter table evaluations add column if not exists goblet_squat_kg numeric;
