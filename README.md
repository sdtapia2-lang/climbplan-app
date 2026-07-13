# ClimbPlan

Reconstrucción propia (fuera de Base44) de la app de gestión de entrenamiento de escalada. Next.js 16 (App Router) + Supabase (Postgres + Auth), pensada para desplegarse gratis en Vercel + Supabase.

No es el código que generó Base44 — es una reimplementación equivalente, hecha inspeccionando la app publicada en `climb-coach.base44.app` y el catálogo exportado (`Base 44/ExerciseCatalog_export.csv`).

## Qué incluye

- **Dashboard**: mesociclo activo, semana actual, resumen de evaluaciones.
- **Mesociclo**: wizard para cargar un mesociclo completo (4 semanas de una sola vez), con copiar semana → semana, duplicar/vaciar día, y bloques de ejercicio con registro real vs. prescrito.
- **Entrenamiento**: vista del día a día de la semana actual para registrar series/reps/carga/RPE reales y marcar bloques como completados (pensada para el celular en el gimnasio).
- **Catálogo**: ejercicios filtrables por categoría/equipo, con marca de test/benchmark. Es una referencia, no una lista cerrada.
- **Evaluación**: formulario por pestañas (General, Salud, Movilidad, Fuerza, Dedos/Tindeq, Resistencia, Nivel), con el protocolo completo de Tindeq Progressor (MVC, Critical Force, RFD 100–250ms, asimetría).
- **Check-in semanal**: sueño, motivación, adherencia, dolor por zona.
- **Analítica**: adherencia promedio, RPE promedio, bloques completados.
- **Perfil**: datos del atleta, grados, objetivos, equipamiento, estado de salud, notas kinesiológicas — equivalente al `contexto_atleta.pdf`.

Multi-atleta: un selector en la barra superior permite cambiar entre Seba y Diego (o cualquier otro atleta que agregues directo en la tabla `athletes`).

## Roles y permisos (Fase 1)

Tres roles, gestionados desde el panel **Admin** (visible solo para administradores):

- **Administrador**: acceso total a todo. Si la misma persona entrena y administra la app (tu caso), el rol admin ya incluye todo lo que haria como entrenador o escalador — no hace falta un rol combinado.
- **Entrenador**: acceso total (crear mesociclos, editar evaluaciones/check-ins) solo sobre los escaladores que tenga asignados en el panel Admin.
- **Escalador**: cuenta atada a un unico perfil de atleta. Ve su propio mesociclo pero no puede crear uno desde cero ni tocar la estructura de dias/semanas — solo puede agregar/editar sus propios bloques de ejercicio (eso se termina de habilitar en la UI en la Fase 2, junto con "planes por defecto").

Al registrarse, una cuenta nueva queda **sin rol** (pantalla de espera) hasta que un administrador se lo asigne desde `/admin`. La primera cuenta que se crea en el proyecto queda como administrador automaticamente.

## 1. Crear el proyecto en Supabase (gratis)

1. Andá a [supabase.com](https://supabase.com), creá una cuenta y un nuevo proyecto (plan Free).
2. Cuando el proyecto esté listo, andá a **SQL Editor → New query**.
3. Pegá y ejecutá el contenido de [`supabase/schema.sql`](supabase/schema.sql). Esto crea todas las tablas, los índices, las políticas de seguridad (RLS) y siembra dos atletas (`Seba`, `Diego`).
4. Ejecutá también [`supabase/seed_exercises.sql`](supabase/seed_exercises.sql) para cargar el catálogo real de 22 ejercicios exportado de Base44.
5. Ejecutá [`supabase/phase1_roles.sql`](supabase/phase1_roles.sql) para agregar roles y permisos. Si ya tenías una cuenta creada antes de correr esto, el script hace un backfill automático: la cuenta más antigua sin perfil queda como administrador.
6. Andá a **Project Settings → API** y copiá:
   - **Project URL**
   - **anon public key**

### Confirmación de email (importante)

Por defecto Supabase Auth pide confirmar el email al crear una cuenta. Para este uso personal entre dos personas, lo más simple es desactivarlo:

- **Authentication → Providers → Email → Confirm email** → apagar.

Si lo dejás activado, vas a tener que confirmar el mail que te llega antes de poder entrar la primera vez.

## 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Completá `.env.local` con la URL y la anon key que copiaste:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Correr en local

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000`. La primera vez, usá el link "Primera vez? Crear una cuenta" en el login para crear tu usuario (email + contraseña). Con eso alcanza — no hay roles ni permisos distintos entre Seba y Diego, ambos comparten el mismo acceso a los datos.

## 4. Desplegar gratis (Vercel)

1. Subí este proyecto a un repo de GitHub (podés pedirme que lo haga si querés).
2. Andá a [vercel.com](https://vercel.com), creá una cuenta gratis e importá el repo.
3. En **Environment Variables** del proyecto en Vercel, agregá las mismas dos variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
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
  components/            # AthleteProvider, ProfileProvider, NavBar, MesocycleEditor, EvaluationForm, ui.tsx
  lib/
    supabase/            # clientes browser/server + proxy de sesion
    types.ts             # tipos TypeScript que reflejan el schema SQL
supabase/
  schema.sql             # tablas, indices, RLS
  seed_exercises.sql     # catalogo real exportado de Base44
  phase1_roles.sql       # roles, permisos, profiles, coach_athletes
```

## Notas de diseño

- **Roles**: ver seccion "Roles y permisos" arriba. `ProfileProvider` carga el perfil del usuario logueado; `AthleteProvider` deja que las políticas de seguridad (RLS) filtren automáticamente qué atletas puede ver cada quien — no hay lógica de filtrado duplicada en el cliente.
- **Guardar mesociclo = reemplazo completo**: al editar un mesociclo existente, el botón "Guardar todo" borra las semanas/días/bloques previos y los vuelve a insertar desde el estado actual del formulario. Simplifica mucho la lógica a costa de no soportar edición concurrente entre dos personas al mismo tiempo (no es un caso de uso esperado aquí). Por eso el wizard completo (`/mesociclo/new`, `/mesociclo/[id]`) está restringido a Admin/Entrenador — un Escalador no tiene permisos de escritura sobre `weeks`/`days`, así que "Guardar todo" fallaría para ese rol.
- **Semana actual**: se calcula a partir de `start_date` del mesociclo + días transcurridos / 7, igual en el Dashboard y en Entrenamiento.
