-- FASE 8: onboarding de escalador nuevo ---------------------------------
-- Reemplaza la espera manual a que un Admin asigne rol por dos caminos de
-- autoservicio: "entrenamiento libre" (se vuelve su propio entrenador) o
-- "solicitar entrevista" a un entrenador del directorio (Fase 6).

-- Marca las cuentas que se auto-onboardearon como "libre", para poder
-- exigirles completar una evaluacion antes de dejarlas planificar (el resto
-- de las cuentas -- creadas por Admin o via una solicitud aceptada -- no
-- quedan sujetas a este gate).
alter table profiles add column if not exists onboarded_via_free boolean not null default false;

-- SOLICITUDES DE ENTREVISTA ---------------------------------------------
create table if not exists coach_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles(id) on delete cascade,
  coach_id uuid not null references profiles(id) on delete cascade,
  athlete_name text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table coach_requests enable row level security;

drop policy if exists "coach_requests select" on coach_requests;
create policy "coach_requests select" on coach_requests for select
  using (requester_id = auth.uid() or coach_id = auth.uid() or my_role() = 'admin');

drop policy if exists "coach_requests insert self" on coach_requests;
create policy "coach_requests insert self" on coach_requests for insert
  with check (requester_id = auth.uid());

-- Update directo solo para rechazar (aceptar pasa por la funcion de abajo,
-- que necesita privilegios extra sobre profiles/athletes/coach_athletes).
drop policy if exists "coach_requests update coach" on coach_requests;
create policy "coach_requests update coach" on coach_requests for update
  using (coach_id = auth.uid() or my_role() = 'admin')
  with check (coach_id = auth.uid() or my_role() = 'admin');

drop policy if exists "coach_requests delete self" on coach_requests;
create policy "coach_requests delete self" on coach_requests for delete
  using (requester_id = auth.uid());

-- ENTRENAMIENTO LIBRE (autoservicio) -------------------------------------
-- La cuenta se convierte en su propio "coach" (coach_athletes con
-- coach_id = athlete_id del mismo usuario). Esto no requiere ninguna
-- policy nueva sobre mesocycles/weeks/days/blocks: is_my_assigned_athlete()
-- ya le da permiso total sobre su propio atleta, igual que a cualquier
-- entrenador real.
create or replace function start_free_training(athlete_name text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  new_athlete_id uuid;
begin
  if uid is null then
    raise exception 'No autenticado';
  end if;
  if exists (select 1 from profiles where id = uid and role is not null) then
    raise exception 'Esta cuenta ya tiene un rol asignado';
  end if;

  insert into athletes (name) values (coalesce(nullif(trim(athlete_name), ''), 'Escalador'))
  returning id into new_athlete_id;

  update profiles
  set role = 'escalador', athlete_id = new_athlete_id, restricted = false, onboarded_via_free = true
  where id = uid;

  insert into coach_athletes (coach_id, athlete_id) values (uid, new_athlete_id);

  return new_athlete_id;
end;
$$;

-- ACEPTAR SOLICITUD DE ENTREVISTA ----------------------------------------
-- Solo el entrenador destinatario (o un admin) puede aceptar. El escalador
-- queda normal (no restringido): puede modificar su propia planificacion.
create or replace function accept_coach_request(request_id uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  req record;
  new_athlete_id uuid;
begin
  select * into req from coach_requests where id = request_id;
  if req is null then
    raise exception 'Solicitud no encontrada';
  end if;
  if req.coach_id <> auth.uid() and my_role() <> 'admin' then
    raise exception 'No autorizado';
  end if;
  if req.status <> 'pending' then
    raise exception 'La solicitud ya fue resuelta';
  end if;

  insert into athletes (name) values (req.athlete_name) returning id into new_athlete_id;

  update profiles
  set role = 'escalador', athlete_id = new_athlete_id, restricted = false
  where id = req.requester_id;

  insert into coach_athletes (coach_id, athlete_id) values (req.coach_id, new_athlete_id);

  update coach_requests set status = 'accepted', resolved_at = now() where id = request_id;

  return new_athlete_id;
end;
$$;
