-- FASE 6: perfil publico de entrenador + directorio -------------------------
-- Agrega campos de perfil publico (bio, certificaciones, contacto) que cada
-- entrenador administra desde /perfil, y una policy de lectura para que
-- cualquier usuario autenticado pueda ver los entrenadores que se marcaron
-- como publicos en /entrenadores. No modifica las policies existentes de
-- profiles (siguen intactas: cada quien ve su propio perfil, admin ve todos).

alter table profiles add column if not exists bio text;
alter table profiles add column if not exists certifications text;
alter table profiles add column if not exists contact_email text;
alter table profiles add column if not exists contact_phone text;
alter table profiles add column if not exists public_profile boolean not null default false;

-- admin cuenta como entrenador tambien (ver Fase 1: admin incluye las
-- capacidades de entrenador), asi que puede aparecer en el directorio si
-- activa su perfil publico.
drop policy if exists "profiles select public coaches" on profiles;
create policy "profiles select public coaches" on profiles for select
  using (role in ('entrenador', 'admin') and public_profile = true);
