-- ClimbPlan Fase 1: roles y permisos
-- Correr DESPUES de schema.sql y seed_exercises.sql, en el SQL Editor de Supabase.
--
-- Roles: admin | entrenador | escalador
-- - admin: acceso total a todo (subsume los otros dos roles: si la misma persona
--   entrena y administra la app, el rol admin ya le permite hacer todo lo que
--   haria como entrenador o escalador, no hace falta un rol combinado).
-- - entrenador: acceso total solo a los atletas que tenga asignados en coach_athletes.
-- - escalador: acceso a su propio atleta (profiles.athlete_id), con permisos
--   reducidos sobre la planificacion (ver mesociclos, pero solo puede agregar/editar
--   bloques de ejercicio, no la estructura de semanas/dias).

-- PROFILES ---------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text check (role in ('admin', 'entrenador', 'escalador')),
  athlete_id uuid references athletes(id) on delete set null,
  created_at timestamptz not null default now()
);

-- COACH <-> ATLETA ---------------------------------------------------------
create table if not exists coach_athletes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references profiles(id) on delete cascade,
  athlete_id uuid not null references athletes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (coach_id, athlete_id)
);

-- FUNCIONES HELPER (security definer: evitan recursion de RLS sobre profiles) ---
create or replace function my_role() returns text
language sql security definer stable set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function my_athlete_id() returns uuid
language sql security definer stable set search_path = public as $$
  select athlete_id from profiles where id = auth.uid()
$$;

create or replace function is_my_assigned_athlete(target_athlete_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from coach_athletes
    where coach_id = auth.uid() and athlete_id = target_athlete_id
  )
$$;

create or replace function week_athlete_id(p_week_id uuid) returns uuid
language sql security definer stable set search_path = public as $$
  select m.athlete_id from mesocycles m
  join weeks w on w.mesocycle_id = m.id
  where w.id = p_week_id
$$;

create or replace function day_athlete_id(p_day_id uuid) returns uuid
language sql security definer stable set search_path = public as $$
  select week_athlete_id(week_id) from days where id = p_day_id
$$;

