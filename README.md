# Prusik

App de gestión de entrenamiento de escalada (nombre interno de repo/proyecto: `climbplan-app`; marca de cara al usuario: **Prusik**). Next.js 16 (App Router) + Supabase (Postgres + Auth), pensada para desplegarse gratis en Vercel + Supabase.

No es el código que generó Base44 — es una reimplementación equivalente, hecha inspeccionando la app publicada en `climb-coach.base44.app` y el catálogo exportado (`Base 44/ExerciseCatalog_export.csv`).

## Marca

Rediseño visual hecho en Claude Design (handoff completo en `Claude design/App de entrenamiento de escalada/design_handoff_prusik_rebrand/`, no versionado en git — son archivos de referencia, no código de producción). Aplicado hasta ahora:

- **Tokens** (`src/app/globals.css`): paleta cálida (crema/terracota/salvia), tipografía Caprasimo (títulos) + Figtree (cuerpo), sombras y radios — vía `@theme` de Tailwind v4.
- **`ui.tsx`**: todos los primitivos (`Card`, `Button`, `Input`, `Badge`, `Modal`, etc.) reescritos con los tokens nuevos — como todas las pantallas se arman con estos mismos componentes, el nuevo look se propaga a toda la app automáticamente.
- **`NavBar`** y **login**: logo (`public/prusik-logo.png`), wordmark, tabs tipo píldora, chip de avatar.

Pendiente (diseño ya especificado en el handoff, layouts específicos por pantalla todavía no implementados): grilla de 7 columnas en Mesociclo, control segmentado en Evaluación, gráfico de barras semanal en Analítica, vista de Dashboard multi-atleta para admin, nav inferior mobile, e íconos Lucide en toda la app.

Nota tecnica: el logo usa `unoptimized` en `next/image` porque el optimizador de imagenes de Next (que depende de `sharp`) no corre bien en este entorno — el script de instalacion de `sharp` quedo bloqueado en el `npm install` original.

## Qué incluye

- **Dashboard**: mesociclo activo, semana actual, resumen de evaluaciones.
- **Mesociclo**: wizard para cargar un mesociclo completo (4 semanas de una sola vez), con copiar semana → semana, duplicar/vaciar día, y bloques de ejercicio con registro real vs. prescrito.
- **Entrenamiento**: vista del día a día de la semana actual para registrar series/reps/carga/RPE reales y marcar bloques como completados (pensada para el celular en el gimnasio).
- **Catálogo**: ejercicios filtrables por categoría/equipo, con marca de test/benchmark. Es una referencia, no una lista cerrada.
- **Evaluación**: formulario por pestañas (General, Salud, Movilidad, Fuerza, Dedos/Tindeq, Resistencia, Nivel), con el protocolo completo de Tindeq Progressor (MVC, Critical Force, RFD 100–250ms, asimetría).
- **Check-in semanal**: sueño, motivación, adherencia, dolor por zona.
- **Analítica**: adherencia promedio, RPE promedio, bloques completados.
- **Perfil**: datos del atleta, grados, objetivos, equipamiento, estado de salud, notas kinesiológicas — equivalente al `contexto_atleta.pdf`.
- **Planes** (`/plantillas`): biblioteca de plantillas de mesociclo (sin atleta ni fechas) armadas por el Administrador. Cualquiera con acceso a un atleta puede "aplicar" una para generarle un mesociclo real y editable con fecha de inicio propia.
- **Formularios** (`/formularios`): plantillas de evaluación/check-in adicionales a las de por defecto, con campos configurables (texto, número, sí/no, selección, fecha), para casos específicos como lesiones u otras disciplinas.
- **Invitar** (`/escaladores/nuevo`, admin/entrenador): da de alta directamente una cuenta de escalador "libre" para un cliente propio — sin auto-registro ni email de confirmación, se comparten las credenciales a mano.

