-- ClimbPlan Fase 43: planes y cupos de atletas por entrenador (Fase 6 del
-- plan de entrevistas).
--
-- Los tres entrenadores entrevistados rechazaron el cobro por atleta: Suri
-- lo llamó "hackeable" (inventaría correos para esquivarlo); Cris pidió pago
-- único o un plan con N clientes; Rorro pidió precio fijo ilimitado o anual
-- y dijo explícitamente que no entraría si le cobran por persona. Este
-- módulo modela planes con un cupo fijo (o ilimitado) de atletas, asignados
-- a mano por un admin -- sin pasarela de pago real, fuera de alcance.

create table if not exists subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  /** null = ilimitado (ej. el plan anual sin tope que pidió Rorro). */
  max_athletes int,
  price numeric,
  billing_period text check (billing_period in ('mensual', 'anual', 'unico')),
  created_at timestamptz not null default now()
);

create table if not exists coach_subscriptions (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references profiles(id) on delete cascade,
  plan_id uuid not null references subscription_plans(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'canceled', 'expired')),
  starts_at date not null default current_date,
  ends_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists coach_subscriptions_coach_id_idx on coach_subscriptions(coach_id);

-- Como mucho una suscripcion activa por entrenador a la vez: simplifica
-- resolver el cupo vigente sin tener que elegir entre varias filas activas.
-- Cambiar de plan implica cancelar la anterior antes de crear la nueva.
create unique index if not exists coach_subscriptions_one_active_idx
  on coach_subscriptions(coach_id) where status = 'active';

alter table subscription_plans enable row level security;
alter table coach_subscriptions enable row level security;

drop policy if exists "subscription_plans select" on subscription_plans;
create policy "subscription_plans select" on subscription_plans for select
  using (auth.role() = 'authenticated');
drop policy if exists "subscription_plans write admin only" on subscription_plans;
create policy "subscription_plans write admin only" on subscription_plans for all
  using (my_role() = 'admin') with check (my_role() = 'admin');

drop policy if exists "coach_subscriptions select" on coach_subscriptions;
create policy "coach_subscriptions select" on coach_subscriptions for select
  using (coach_id = auth.uid() or my_role() = 'admin');
drop policy if exists "coach_subscriptions write admin only" on coach_subscriptions;
create policy "coach_subscriptions write admin only" on coach_subscriptions for all
  using (my_role() = 'admin') with check (my_role() = 'admin');

-- Cupo vigente de un entrenador: null = sin plan asignado todavia, o plan
-- sin tope -- en ambos casos, sin límite. security definer: lo usan
-- accept_coach_request (mas abajo) y el route handler de creación de
-- escaladores, no solo el propio entrenador.
create or replace function coach_max_athletes(p_coach_id uuid) returns int
language sql security definer stable set search_path = public as $$
  select sp.max_athletes
  from coach_subscriptions cs
  join subscription_plans sp on sp.id = cs.plan_id
  where cs.coach_id = p_coach_id and cs.status = 'active'
  limit 1
$$;

-- Cantidad de atletas (clientes) que ya tiene asignados un entrenador.
create or replace function coach_athlete_count(p_coach_id uuid) returns int
language sql security definer stable set search_path = public as $$
  select count(*)::int from coach_athletes where coach_id = p_coach_id
$$;

grant execute on function coach_max_athletes(uuid) to authenticated;
grant execute on function coach_athlete_count(uuid) to authenticated;

-- BLOQUEO DE CUPO al aceptar una solicitud de entrevista (fase8) ------------
-- Redefine accept_coach_request agregando el chequeo de cupo antes de crear
-- el atleta. Admin queda exento (puede exceder el cupo a mano si hace falta).
create or replace function accept_coach_request(request_id uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  req record;
  new_athlete_id uuid;
  v_max int;
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

  -- Serializa el chequeo de cupo por entrenador: sin esto, dos requests
  -- concurrentes (dos solicitudes aceptadas casi a la vez) podrían leer el
  -- mismo conteo y pasar el chequeo juntas, excediendo el cupo. Transaction-
  -- scoped: se libera solo al terminar esta función, sin riesgo de quedar
  -- colgado en un pooler de conexiones.
  perform pg_advisory_xact_lock(hashtext(req.coach_id::text));

  if my_role() <> 'admin' then
    v_max := coach_max_athletes(req.coach_id);
    if v_max is not null and coach_athlete_count(req.coach_id) >= v_max then
      raise exception 'Llegaste al cupo de tu plan (% atletas). Actualiza tu plan para aceptar más escaladores.', v_max;
    end if;
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

-- CREACION DIRECTA de escalador por un entrenador (route handler
-- create-athlete), con el mismo chequeo de cupo serializado. auth.admin.
-- createUser() no es SQL y no puede vivir en esta función -- el route
-- handler la llama primero para reservar el cupo + crear el atleta, y hace
-- rollback (delete del atleta) si createUser falla despues.
create or replace function create_athlete_for_coach(p_coach_id uuid, p_athlete_name text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_max int;
  v_athlete_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_coach_id::text));

  v_max := coach_max_athletes(p_coach_id);
  if v_max is not null and coach_athlete_count(p_coach_id) >= v_max then
    raise exception 'Llegaste al cupo de tu plan (% atletas). Actualiza tu plan para agregar más.', v_max;
  end if;

  insert into athletes (name) values (p_athlete_name) returning id into v_athlete_id;
  insert into coach_athletes (coach_id, athlete_id) values (p_coach_id, v_athlete_id);

  return v_athlete_id;
end;
$$;

grant execute on function create_athlete_for_coach(uuid, text) to authenticated;
