-- FASE 10: rediseno de Movilidad/Fuerza/Dedos en evaluaciones + datos de
-- planificacion y salud en la ficha de atleta. Correr DESPUES de
-- phase9_ai_mesocycles.sql, en el SQL Editor de Supabase.

-- ATLETAS -----------------------------------------------------------------
alter table athletes add column if not exists years_climbing int;
alter table athletes add column if not exists discipline text;
alter table athletes add column if not exists training_days jsonb not null default '[]';
alter table athletes add column if not exists rest_days_per_week int;

-- EVALUACIONES --------------------------------------------------------------
-- Movilidad: se separa en izquierda/derecha y se acota a 3 tests (se saca
-- rotacion externa de hombro, movilidad de muneca y sentadilla profunda).
alter table evaluations add column if not exists shoulder_ir_l text;
alter table evaluations add column if not exists shoulder_ir_r text;
alter table evaluations add column if not exists frog_l text;
alter table evaluations add column if not exists frog_r text;
alter table evaluations add column if not exists thomas_l text;
alter table evaluations add column if not exists thomas_r text;

do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'evaluations' and column_name = 'shoulder_ir') then
    update evaluations set shoulder_ir_l = shoulder_ir where shoulder_ir_l is null and shoulder_ir is not null;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'evaluations' and column_name = 'thomas_test') then
    update evaluations set thomas_l = thomas_test where thomas_l is null and thomas_test is not null;
  end if;
end $$;

alter table evaluations drop column if exists shoulder_ir;
alter table evaluations drop column if exists shoulder_er;
alter table evaluations drop column if exists wrist_mobility;
alter table evaluations drop column if exists deep_squat;
alter table evaluations drop column if exists thomas_test;

-- Fuerza: dominadas lastradas y press banca en kg (numerico) en vez de texto libre.
alter table evaluations add column if not exists weighted_pullup_kg numeric;
alter table evaluations add column if not exists bench_press_kg numeric;
alter table evaluations add column if not exists deadlift_kg numeric;
alter table evaluations drop column if exists pullups_max;
alter table evaluations drop column if exists horizontal_push;

-- Dedos/Tindeq: RFD solo a 2080ms y 20-80% de la MVC (lo que reporta la app
-- de Tindeq), en kg/s. MVC %BW pasa a calcularse solo (peso de la
-- evaluacion / MVC kg), la columna se mantiene para guardar ese valor.
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'evaluations' and column_name = 'left_rfd_200') then
    alter table evaluations rename column left_rfd_200 to left_rfd_2080;
  end if;
  if exists (select 1 from information_schema.columns where table_name = 'evaluations' and column_name = 'right_rfd_200') then
    alter table evaluations rename column right_rfd_200 to right_rfd_2080;
  end if;
end $$;

alter table evaluations drop column if exists left_rfd_150;
alter table evaluations drop column if exists left_rfd_250;
alter table evaluations drop column if exists right_rfd_150;
alter table evaluations drop column if exists right_rfd_250;
