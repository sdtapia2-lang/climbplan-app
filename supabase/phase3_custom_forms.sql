-- ClimbPlan Fase 3: evaluaciones y check-ins configurables
-- Correr DESPUES de phase2_templates.sql, en el SQL Editor de Supabase.
--
-- El formulario fijo que ya existe (tablas evaluations/checkins, con las
-- pestanas Tindeq, PAR-Q, etc.) NO se toca — sigue siendo el "por defecto".
-- Esto agrega un sistema paralelo de plantillas de formulario con campos
-- configurables, para casos especificos (lesion, otra disciplina, etc.),
-- que Admin o Entrenador pueden armar sin tocar codigo.

create table if not exists form_templates (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('evaluation', 'checkin')),
  name text not null,
  description text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists form_template_fields (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references form_templates(id) on delete cascade,
  section text not null default 'General',
  key text not null,
  label text not null,
  field_type text not null check (field_type in ('text', 'number', 'boolean', 'textarea', 'select', 'date')),
  options jsonb,
  help_text text,
  position int not null default 0,
  required boolean not null default false,
  unique (template_id, key)
);

create table if not exists form_responses (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references form_templates(id) on delete cascade,
  athlete_id uuid not null references athletes(id) on delete cascade,
  response_date date not null default current_date,
  field_values jsonb not null default '{}',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_form_template_fields_template on form_template_fields(template_id);
create index if not exists idx_form_responses_athlete on form_responses(athlete_id, response_date);
create index if not exists idx_form_responses_template on form_responses(template_id);

-- RLS -----------------------------------------------------------------------
alter table form_templates enable row level security;
alter table form_template_fields enable row level security;
alter table form_responses enable row level security;

-- Cualquier autenticado puede ver las plantillas (para elegir cual usar).
create policy "form_templates select" on form_templates for select
  using (auth.role() = 'authenticated');

-- Admin o Entrenador pueden crear plantillas nuevas.
create policy "form_templates insert" on form_templates for insert
  with check (my_role() = 'admin' or my_role() = 'entrenador');

-- Admin edita cualquiera; Entrenador solo las que el mismo creo.
create policy "form_templates update" on form_templates for update
  using (my_role() = 'admin' or (my_role() = 'entrenador' and created_by = auth.uid()))
  with check (my_role() = 'admin' or (my_role() = 'entrenador' and created_by = auth.uid()));
create policy "form_templates delete" on form_templates for delete
  using (my_role() = 'admin' or (my_role() = 'entrenador' and created_by = auth.uid()));

create policy "form_template_fields select" on form_template_fields for select
  using (auth.role() = 'authenticated');
create policy "form_template_fields write" on form_template_fields for all
  using (exists (
    select 1 from form_templates ft where ft.id = template_id
      and (my_role() = 'admin' or (my_role() = 'entrenador' and ft.created_by = auth.uid()))
  ))
  with check (exists (
    select 1 from form_templates ft where ft.id = template_id
      and (my_role() = 'admin' or (my_role() = 'entrenador' and ft.created_by = auth.uid()))
  ));

-- Respuestas: mismo criterio de acceso que evaluations/checkins.
create policy "form_responses all" on form_responses for all
  using (can_access_athlete(athlete_id))
  with check (can_access_athlete(athlete_id));