Multi-atleta: un selector en la barra superior permite cambiar entre Seba y Diego (o cualquier otro atleta que agregues directo en la tabla `athletes`).

## Roles y permisos (Fase 1)

Tres roles, gestionados desde el panel **Admin** (visible solo para administradores):

- **Administrador**: acceso total a todo. Si la misma persona entrena y administra la app (tu caso), el rol admin ya incluye todo lo que haria como entrenador o escalador — no hace falta un rol combinado.
- **Entrenador**: acceso total (crear mesociclos, editar evaluaciones/check-ins) solo sobre los escaladores que tenga asignados en el panel Admin.
- **Escalador**: cuenta atada a un unico perfil de atleta. Ve su propio mesociclo pero no puede crear uno desde cero ni tocar la estructura de dias/semanas — solo puede agregar/editar sus propios bloques de ejercicio, o elegir una plantilla en **Planes** y aplicarla a su propio contexto (Fase 2).

Al registrarse, una cuenta nueva queda **sin rol** (pantalla de espera) hasta que un administrador se lo asigne desde `/admin`. La primera cuenta que se crea en el proyecto queda como administrador automaticamente.

## Planes por defecto (Fase 2)

Un **plan por defecto** (`template_mesocycles` + `template_weeks/days/blocks`) es la misma estructura de un mesociclo (4 semanas, dias, bloques) pero sin atleta ni fechas — es una plantilla reutilizable.

- **Admin o Entrenador** pueden crear/editar plantillas (`/plantillas/new`, editor identico al wizard de mesociclo) — desde la Fase 5, ya no es exclusivo del Admin. Ver seccion "Plantillas propias por entrenador" mas abajo para el detalle de publico/privado.
- Cualquier rol con acceso a un atleta (admin, su entrenador, o el propio escalador) puede **aplicar** una plantilla desde `/plantillas`: elige fecha de inicio y se genera una copia real e independiente del mesociclo para ese atleta — a partir de ahi es un mesociclo normal, totalmente editable segun los permisos de cada rol.
- La copia la hace una funcion de base de datos (`apply_mesocycle_template`, `security definer`) en vez del cliente: es la unica forma en que un Escalador puede terminar con un mesociclo propio, ya que no tiene permiso de `insert` directo sobre `mesocycles`/`weeks`/`days`.

## Evaluaciones y check-ins configurables (Fase 3)

El formulario por defecto de Evaluación (Tindeq, PAR-Q, etc.) y de Check-in **no se tocó** — sigue siendo el que usa `/evaluacion` y `/checkin` tal cual estaba. Esto agrega un sistema paralelo para plantillas adicionales:

- **Admin o Entrenador** pueden crear plantillas en `/formularios`: eligen tipo (Evaluación o Check-in), y arman una lista de campos (etiqueta, clave interna, sección/pestaña, tipo de dato — texto, número, sí/no, texto largo, selección, fecha —, si es obligatorio).
- Un Entrenador solo puede editar/borrar las plantillas que **el mismo creó**; el Admin puede editar cualquiera.
- Cualquier rol con acceso a un atleta puede "usar" una plantilla (`/formularios/[id]/usar`): completa los campos definidos y la respuesta queda guardada (tabla genérica `form_responses`, con los valores en JSON), con historial de respuestas anteriores para ese atleta.
- Desde la Fase 5 también tienen público/privado (ver más abajo) — antes eran visibles para cualquier autenticado sin distinción.

## Escalador "libre" (Fase 4)

Basado en `Flujo usuarios.docx`: un Entrenador (o Admin) puede dar de alta directamente la cuenta de un cliente propio desde **Invitar** (`/escaladores/nuevo`), en vez de que esa persona se registre sola. Esa cuenta queda marcada `profiles.restricted = true`, con dos restricciones extra sobre el Escalador normal:

