-- Fase 31: permite que los entrenadores (no solo admin) creen/editen/borren
-- Rutinas. El diseño original (fase 20) ya decia "las Rutinas son una
-- entidad aparte... que el entrenador arma eligiendo ejercicios individuales
-- existentes", pero el RLS habia quedado en admin-only por error: un
-- entrenador no podia guardar ninguna rutina (el catalogo base de ejercicios
-- individuales SI sigue siendo admin-only, eso no cambia).
--
-- Correr en el SQL Editor de Supabase.

drop policy if exists "routines write admin only" on routines;
create policy "routines write coach or admin" on routines for insert
  with check (my_role() in ('admin', 'entrenador'));

drop policy if exists "routines update admin only" on routines;
create policy "routines update coach or admin" on routines for update
  using (my_role() in ('admin', 'entrenador')) with check (my_role() in ('admin', 'entrenador'));

drop policy if exists "routines delete admin only" on routines;
create policy "routines delete coach or admin" on routines for delete
  using (my_role() in ('admin', 'entrenador'));

drop policy if exists "routine_items write admin only" on routine_items;
create policy "routine_items write coach or admin" on routine_items for insert
  with check (my_role() in ('admin', 'entrenador'));

drop policy if exists "routine_items update admin only" on routine_items;
create policy "routine_items update coach or admin" on routine_items for update
  using (my_role() in ('admin', 'entrenador')) with check (my_role() in ('admin', 'entrenador'));

drop policy if exists "routine_items delete admin only" on routine_items;
create policy "routine_items delete coach or admin" on routine_items for delete
  using (my_role() in ('admin', 'entrenador'));
