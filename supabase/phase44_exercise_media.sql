-- ClimbPlan Fase 44: biblioteca de videos por ejercicio (Fase 4 del plan de
-- entrevistas). Pedido más ruidoso y 3/3 convergente: Suri lo puso #1, Rorro
-- lo llamó lo más tedioso de armar a mano, Cris lo tenía en la hoja 4 de su
-- Excel. `exercises.code` ya existe para esto (fase13: "usado para linkear
-- imagenes").
--
-- URL externa (YouTube/Vimeo) primero; media_type/storage_path quedan
-- nullable desde el día 1 para que la subida a Storage entre después sin una
-- segunda migración -- diferido a una fase posterior (necesita
-- @capacitor/camera, que no está instalado, y una bandeja de revisión).
--
-- owner_id null = media base compartida (curada por un admin); owner_id de
-- un entrenador = privada, solo la ve él y sus propios atletas. Esto evita
-- que dos entrenadores del mismo gimnasio (Suri y Rorro en la entrevista) se
-- vean el contenido subido entre sí.

create table if not exists exercise_media (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references exercises(id) on delete cascade,
  kind text not null default 'demo' check (kind in ('demo', 'cue', 'variant')),
  media_type text not null default 'url' check (media_type in ('url', 'upload')),
  url text,
  storage_path text,
  title text,
  notes text,
  position int not null default 0,
  owner_id uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint exercise_media_has_source check (url is not null or storage_path is not null)
);
create index if not exists exercise_media_exercise_id_idx on exercise_media(exercise_id);

alter table exercise_media enable row level security;

drop policy if exists "exercise_media select" on exercise_media;
create policy "exercise_media select" on exercise_media for select
  using (
    owner_id is null
    or owner_id = auth.uid()
    or is_my_coach(owner_id)
    or my_role() = 'admin'
  );

drop policy if exists "exercise_media write owner or admin" on exercise_media;
create policy "exercise_media write owner or admin" on exercise_media for all
  using (owner_id = auth.uid() or my_role() = 'admin')
  with check (
    my_role() = 'admin'
    or (owner_id = auth.uid() and my_role() = 'entrenador')
  );