- **Visibilidad acotada**: en **Planes** y **Formularios** solo ve las plantillas creadas por *su propio* entrenador asignado (via `coach_athletes`), no todas las publicadas.
- **Sin edición de ejercicios**: no puede agregar, quitar ni modificar los bloques de su planificación (ejercicio, series, reps, carga) — solo registrar lo que hizo (series/reps/carga reales, RPE, dolor, comentario, marcar completado) en **Entrenamiento**. Esto lo aplica un trigger en la base de datos (`enforce_restricted_block_edit`), no solo la UI.

El resto del flujo del documento (login con Google, pagos, directorio público de entrenadores) queda pendiente de una conversación de alcance aparte antes de implementarse — son cambios grandes (marketplace, cobros) que ameritan su propia planificación.

## Plantillas propias por entrenador (Fase 5)

Hasta la Fase 4, solo el Admin podía crear planes por defecto (`template_mesocycles`). Ahora cualquier **Entrenador** también puede, con la misma noción de público/privado que ya tenían las plantillas de formulario:

- **Pública**: la puede ver y aplicar cualquiera (mismo comportamiento que antes de esta fase).
- **Privada**: solo la ve/aplica su propio creador y los escaladores que tiene asignados (`coach_athletes`) — antes, algo "no publicado" solo lo veía el Admin.
- Un Entrenador solo puede editar/borrar lo que **él mismo creó** (`created_by`); si intenta abrir la edición de algo ajeno, la app se lo bloquea aunque pueda verlo en la lista (por ser público).
- Las plantillas de formulario (Fase 3) ganaron la misma columna `is_published` — antes eran todas visibles para cualquier autenticado sin distinción.
- Un escalador restringido (Fase 4) sigue viendo únicamente lo creado por su propio entrenador, sea público o privado — esta fase no cambia esa regla.

## Perfil público de entrenador + directorio (Fase 6)

Del resto de `Flujo usuarios.docx` (login con Google, pagos, elegir modalidad de entrenamiento al registrarse) se scopeó solo la parte de descubrimiento: que un Entrenador pueda armar un perfil público y que cualquier usuario lo encuentre. Registro propio, login con Google y pagos siguen pendientes de su propia conversación de alcance.

- **Mi perfil** (`/perfil`, Entrenador/Admin): cada Entrenador carga su propia bio, certificaciones/logros y contacto (correo/teléfono), y decide si su perfil es público o privado con un toggle. Nadie edita el perfil de otro — ni el Admin, salvo que use el SQL directo.
- **Entrenadores** (`/entrenadores`, cualquier autenticado): directorio con los Entrenadores que se marcaron como públicos. Click en una tarjeta lleva a `/entrenadores/[id]` con el perfil completo (bio, certificaciones, contacto).
- Esto no cambia las políticas de `profiles` existentes (cada quien sigue viendo solo su propio perfil salvo el Admin) — se agregó una policy nueva y aislada que solo expone filas `role = 'entrenador' and public_profile = true`.
- No hay todavía ninguna acción de "solicitar entrenador" ni asignación automática: la asignación Entrenador↔Escalador se sigue haciendo desde el panel de Admin (Fase 1), igual que antes.

## Login con Google (Fase 7)

Botón "Continuar con Google" en `/login`, además del login por email/contraseña que ya existía (no se toca). Al entrar por primera vez con Google, el trigger `handle_new_user` (Fase 1) crea el `profile` igual que con cualquier alta nueva — la cuenta queda con `role = null` ("pendiente") hasta que un Admin le asigna un rol desde el panel.

- `src/app/auth/callback/route.ts`: intercambia el `code` que devuelve Google por una sesión de Supabase y redirige a `/`.
- Esto requiere configuración manual en Google Cloud Console y en el dashboard de Supabase — no es algo que se resuelva solo con código. Ver el paso 2 más abajo.

## 1. Crear el proyecto en Supabase (gratis)

