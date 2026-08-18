-- ClimbPlan Fase 42: fix RLS de weeks/days para upsert con filas nuevas
-- (descubierto al probar Fase 5a -- "+ Semana" en MesocycleEditor).
--
-- Bug: las policies "weeks write admin/coach" y "days write admin/coach"
-- (phase1_roles.sql) resuelven el USING via week_athlete_id(id)/day_athlete_id(id)
-- -- una auto-consulta que busca la propia fila por su id. Para una fila
-- REALMENTE NUEVA (insertada por MesocycleEditor.persist() via
-- upsert(rows, {onConflict:"id"}) cuando se agrega una semana con "+ Semana"),
-- esa fila todavia no existe en la tabla, asi que la auto-consulta devuelve
-- null y el USING evalua a false.
--
-- Con un INSERT simple esto no se nota (Postgres solo evalua WITH CHECK, que
-- ya resuelve bien via mesocycle_id/week_id -- columnas de la fila nueva, no
-- un auto-lookup). Pero supabase-js upsert() genera un unico
-- INSERT ... ON CONFLICT (id) DO UPDATE que mezcla filas existentes (update)
-- con la fila nueva (insert) en el mismo statement, y para ON CONFLICT DO
-- UPDATE Postgres exige que el USING de la policy tambien pase -- ahi
-- explota con "new row violates row-level security policy for table weeks".
--
-- Como no habia forma de agregar una semana a un mesociclo ya guardado antes
-- de este fix (siempre eran exactamente 4, creadas todas juntas en el primer
-- guardado), el bug nunca se disparaba en el flujo real. Fix: el USING pasa
-- a resolver por la misma columna FK que ya usa el WITH CHECK
-- (mesocycle_id/week_id, presente en la fila nueva sin auto-lookup) en vez de
-- por el id propio -- mismo patron que ya usaba (correctamente) la policy de
-- blocks via day_id.

drop policy if exists "weeks write admin/coach" on weeks;
create policy "weeks write admin/coach" on weeks for all
  using (
    my_role() = 'admin'
    or exists (select 1 from mesocycles m where m.id = mesocycle_id and is_my_assigned_athlete(m.athlete_id))
  )
  with check (
    exists (
      select 1 from mesocycles m
      where m.id = mesocycle_id
        and (my_role() = 'admin' or is_my_assigned_athlete(m.athlete_id))
    )
  );

drop policy if exists "days write admin/coach" on days;
create policy "days write admin/coach" on days for all
  using (
    my_role() = 'admin'
    or exists (select 1 from weeks w where w.id = week_id and is_my_assigned_athlete(week_athlete_id(w.id)))
  )
  with check (
    exists (
      select 1 from weeks w
      where w.id = week_id
        and (my_role() = 'admin' or is_my_assigned_athlete(week_athlete_id(w.id)))
    )
  );