-- Puede ver/editar los datos de un atleta: admin, el propio escalador, o su coach
create or replace function can_access_athlete(target_athlete_id uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select my_role() = 'admin'
    or target_athlete_id = my_athlete_id()
    or is_my_assigned_athlete(target_athlete_id)
$$;

-- TRIGGER: crear perfil automaticamente al registrarse -----------------
-- El primer usuario que se registra en el proyecto queda como admin.
-- El resto queda con role = null ("pendiente") hasta que un admin lo asigne.
create or replace function handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  is_first boolean;
begin
  select not exists (select 1 from profiles) into is_first;
  insert into profiles (id, email, role)
  values (new.id, new.email, case when is_first then 'admin' else null end);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- BACKFILL: crear perfiles para cuentas que ya existian antes de esta migracion
-- (el trigger de arriba solo corre para altas nuevas). La cuenta mas antigua sin
-- perfil queda como admin si todavia no hay ningun admin en la tabla.
do $$
declare
  u record;
  have_admin boolean;
begin
  select exists(select 1 from profiles where role = 'admin') into have_admin;
  for u in
    select au.id, au.email
    from auth.users au
    left join profiles p on p.id = au.id
    where p.id is null
    order by au.created_at asc
  loop
    insert into profiles (id, email, role)
    values (u.id, u.email, case when not have_admin then 'admin' else null end);
    have_admin := true;
  end loop;
end $$;

-- RLS: PROFILES ------------------------------------------------------------
alter table profiles enable row level security;
alter table coach_athletes enable row level security;

drop policy if exists "profiles select" on profiles;
create policy "profiles select" on profiles for select
  using (id = auth.uid() or my_role() = 'admin');

drop policy if exists "profiles update admin only" on profiles;
create policy "profiles update admin only" on profiles for update
  using (my_role() = 'admin') with check (my_role() = 'admin');

drop policy if exists "profiles delete admin only" on profiles;
create policy "profiles delete admin only" on profiles for delete
  using (my_role() = 'admin');

-- (sin policy de insert: los perfiles solo se crean via el trigger handle_new_user)

-- RLS: COACH_ATHLETES --------------------------------------------------------
drop policy if exists "coach_athletes select" on coach_athletes;
create policy "coach_athletes select" on coach_athletes for select
  using (coach_id = auth.uid() or my_role() = 'admin');

drop policy if exists "coach_athletes write admin only" on coach_athletes;
create policy "coach_athletes write admin only" on coach_athletes for all
  using (my_role() = 'admin') with check (my_role() = 'admin');

-- RLS: ATHLETES --------------------------------------------------------------
drop policy if exists "authenticated read/write athletes" on athletes;

create policy "athletes select" on athletes for select
  using (can_access_athlete(id));
create policy "athletes update" on athletes for update
  using (can_access_athlete(id)) with check (can_access_athlete(id));
create policy "athletes insert admin only" on athletes for insert
  with check (my_role() = 'admin');
create policy "athletes delete admin only" on athletes for delete
  using (my_role() = 'admin');

-- RLS: EXERCISES (catalogo) -- lectura para todos, escritura solo admin ------
drop policy if exists "authenticated read/write exercises" on exercises;

create policy "exercises select" on exercises for select
  using (auth.role() = 'authenticated');
create policy "exercises write admin only" on exercises for insert
  with check (my_role() = 'admin');
create policy "exercises update admin only" on exercises for update
  using (my_role() = 'admin') with check (my_role() = 'admin');
create policy "exercises delete admin only" on exercises for delete
  using (my_role() = 'admin');

-- RLS: MESOCYCLES -- admin y coach asignado crean/editan; el atleta solo ve --
drop policy if exists "authenticated read/write mesocycles" on mesocycles;

create policy "mesocycles select" on mesocycles for select
  using (can_access_athlete(athlete_id));
create policy "mesocycles write admin/coach" on mesocycles for all
  using (my_role() = 'admin' or is_my_assigned_athlete(athlete_id))
  with check (my_role() = 'admin' or is_my_assigned_athlete(athlete_id));

-- RLS: WEEKS -- misma logica, resuelta via mesocycle -------------------------
drop policy if exists "authenticated read/write weeks" on weeks;

create policy "weeks select" on weeks for select
  using (can_access_athlete(week_athlete_id(id)));
create policy "weeks write admin/coach" on weeks for all
  using (my_role() = 'admin' or is_my_assigned_athlete(week_athlete_id(id)))
  with check (
    exists (
      select 1 from mesocycles m
      where m.id = mesocycle_id
        and (my_role() = 'admin' or is_my_assigned_athlete(m.athlete_id))
    )
  );

-- RLS: DAYS --------------------------------------------------------------------
drop policy if exists "authenticated read/write days" on days;

create policy "days select" on days for select
  using (can_access_athlete(day_athlete_id(id)));
create policy "days write admin/coach" on days for all
  using (my_role() = 'admin' or is_my_assigned_athlete(day_athlete_id(id)))
  with check (
    exists (
      select 1 from weeks w
      where w.id = week_id
        and (my_role() = 'admin' or is_my_assigned_athlete(week_athlete_id(w.id)))
    )
  );

-- RLS: BLOCKS -- admin/coach full; el propio escalador puede agregar/editar --
-- sus bloques (ejercicios, series, reps, carga) pero no la estructura de dias.
drop policy if exists "authenticated read/write blocks" on blocks;

create policy "blocks select" on blocks for select
  using (can_access_athlete(day_athlete_id(day_id)));
create policy "blocks write admin/coach/escalador" on blocks for all
  using (can_access_athlete(day_athlete_id(day_id)))
  with check (
    exists (
      select 1 from days d
      where d.id = day_id and can_access_athlete(day_athlete_id(d.id))
    )
  );

-- RLS: EVALUATIONS -------------------------------------------------------------
drop policy if exists "authenticated read/write evaluations" on evaluations;

create policy "evaluations all" on evaluations for all
  using (can_access_athlete(athlete_id))
  with check (can_access_athlete(athlete_id));

-- RLS: CHECKINS ------------------------------------------------------------------
drop policy if exists "authenticated read/write checkins" on checkins;

create policy "checkins all" on checkins for all
  using (can_access_athlete(athlete_id))
  with check (can_access_athlete(athlete_id));