1. Andá a [supabase.com](https://supabase.com), creá una cuenta y un nuevo proyecto (plan Free).
2. Cuando el proyecto esté listo, andá a **SQL Editor → New query**.
3. Pegá y ejecutá el contenido de [`supabase/schema.sql`](supabase/schema.sql). Esto crea todas las tablas, los índices, las políticas de seguridad (RLS) y siembra dos atletas (`Seba`, `Diego`).
4. Ejecutá también [`supabase/seed_exercises.sql`](supabase/seed_exercises.sql) para cargar el catálogo real de 22 ejercicios exportado de Base44.
5. Ejecutá [`supabase/phase1_roles.sql`](supabase/phase1_roles.sql) para agregar roles y permisos. Si ya tenías una cuenta creada antes de correr esto, el script hace un backfill automático: la cuenta más antigua sin perfil queda como administrador.
6. Ejecutá [`supabase/phase2_templates.sql`](supabase/phase2_templates.sql) para agregar los planes por defecto (plantillas de mesociclo).
7. Ejecutá [`supabase/phase3_custom_forms.sql`](supabase/phase3_custom_forms.sql) para agregar las plantillas de evaluación/check-in configurables.
8. Ejecutá [`supabase/phase4_escalador_libre.sql`](supabase/phase4_escalador_libre.sql) para agregar el escalador "libre" (visibilidad acotada + sin edición de ejercicios).
9. Ejecutá [`supabase/phase5_shared_templates.sql`](supabase/phase5_shared_templates.sql) para que cualquier Entrenador pueda crear sus propias plantillas (públicas/privadas).
10. Ejecutá [`supabase/phase6_coach_directory.sql`](supabase/phase6_coach_directory.sql) para agregar el perfil público de Entrenador y el directorio.
11. Andá a **Project Settings → API** y copiá:
   - **Project URL**
   - **anon public key**
   - **service_role key** (la vas a necesitar en el paso 3, para `/api/create-athlete`)

### Confirmación de email (importante)

Por defecto Supabase Auth pide confirmar el email al crear una cuenta. Para este uso personal entre dos personas, lo más simple es desactivarlo:

- **Authentication → Providers → Email → Confirm email** → apagar.

Si lo dejás activado, vas a tener que confirmar el mail que te llega antes de poder entrar la primera vez.

### Login con Google (opcional, Fase 7)

Esto es configuración externa que tenés que hacer vos — no hay forma de automatizarla desde acá.

1. **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)): creá un proyecto (o reusá uno) y andá a **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Tipo de aplicación: **Web application**.
   - **Authorized JavaScript origins**: agregá `https://climbplan-app.vercel.app` y, si probás en local, `http://localhost:3000`.
   - **Authorized redirect URIs**: agregá `https://<tu-project-ref>.supabase.co/auth/v1/callback` (reemplazá `<tu-project-ref>` por el de tu Project URL de Supabase — este es el callback de Supabase, no el de la app). Si Google te pide configurar la pantalla de consentimiento (OAuth consent screen) primero, hacelo con los datos básicos (nombre de la app, email de soporte).
   - Al crear, Google te da un **Client ID** y un **Client Secret**.
2. **Supabase Dashboard → Authentication → Providers → Google**: activalo y pegá el Client ID y el Client Secret del paso anterior.
3. **Supabase Dashboard → Authentication → URL Configuration**:
   - **Site URL**: `https://climbplan-app.vercel.app`
   - **Redirect URLs**: agregá `https://climbplan-app.vercel.app/auth/callback` y, si probás en local, `http://localhost:3000/auth/callback`.

Sin estos tres pasos, el botón "Continuar con Google" en `/login` va a mostrar un error de Supabase (provider no habilitado) en vez de redirigir a Google.

## 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Completá `.env.local` con la URL, la anon key y la service role key que copiaste:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` es un secreto con acceso total a la base de datos (bypassea RLS) — nunca le pongas el prefijo `NEXT_PUBLIC_`, y nunca la subas a git (el `.gitignore` ya excluye `.env.local`, solo revisá que sigas usando ese nombre de archivo).

