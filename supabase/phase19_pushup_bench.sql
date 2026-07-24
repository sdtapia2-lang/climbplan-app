-- Fase 19: push-ups máximos como proxy de press banca cuando no hay test real.
--
-- El motor de reglas usa evaluations.bench_press_kg para calcular cargas
-- concretas de press banca/press de pecho. Cuando el atleta no tiene ese test
-- pero sí tiene push-ups máximos a fallo, se estima:
--
--   carga_pushup = 0.64 x peso_corporal          (fracción de peso corporal
--                                                  que soportan las manos en
--                                                  una flexión estándar)
--   e1RM_pushup  = carga_pushup x (1 + reps/30)   (fórmula de Epley)
--   press_banca_estimado = e1RM_pushup x 1.0      (k=1, mismo patrón de empuje
--                                                  horizontal)
--
-- Heurística de coaching, no una fórmula validada para este par de ejercicios
-- específico -- se marca `benchPressEstimated` para que prescription.ts
-- agregue una nota de baja confianza. Ver profile.ts y prescription.ts.
--
-- Correr en el SQL Editor de Supabase.

alter table evaluations add column if not exists pushup_max_reps integer;
