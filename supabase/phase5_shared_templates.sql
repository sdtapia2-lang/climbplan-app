-- ClimbPlan Fase 5: plantillas propias por entrenador (publicas/privadas)
-- Correr DESPUES de phase4_escalador_libre.sql, en el SQL Editor de Supabase.
--
-- Hasta ahora solo el Admin podia crear "planes por defecto" (template_
-- mesocycles). Esto deja que cualquier Entrenador cree los suyos, marcandolos
-- publicos o privados:
-- - Publico: lo puede usar cualquiera (mismo comportamiento que antes).
-- - Privado: solo lo ve/usa el propio creador y sus escaladores asignados
--   (coach_athletes) -- antes una plantilla no publicada solo la veia Admin.
-- Las plantillas de formulario (Fase 3) ganan la misma nocion de publico/
-- privado, que antes no tenian (eran visibles para cualquier autenticado).

-- TEMPLATE_MESOCYCLES: cualquier entrenador puede crear/editar las suyas ----
drop policy if exists "template_mesocycles select" on template_mesocycles;
create policy "template_mesocycles select" on template_mesocycles for select
  using (
    my_role() = 'admin'
    or created_by = auth.uid()
    or (is_published and (not my_restricted() or is_my_coach(created_by)))
    or (not is_published and is_my_coach(created_by))
  );

drop policy if exists "template_mesocycles insert admin" on template_mesocycles;
create policy "template_mesocycles insert" on template_mesocycles for insert
  with check (my_role() = 'admin' or my_role() = 'entrenador');

drop policy if exists "template_mesocycles update admin" on template_mesocycles;
create policy "template_mesocycles update" on template_mesocycles for update
  using (my_role() = 'admin' or (my_role() = 'entrenador' and created_by = auth.uid()))
  with check (my_role() = 'admin' or (my_role() = 'entrenador' and created_by = auth.uid()));

drop policy if exists "template_mesocycles delete admin" on template_mesocycles;
create policy "template_mesocycles delete" on template_mesocycles for delete
  using (my_role() = 'admin' or (my_role() = 'entrenador' and created_by = auth.uid()));

-- TEMPLATE_WEEKS/DAYS/BLOCKS: el dueno del template padre puede escribir ----
drop policy if exists "template_weeks write admin" on template_weeks;
create policy "template_weeks write" on template_weeks for all
  using (exists (
    select 1 from template_mesocycles tm where tm.id = template_mesocycle_id
      and (my_role() = 'admin' or (my_role() = 'entrenador' and tm.created_by = auth.uid()))
  ))
  with check (exists (
    select 1 from template_mesocycles tm where tm.id = template_mesocycle_id
      and (my_role() = 'admin' or (my_role() = 'entrenador' and tm.created_by = auth.uid()))
  ));

drop policy if exists "template_days write admin" on template_days;
create policy "template_days write" on template_days for all
  using (exists (
    select 1 from template_weeks tw join template_mesocycles tm on tm.id = tw.template_mesocycle_id
    where tw.id = template_week_id
      and (my_role() = 'admin' or (my_role() = 'entrenador' and tm.created_by = auth.uid()))
  ))
  with check (exists (
    select 1 from template_weeks tw join template_mesocycles tm on tm.id = tw.template_mesocycle_id
    where tw.id = template_week_id
      and (my_role() = 'admin' or (my_role() = 'entrenador' and tm.created_by = auth.uid()))
  ));

drop policy if exists "template_blocks write admin" on template_blocks;
create policy "template_blocks write" on template_blocks for all
  using (exists (
    select 1 from template_days td
    join template_weeks tw on tw.id = td.template_week_id
    join template_mesocycles tm on tm.id = tw.template_mesocycle_id
    where td.id = template_day_id
      and (my_role() = 'admin' or (my_role() = 'entrenador' and tm.created_by = auth.uid()))
  ))
  with check (exists (
    select 1 from template_days td
    join template_weeks tw on tw.id = td.template_week_id
    join template_mesocycles tm on tm.id = tw.template_mesocycle_id
    where td.id = template_day_id
      and (my_role() = 'admin' or (my_role() = 'entrenador' and tm.created_by = auth.uid()))
  ));

-- FORM_TEMPLATES: ahora tambien tienen publico/privado -----------------------
alter table form_templates add column if not exists is_published boolean not null default true;

drop policy if exists "form_templates select" on form_templates;
create policy "form_templates select" on form_templates for select
  using (
    my_role() = 'admin'
    or created_by = auth.uid()
    or (is_published and (not my_restricted() or is_my_coach(created_by)))
    or (not is_published and is_my_coach(created_by))
  );