## 3. Correr en local

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000`. La primera vez, usá el link "Primera vez? Crear una cuenta" en el login para crear tu usuario (email + contraseña). Con eso alcanza — no hay roles ni permisos distintos entre Seba y Diego, ambos comparten el mismo acceso a los datos.

## 4. Desplegar gratis (Vercel)

1. Subí este proyecto a un repo de GitHub (podés pedirme que lo haga si querés).
2. Andá a [vercel.com](https://vercel.com), creá una cuenta gratis e importá el repo.
3. En **Environment Variables** del proyecto en Vercel, agregá las mismas tres variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Deploy. Vercel te da una URL pública (tipo `climbplan.vercel.app`) accesible desde el celular, igual que la app de Base44.

## Estructura del proyecto

```
src/
  app/
    login/              # login (Supabase Auth)
    (app)/              # rutas autenticadas, con NavBar + selector de atleta
      page.tsx           # Dashboard
      mesociclo/          # lista + wizard (new, [id])
      entrenamiento/       # registro diario de la semana actual
      catalogo/            # catalogo de ejercicios
      evaluacion/           # lista + formulario tabbed (new, [id])
      checkin/               # check-in semanal
      analitica/              # metricas
      atleta/[id]/             # perfil del atleta
      admin/                    # panel de administracion (solo admin)
      plantillas/                # planes por defecto: lista+aplicar (new, [id] = solo admin)
      formularios/                # plantillas de evaluacion/check-in: lista+usar (new, [id] = admin/entrenador)
      escaladores/nuevo/           # invitar escalador libre (admin/entrenador)
    api/
      create-athlete/         # route handler server-side, usa la service role key
  components/            # AthleteProvider, ProfileProvider, NavBar, MesocycleEditor, TemplateEditor,
                          # EvaluationForm, FormTemplateBuilder, DynamicForm, ui.tsx
  lib/
    supabase/            # clientes browser/server/admin + proxy de sesion
    types.ts             # tipos TypeScript que reflejan el schema SQL
supabase/
  schema.sql             # tablas, indices, RLS
  seed_exercises.sql     # catalogo real exportado de Base44
  phase1_roles.sql       # roles, permisos, profiles, coach_athletes
  phase2_templates.sql   # planes por defecto + funcion apply_mesocycle_template
  phase3_custom_forms.sql # plantillas de evaluacion/check-in configurables
  phase4_escalador_libre.sql # escalador restringido: visibilidad acotada + bloqueo de ejercicios
  phase5_shared_templates.sql # entrenador crea plantillas propias (publicas/privadas)
  phase6_coach_directory.sql # perfil publico de entrenador + directorio
```

## Notas de diseño

- **Roles**: ver seccion "Roles y permisos" arriba. `ProfileProvider` carga el perfil del usuario logueado; `AthleteProvider` deja que las políticas de seguridad (RLS) filtren automáticamente qué atletas puede ver cada quien — no hay lógica de filtrado duplicada en el cliente.
- **Guardar mesociclo = reemplazo completo**: al editar un mesociclo existente, el botón "Guardar todo" borra las semanas/días/bloques previos y los vuelve a insertar desde el estado actual del formulario. Simplifica mucho la lógica a costa de no soportar edición concurrente entre dos personas al mismo tiempo (no es un caso de uso esperado aquí). Por eso el wizard completo (`/mesociclo/new`, `/mesociclo/[id]`) está restringido a Admin/Entrenador — un Escalador no tiene permisos de escritura sobre `weeks`/`days`, así que "Guardar todo" fallaría para ese rol.
- **Semana actual**: se calcula a partir de `start_date` del mesociclo + días transcurridos / 7, igual en el Dashboard y en Entrenamiento.
