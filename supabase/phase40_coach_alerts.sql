-- Fase 40: alertas al entrenador. Hoy, un atleta con entrenador que hace
-- check-in o reporta dolor no genera ninguna consecuencia visible -- solo
-- los atletas autoentrenados disparan /api/adjust-mesocycle (ver
-- src/app/(app)/checkin/page.tsx). Esto es el "honesty gap" que describió
-- Suri desde el lado del atleta ("cuando están lesionados no suelen
-- decirlo") y la falta de visibilidad de adherencia que describió Cris.
--
-- Se puebla por TRIGGER de base, no desde el cliente: un escalador
-- `restricted` escribe blocks.pain_during directamente (ver phase1_roles.sql,
-- el trigger que limita sus columnas editables), así que emitir la alerta
-- desde el cliente se perdería justo el caso más importante.
--
-- Alcance de esta fase: solo in-app (bandeja en el dashboard del
-- entrenador). No hay integración de push/email/WhatsApp -- decisión
-- explícita, ver el plan de la Fase 1.
--
-- Correr en el SQL Editor de Supabase, despues de phase39.

create table if not exists coach_alerts (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  kind text not null, -- 'pain_checkin' | 'pain_block' | 'low_readiness'
  severity text not null default 'warn', -- 'warn' | 'critical'
  title text not null,
  detail text,
  source_table text,
  source_id uuid,
  resolved_at timestamptz,
  resolved_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_coach_alerts_athlete on coach_alerts(athlete_id, created_at desc);
create index if not exists idx_coach_alerts_unresolved on coach_alerts(athlete_id) where resolved_at is null;

alter table coach_alerts enable row level security;

drop policy if exists "coach_alerts all" on coach_alerts;
create policy "coach_alerts all" on coach_alerts for all
  using (can_access_athlete(athlete_id))
  with check (can_access_athlete(athlete_id));

-- ---------------------------------------------------------------------------
-- Trigger 1: dolor >= 5 en algún check-in semanal.
-- ---------------------------------------------------------------------------
create or replace function notify_coach_on_checkin_pain()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  worst_zone text;
  worst_value numeric := 0;
  kv record;
begin
  for kv in select * from jsonb_each_text(coalesce(NEW.pain_by_zone, '{}'::jsonb)) loop
    if (kv.value)::numeric > worst_value then
      worst_value := (kv.value)::numeric;
      worst_zone := kv.key;
    end if;
  end loop;

  if worst_value >= 5 then
    insert into coach_alerts (athlete_id, kind, severity, title, detail, source_table, source_id)
    values (
      NEW.athlete_id,
      'pain_checkin',
      'critical',
      'Dolor reportado en el check-in',
      format('%s: %s/10', worst_zone, worst_value),
      'checkins',
      NEW.id
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_notify_coach_on_checkin_pain on checkins;
create trigger trg_notify_coach_on_checkin_pain
  after insert on checkins
  for each row execute function notify_coach_on_checkin_pain();

-- ---------------------------------------------------------------------------
-- Trigger 2: dolor >= 5 registrado en un bloque durante la sesión guiada.
-- blocks no tiene athlete_id directo: se resuelve via days -> weeks -> mesocycles.
-- Solo dispara cuando pain_during cambia (no en cada update del bloque).
-- ---------------------------------------------------------------------------
create or replace function notify_coach_on_block_pain()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  target_athlete_id uuid;
begin
  if NEW.pain_during is null or NEW.pain_during < 5 then
    return NEW;
  end if;
  if OLD.pain_during is not distinct from NEW.pain_during then
    return NEW;
  end if;

  select m.athlete_id into target_athlete_id
  from days d
  join weeks w on w.id = d.week_id
  join mesocycles m on m.id = w.mesocycle_id
  where d.id = NEW.day_id;

  if target_athlete_id is not null then
    insert into coach_alerts (athlete_id, kind, severity, title, detail, source_table, source_id)
    values (
      target_athlete_id,
      'pain_block',
      'critical',
      'Dolor durante un ejercicio',
      coalesce(NEW.exercise_name_freetext, 'Ejercicio') || format(': %s/10', NEW.pain_during) ||
        case when NEW.pain_zone is not null then format(' (%s)', NEW.pain_zone) else '' end,
      'blocks',
      NEW.id
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_notify_coach_on_block_pain on blocks;
create trigger trg_notify_coach_on_block_pain
  after update on blocks
  for each row execute function notify_coach_on_block_pain();

-- ---------------------------------------------------------------------------
-- Trigger 3: disponibilidad pre-sesión baja (readiness_score < 40).
-- ---------------------------------------------------------------------------
create or replace function notify_coach_on_low_readiness()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if NEW.readiness_score is not null and NEW.readiness_score < 40 then
    insert into coach_alerts (athlete_id, kind, severity, title, detail, source_table, source_id)
    values (
      NEW.athlete_id,
      'low_readiness',
      'warn',
      'Disponibilidad baja antes de entrenar',
      coalesce(NEW.suggested_adjustment, format('Puntaje: %s/100', NEW.readiness_score)),
      'session_checkins',
      NEW.id
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_notify_coach_on_low_readiness on session_checkins;
create trigger trg_notify_coach_on_low_readiness
  after insert on session_checkins
  for each row execute function notify_coach_on_low_readiness();
