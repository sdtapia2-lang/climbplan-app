# Rediseño "Granito + Salvia" (paleta, tipografía, layout, navegación) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la paleta/tipografía del sistema de diseño de Apex, reagrupar la navegación (sidebar desktop + bottom nav mobile) con un selector de atleta persistente y acceso fijo a cerrar sesión, y normalizar espaciado/tipografía inconsistentes — sin agregar funcionalidad nueva.

**Architecture:** Cambios de tokens CSS (`globals.css`, `layout.tsx`) que se propagan automáticamente a todos los componentes vía `var(--color-*)`/`var(--font-*)`. La navegación se reestructura extrayendo el selector de atleta a un componente propio (`AthleteSwitcher`) y agregando una barra superior fija solo en mobile (`MobileTopBar`) para el acceso a cerrar sesión. La pantalla "Progreso" del bottom nav reutiliza las páginas ya existentes de Evaluación y Check-in con un selector de pestaña (`Segmented`, ya existente en `ui.tsx`), sin duplicar lógica de datos.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript, Supabase (`@supabase/ssr`).

## Global Constraints

- Sin framework de tests automatizados en este repo (no hay Jest/Vitest/Playwright en `package.json`, no hay archivos `*.test.ts(x)`). La verificación de cada tarea es **manual**: correr `npm run dev` y comprobar en el navegador (Browser pane), como ya se hizo en la revisión QA previa. No introducir un framework de testing nuevo — no fue pedido y excede el alcance.
- No modificar `CATEGORY_COLORS` en `src/lib/types.ts` (paleta independiente, fuera de alcance según spec).
- No modificar radios de borde ni `--shadow-organic-*` (fuera de alcance según spec).
- No agregar funcionalidad de producto nueva — solo reorganización visual/estructural.
- Todo el texto de UI está en español (seguir el idioma existente en cada archivo tocado).
- Verificar `npm run lint` sin errores nuevos al final de cada tarea que toque código TypeScript/TSX.

---

## File Structure

**Crear:**
- `src/components/AthleteSwitcher.tsx` — selector de atleta persistente (avatar + nombre + dropdown), extraído de la lógica que hoy vive embebida en `Sidebar.tsx`.
- `src/components/MobileTopBar.tsx` — barra superior fija solo mobile (`md:hidden`), con logo y botón de cerrar sesión siempre accesible.
- `src/app/(app)/progreso/page.tsx` — pantalla "Progreso" del bottom nav mobile: tabs (`Segmented`) que alternan entre las páginas ya existentes de Evaluación y Check-in.

**Modificar:**
- `src/app/globals.css` — paleta de color (tokens `:root` y `@theme inline`).
- `src/app/layout.tsx` — carga de fuentes (`Archivo_Black` + `Inter` en vez de `Caprasimo` + `Figtree`).
- `src/components/ui.tsx` — normalizar padding arbitrario de `Card` y `Modal` a la escala estándar de Tailwind.
- `src/components/Sidebar.tsx` — agrupar `NAV_ITEMS` en 3 secciones con encabezado; reemplazar el bloque de avatar/dropdown por `<AthleteSwitcher />` arriba del nav.
- `src/components/MobileNav.tsx` — reemplazar el item "Check-in" por "Progreso" (`/progreso`).
- `src/app/(app)/layout.tsx` — renderizar `<MobileTopBar />` y ajustar el padding superior de `<main>` en mobile.
- 15 archivos de página con `<h1 className="text-xl ...">` — normalizar a `text-2xl` para que coincida con el Dashboard (listados exactos en Task 4).

---

### Task 1: Paleta de color "Granito + Salvia"

**Files:**
- Modify: `src/app/globals.css:3-42` (bloque `:root`)

**Interfaces:**
- Produces: mismos nombres de variables CSS que ya existen (`--color-bg`, `--color-surface`, `--color-text`, `--color-divider`, `--color-neutral-100..900`, `--color-accent-100..900`, `--color-accent-2-100..900`). Ningún consumidor cambia de nombre — `ui.tsx` y el resto de componentes siguen funcionando sin tocarlos.

- [ ] **Step 1: Reemplazar los valores de color en `:root`**

En `src/app/globals.css`, reemplazar completo el bloque `:root { ... }` (líneas 3-42) por:

```css
:root {
  --color-bg: #f1efe9;
  --color-surface: #e4e1d9;
  --color-text: #2a2825;
  --color-divider: color-mix(in srgb, #2a2825 16%, transparent);

  --color-neutral-100: #f7f5f1;
  --color-neutral-200: #ece9e2;
  --color-neutral-300: #ddd8cd;
  --color-neutral-400: #b9b3a6;
  --color-neutral-500: #9c9686;
  --color-neutral-600: #84806f;
  --color-neutral-700: #666255;
  --color-neutral-800: #4a4740;
  --color-neutral-900: #2e2c27;

  --color-accent-100: #eef2e8;
  --color-accent-200: #dbe4cc;
  --color-accent-300: #c0d1a8;
  --color-accent-400: #a0b884;
  --color-accent-500: #7d9169;
  --color-accent-600: #647550;
  --color-accent-700: #5c6e4a;
  --color-accent-800: #414f34;
  --color-accent-900: #2b3423;

  --color-accent-2-100: #f5efe8;
  --color-accent-2-200: #e9dccb;
  --color-accent-2-300: #d6bfa0;
  --color-accent-2-400: #bd9a72;
  --color-accent-2-500: #a17c54;
  --color-accent-2-600: #816140;
  --color-accent-2-700: #614933;
  --color-accent-2-800: #443323;
  --color-accent-2-900: #2c2116;

  --shadow-organic-sm: 0 1px 2px color-mix(in srgb, #2e2c27 14%, transparent);
  --shadow-organic-md: 0 3px 10px color-mix(in srgb, #2e2c27 16%, transparent);
  --shadow-organic-lg: 0 12px 32px color-mix(in srgb, #2e2c27 22%, transparent);
}
```

(Los `--shadow-organic-*` quedan con el mismo valor de opacidad/offset, solo se actualiza el color base de `#2e2b25` a `#2e2c27` — el nuevo `--color-neutral-900` — para que la sombra siga derivando del texto/neutral más oscuro del sistema; el cambio es imperceptible a simple vista.)

- [ ] **Step 2: Levantar el dev server y verificar visualmente**

Run: `npm run dev`

Abrir `http://localhost:3000` en el Browser pane (usar `preview_start` con `{name: "climbplan-dev"}` o navegar directo si ya hay un server corriendo). Confirmar:
- El fondo es beige-grisáceo frío (no terracota).
- Los botones primarios (`Button` variant `primary`, ej. en Dashboard o Mesociclo) son verde salvia, no naranja.
- No hay texto ilegible (contraste roto) en ninguna pantalla visitada.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: aplica paleta Granito + Salvia a los tokens de color"
```

---

### Task 2: Tipografía Archivo Black + Inter

**Files:**
- Modify: `src/app/layout.tsx:1-15`

**Interfaces:**
- Consumes: ninguno.
- Produces: variables CSS `--font-caprasimo`→ renombrada a mantener compatibilidad no es necesaria porque `globals.css` referencia `var(--font-caprasimo)`/`var(--font-figtree)` directamente en el bloque `@theme inline` — este task también actualiza esas referencias para que apunten a las nuevas variables generadas por `next/font/google`.

**Files (actualizado):**
- Modify: `src/app/layout.tsx:1-15`
- Modify: `src/app/globals.css:83-85` (bloque `@theme inline`, líneas `--font-heading`/`--font-body`/`--font-sans`)

- [ ] **Step 1: Reemplazar la carga de fuentes en `layout.tsx`**

En `src/app/layout.tsx`, reemplazar:

```typescript
import { Caprasimo, Figtree } from "next/font/google";
```

por:

```typescript
import { Archivo_Black, Inter } from "next/font/google";
```

y reemplazar el bloque de instanciación (líneas 6-15):

```typescript
const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

Y actualizar el `className` del `<html>` (línea 47):

```typescript
      className={`${archivoBlack.variable} ${inter.variable} h-full antialiased`}
```

- [ ] **Step 2: Actualizar las referencias de fuente en `globals.css`**

En `src/app/globals.css`, dentro del bloque `@theme inline`, reemplazar:

```css
  --font-heading: var(--font-caprasimo), system-ui, sans-serif;
  --font-body: var(--font-figtree), system-ui, sans-serif;
  --font-sans: var(--font-figtree), system-ui, sans-serif;
```

por:

```css
  --font-heading: var(--font-archivo-black), system-ui, sans-serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
  --font-sans: var(--font-inter), system-ui, sans-serif;
```

- [ ] **Step 3: Verificar visualmente**

Con el dev server corriendo, recargar `http://localhost:3000`. Confirmar:
- Los títulos (`h1`-`h4`, botones) se ven en una tipografía geométrica bold (Archivo Black), no la serif redondeada anterior (Caprasimo).
- El texto de cuerpo usa Inter (sans humanista limpia), no Figtree.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: reemplaza tipografía por Archivo Black + Inter"
```

---

### Task 3: Normalizar espaciado arbitrario en `ui.tsx`

**Files:**
- Modify: `src/components/ui.tsx:7-15` (`Card`)
- Modify: `src/components/ui.tsx:113-142` (`Modal`)

**Interfaces:**
- Consumes: ninguno nuevo.
- Produces: mismas firmas de `Card({ children, className })` y `Modal({ open, onClose, title, children })` — ningún consumidor externo cambia.

- [ ] **Step 1: Normalizar el padding de `Card`**

En `src/components/ui.tsx`, reemplazar:

```typescript
      className={`bg-[var(--color-surface)] rounded-[32px] p-[13px] shadow-[var(--shadow-organic-sm)] ${className}`}
```

por:

```typescript
      className={`bg-[var(--color-surface)] rounded-[32px] p-3.5 shadow-[var(--shadow-organic-sm)] ${className}`}
```

(`p-3.5` = 14px, en la escala estándar de Tailwind — reemplaza el valor arbitrario de 13px por el múltiplo más cercano de la escala.)

- [ ] **Step 2: Normalizar el padding del contenedor de `Modal`**

En `src/components/ui.tsx`, dentro de `Modal`, reemplazar:

```typescript
      <div className="bg-[var(--color-surface)] rounded-[32px] max-w-lg w-full max-h-[85vh] overflow-y-auto p-[17.6px] relative shadow-[var(--shadow-organic-lg)]">
```

por:

```typescript
      <div className="bg-[var(--color-surface)] rounded-[32px] max-w-lg w-full max-h-[85vh] overflow-y-auto p-4 relative shadow-[var(--shadow-organic-lg)]">
```

(`p-4` = 16px, reemplaza el valor arbitrario de 17.6px.)

- [ ] **Step 3: Verificar visualmente**

Con el dev server corriendo, abrir cualquier pantalla con cards (ej. Dashboard, Catálogo) y cualquier modal (ej. "+ Nueva métrica" en Check-in). Confirmar que el espaciado interno se ve consistente y no hay contenido pegado a los bordes.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui.tsx
git commit -m "refactor: normaliza padding arbitrario de Card y Modal a la escala de Tailwind"
```

---

### Task 4: Consistencia tipográfica de encabezados `h1`

**Files:**
- Modify: `src/app/(app)/admin/page.tsx:85`
- Modify: `src/app/(app)/catalogo/page.tsx:93`
- Modify: `src/app/(app)/atleta/[id]/page.tsx:97`
- Modify: `src/app/(app)/escaladores/nuevo/page.tsx:51`
- Modify: `src/app/(app)/solicitudes/page.tsx:85`
- Modify: `src/app/(app)/entrenamiento/page.tsx:186`
- Modify: `src/app/(app)/entrenadores/page.tsx:32`
- Modify: `src/app/(app)/plantillas/page.tsx:65`
- Modify: `src/app/(app)/checkin/page.tsx:217`
- Modify: `src/app/(app)/mesociclo/page.tsx:95`
- Modify: `src/app/(app)/perfil/page.tsx:60`
- Modify: `src/app/(app)/formularios/page.tsx:35`
- Modify: `src/app/(app)/analitica/page.tsx:133`
- Modify: `src/app/(app)/evaluacion/page.tsx:33`

**Interfaces:** ninguna — cambio puramente de clase CSS en JSX estático, sin props ni lógica involucrada.

- [ ] **Step 1: Reemplazar `text-xl` por `text-2xl` en cada `<h1>` listado**

En cada uno de los 14 archivos de arriba, el patrón a reemplazar es idéntico: dentro del `<h1 className="...">`, cambiar `text-xl` por `text-2xl`. Ejemplo concreto (`src/app/(app)/admin/page.tsx:85`):

```typescript
// Antes
<h1 className="text-xl font-semibold">Administración</h1>
// Después
<h1 className="text-2xl font-semibold">Administración</h1>
```

El mismo reemplazo (`text-xl` → `text-2xl`, preservando el resto de la clase tal cual — `mb-1`, `mb-2`, `mb-6`, etc. según el archivo) aplica a los 13 archivos restantes de la lista. `src/app/(app)/entrenamiento/page.tsx:186` tiene el `<h1>` en 3 líneas:

```typescript
// Antes
<h1 className="text-xl font-semibold">
  {mesocycle.name} &mdash; Semana {week?.week_number}
</h1>
// Después
<h1 className="text-2xl font-semibold">
  {mesocycle.name} &mdash; Semana {week?.week_number}
</h1>
```

No tocar `src/app/(app)/page.tsx` (Dashboard, ya en `text-2xl`) ni `src/app/(app)/entrenadores/[id]/page.tsx` (ya usa `text-2xl` con la variable de heading explícita).

- [ ] **Step 2: Verificar visualmente**

Recorrer al menos 4 de las pantallas modificadas (ej. Admin, Catálogo, Check-in, Mesociclo) y confirmar que el título principal se ve del mismo tamaño que en el Dashboard.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: sin errores nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)
git commit -m "style: unifica el tamaño de los encabezados h1 en text-2xl"
```

---

### Task 5: Componente `AthleteSwitcher`

**Files:**
- Create: `src/components/AthleteSwitcher.tsx`

**Interfaces:**
- Consumes: `useAthlete()` de `src/components/AthleteProvider.tsx` (`{ athletes, athlete, setAthleteId }`), `useProfile()` de `src/components/ProfileProvider.tsx` (`{ profile }`).
- Produces: `export function AthleteSwitcher({ collapsed }: { collapsed?: boolean }): JSX.Element` — componente standalone, sin efectos secundarios ni estado compartido con otros componentes (maneja su propio `open` local).

Este componente extrae la lógica de avatar+dropdown+rol que hoy vive embebida al final de `Sidebar.tsx` (líneas 158-195), para que pueda ubicarse **arriba** del nav en vez de abajo, sin duplicar la lógica de `canSwitch`/`ROLE_LABELS`.

- [ ] **Step 1: Crear el componente**

Crear `src/components/AthleteSwitcher.tsx`:

```typescript
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAthlete } from "./AthleteProvider";
import { useProfile } from "./ProfileProvider";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  entrenador: "Entrenador",
  escalador: "Escalador",
};

export function AthleteSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { athletes, athlete, setAthleteId } = useAthlete();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const canSwitch = athletes.length > 1;
  const initial = (profile?.full_name || profile?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative px-3 pt-3 pb-2">
      {open && canSwitch && (
        <div className="absolute left-3 top-[calc(100%-4px)] bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-organic-md)] min-w-[160px] py-1 z-20">
          {athletes.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setAthleteId(a.id);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-[var(--color-text)]/[0.06]"
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => canSwitch && setOpen((o) => !o)}
        className={`flex items-center gap-2 w-full rounded-2xl bg-[var(--color-bg)] px-2 py-1.5 ${collapsed ? "justify-center" : ""}`}
      >
        <div
          className="w-8 h-8 rounded-full bg-[var(--color-accent-300)] text-[var(--color-accent-800)] flex items-center justify-center text-sm font-semibold shrink-0"
          title={profile?.full_name || profile?.email || ""}
        >
          {initial}
        </div>
        {!collapsed && (
          <div className="text-left overflow-hidden">
            <p className="text-sm truncate flex items-center gap-1">
              {athlete?.name ?? "Sin atletas"}
              {canSwitch && <ChevronDown size={12} strokeWidth={2.75} className="text-[var(--color-text)]/50 shrink-0" aria-hidden="true" />}
            </p>
            {profile?.role && <p className="text-xs text-[var(--color-text)]/55">{ROLE_LABELS[profile.role]}</p>}
          </div>
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: sin errores (el archivo todavía no se usa en ningún lado — está bien que quede "unused" momentáneamente, `Sidebar.tsx` lo importa en el Task 6 inmediatamente después).

- [ ] **Step 3: Commit**

```bash
git add src/components/AthleteSwitcher.tsx
git commit -m "feat: extrae AthleteSwitcher como componente propio"
```

---

### Task 6: Sidebar agrupado + integrar `AthleteSwitcher`

**Files:**
- Modify: `src/components/Sidebar.tsx` (reescritura completa del archivo)

**Interfaces:**
- Consumes: `AthleteSwitcher` (Task 5), `useAthlete()`, `useProfile()`, `isAdmin`/`isCoach`/`isAthleteRole`/`canCreateMesocycles` de `ProfileProvider.tsx` (sin cambios de firma).
- Produces: `export function Sidebar(): JSX.Element` — misma firma pública, sin props. El resto de la app (`src/app/(app)/layout.tsx`) sigue haciendo `<Sidebar />` sin cambios.

Agrupación (según spec, con la ubicación de los ítems no mencionados explícitamente decidida así: Dashboard queda como link suelto arriba de los grupos —es el "home"—; Entrenamiento se suma a Planificación —es donde se ejecuta lo planificado—; Formularios se suma a Seguimiento —gestiona las plantillas de evaluación/check-in—; Invitar se suma a Personas —es una acción sobre personas—):

- **(sin grupo, arriba)**: Dashboard
- **Planificación**: Mesociclo, Planes, Entrenamiento, Catálogo
- **Seguimiento**: Evaluación, Check-in, Formularios, Analítica (Analítica solo coach/admin, como ya ocurre hoy)
- **Personas**: Entrenadores, Invitar (solo si `canCreateMesocycles`), Solicitudes (solo coach/admin), Admin (solo admin)

- [ ] **Step 1: Reescribir `Sidebar.tsx`**

Reemplazar el contenido completo de `src/components/Sidebar.tsx` por:

```typescript
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAthlete } from "./AthleteProvider";
import { useProfile, isAdmin, isCoach, isAthleteRole, canCreateMesocycles } from "./ProfileProvider";
import { AthleteSwitcher } from "./AthleteSwitcher";
import {
  LayoutDashboard,
  Layers,
  Calendar,
  Dumbbell,
  BookOpen,
  ClipboardCheck,
  Heart,
  FileText,
  BarChart3,
  UserPlus,
  ShieldCheck,
  Compass,
  UserCog,
  Inbox,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };
type NavGroup = { label: string; items: NavItem[] };

const STORAGE_KEY = "climbplan.sidebarCollapsed";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { athlete } = useAthlete();
  const { profile } = useProfile();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee preferencia guardada al montar
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const groups: NavGroup[] = [
    {
      label: "Planificación",
      items: [
        { href: "/mesociclo", label: "Mesociclo", icon: Calendar },
        { href: "/plantillas", label: "Planes", icon: Layers },
        { href: "/entrenamiento", label: "Entrenamiento", icon: Dumbbell },
        { href: "/catalogo", label: "Catálogo", icon: BookOpen },
      ],
    },
    {
      label: "Seguimiento",
      items: [
        { href: "/evaluacion", label: "Evaluación", icon: ClipboardCheck },
        { href: "/checkin", label: "Check-in", icon: Heart },
        { href: "/formularios", label: "Formularios", icon: FileText },
        ...(isCoach(profile) || isAdmin(profile)
          ? [{ href: "/analitica", label: "Analítica", icon: BarChart3 }]
          : []),
      ],
    },
    {
      label: "Personas",
      items: [
        { href: "/entrenadores", label: "Entrenadores", icon: Compass },
        ...(canCreateMesocycles(profile) ? [{ href: "/escaladores/nuevo", label: "Invitar", icon: UserPlus }] : []),
        ...(isCoach(profile) || isAdmin(profile) ? [{ href: "/solicitudes", label: "Solicitudes", icon: Inbox }] : []),
        ...(isAdmin(profile) ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
      ],
    },
  ];

  const perfilHref = isAthleteRole(profile) && athlete ? `/atleta/${athlete.id}` : "/perfil";

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <aside
      className={`hidden md:flex sticky top-0 h-screen shrink-0 bg-[var(--color-surface)] flex-col transition-[width] duration-150 ${
        collapsed ? "w-[68px]" : "w-[228px]"
      }`}
    >
      <div className={`flex items-center gap-2 p-3 ${collapsed ? "justify-center" : ""}`}>
        <Image
          src="/apex-logo.svg"
          alt="Ápex"
          width={30}
          height={30}
          unoptimized
          className="rounded-[10px] object-cover shadow-[var(--shadow-organic-sm)] shrink-0"
        />
        {!collapsed && <span className="font-[family-name:var(--font-heading)] text-[18px]">Ápex</span>}
      </div>

      <AthleteSwitcher collapsed={collapsed} />

      <button
        onClick={toggleCollapsed}
        title={collapsed ? "Expandir menú" : "Colapsar menú"}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        className={`flex items-center gap-2 mx-3 mb-2 px-2 py-1.5 rounded-full text-[var(--color-text)]/50 hover:bg-[var(--color-text)]/[0.07] hover:text-[var(--color-text)] ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {collapsed ? (
          <ChevronsRight size={16} strokeWidth={2.75} aria-hidden="true" />
        ) : (
          <>
            <ChevronsLeft size={16} strokeWidth={2.75} aria-hidden="true" />
            <span className="text-xs">Colapsar</span>
          </>
        )}
      </button>

      <nav className="flex-1 overflow-y-auto px-2 space-y-3">
        <Link
          href="/"
          title={collapsed ? "Dashboard" : undefined}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            collapsed ? "justify-center" : ""
          } ${
            isActive("/")
              ? "bg-[var(--color-accent-200)] text-[var(--color-accent-800)] font-semibold"
              : "text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07]"
          }`}
        >
          <LayoutDashboard size={17} strokeWidth={2.75} className="shrink-0" aria-hidden="true" />
          {!collapsed && "Dashboard"}
        </Link>

        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2.5 mb-0.5 text-[10px] tracking-[0.08em] uppercase text-[var(--color-text)]/45">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isActive(item.href)
                        ? "bg-[var(--color-accent-200)] text-[var(--color-accent-800)] font-semibold"
                        : "text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07]"
                    }`}
                  >
                    <Icon size={17} strokeWidth={2.75} className="shrink-0" aria-hidden="true" />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--color-divider)] space-y-0.5">
        <Link
          href={perfilHref}
          title={collapsed ? "Mi perfil" : undefined}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            collapsed ? "justify-center" : ""
          } ${
            isActive(perfilHref)
              ? "bg-[var(--color-accent-200)] text-[var(--color-accent-800)] font-semibold"
              : "text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07]"
          }`}
        >
          <UserCog size={17} strokeWidth={2.75} className="shrink-0" aria-hidden="true" />
          {!collapsed && "Mi perfil"}
        </Link>

        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-full text-sm w-full text-[var(--color-text)]/70 hover:bg-[var(--color-text)]/[0.07] ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={17} strokeWidth={2.75} className="shrink-0" aria-hidden="true" />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verificar visualmente en desktop**

Con el dev server corriendo y viewport de escritorio (≥768px, usar `resize_window` con preset `desktop` en el Browser pane), recorrer:
- El sidebar muestra el selector de atleta arriba, con las 3 secciones agrupadas debajo, y "Mi perfil"/"Cerrar sesión" fijos abajo.
- Cambiar de atleta desde el selector actualiza el nombre en Mesociclo/Evaluación/Check-in/Analítica.
- Colapsar el sidebar (botón "Colapsar") sigue funcionando — el selector de atleta muestra solo el avatar.
- Como rol escalador (sin permisos de coach/admin), "Analítica", "Invitar", "Solicitudes" y "Admin" no aparecen.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "refactor: agrupa el sidebar por tema e integra AthleteSwitcher"
```

---

### Task 7: Componente `MobileTopBar`

**Files:**
- Create: `src/components/MobileTopBar.tsx`

**Interfaces:**
- Consumes: `useRouter()` de `next/navigation`, `createClient()` de `@/lib/supabase/client`.
- Produces: `export function MobileTopBar(): JSX.Element` — sin props. Renderiza `null` en desktop vía clase `md:hidden` (mismo patrón que `MobileNav.tsx`).

- [ ] **Step 1: Crear el componente**

Crear `src/components/MobileTopBar.tsx`:

```typescript
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function MobileTopBar() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-divider)] flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <Image
          src="/apex-logo.svg"
          alt="Ápex"
          width={24}
          height={24}
          unoptimized
          className="rounded-[8px] object-cover shrink-0"
        />
        <span className="font-[family-name:var(--font-heading)] text-[15px]">Ápex</span>
      </div>
      <button
        onClick={handleLogout}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className="text-[var(--color-text)]/60 hover:text-[var(--color-text)] p-1.5"
      >
        <LogOut size={19} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </header>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: sin errores (el archivo aún no se usa — se integra en el Task 8 inmediatamente después).

- [ ] **Step 3: Commit**

```bash
git add src/components/MobileTopBar.tsx
git commit -m "feat: agrega MobileTopBar con acceso fijo a cerrar sesión en mobile"
```

---

### Task 8: Integrar `MobileTopBar` en el layout de la app

**Files:**
- Modify: `src/app/(app)/layout.tsx:1-77`

**Interfaces:**
- Consumes: `MobileTopBar` (Task 7).

- [ ] **Step 1: Importar y renderizar `MobileTopBar`**

En `src/app/(app)/layout.tsx`, agregar el import junto a los demás:

```typescript
import { MobileTopBar } from "@/components/MobileTopBar";
```

Y en la función `Gate`, reemplazar el bloque de retorno final (líneas 67-77):

```typescript
  return (
    <AthleteProvider>
      <MobileTopBar />
      <div className="flex flex-1 min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-x-hidden px-4 md:px-6 pt-16 md:pt-6 pb-24 md:pb-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
      <MobileNav />
    </AthleteProvider>
  );
```

(El cambio clave es `pt-16 md:pt-6` en vez de `py-6` — deja espacio para la nueva barra fija en mobile sin afectar desktop, donde `MobileTopBar` no se renderiza.)

- [ ] **Step 2: Verificar visualmente en mobile**

Con el dev server corriendo, usar `resize_window` con preset `mobile` en el Browser pane y recargar. Confirmar:
- La barra superior con logo y botón de cerrar sesión es visible en cualquier pantalla (ej. Dashboard, Mesociclo, Perfil).
- El contenido no queda tapado detrás de la barra superior ni del bottom nav.
- Tocar el botón de cerrar sesión redirige a `/login`.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/layout.tsx"
git commit -m "feat: integra MobileTopBar en el layout y ajusta el padding superior mobile"
```

---

### Task 9: Pantalla "Progreso" (Evaluación + Check-in combinados)

**Files:**
- Create: `src/app/(app)/progreso/page.tsx`

**Interfaces:**
- Consumes: el `export default` de `src/app/(app)/evaluacion/page.tsx` y de `src/app/(app)/checkin/page.tsx` (ambos ya son componentes React autosuficientes que usan `useAthlete()` internamente — no requieren props), y `Segmented` de `@/components/ui`.
- Produces: `export default function ProgresoPage(): JSX.Element`, ruta `/progreso`.

- [ ] **Step 1: Crear la página combinada**

Crear `src/app/(app)/progreso/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui";
import EvaluationListPage from "../evaluacion/page";
import CheckInPage from "../checkin/page";

type Tab = "evaluacion" | "checkin";

export default function ProgresoPage() {
  const [tab, setTab] = useState<Tab>("checkin");

  return (
    <div>
      <div className="mb-4">
        <Segmented<Tab>
          options={[
            { value: "checkin", label: "Check-in" },
            { value: "evaluacion", label: "Evaluación" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === "checkin" ? <CheckInPage /> : <EvaluationListPage />}
    </div>
  );
}
```

- [ ] **Step 2: Verificar visualmente**

Con el dev server corriendo, navegar a `http://localhost:3000/progreso` (o el puerto que corresponda). Confirmar:
- El tab "Check-in" (por defecto) muestra el contenido real de la página de check-in (métricas, hitos, check-ins).
- Cambiar al tab "Evaluación" muestra el listado real de evaluaciones del atleta activo.
- Los links internos de cada página (ej. "+ Nueva evaluación") siguen funcionando igual que en `/evaluacion` directamente.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/progreso/page.tsx"
git commit -m "feat: agrega pantalla Progreso que combina Evaluación y Check-in con tabs"
```

---

### Task 10: Bottom nav mobile con pestaña "Progreso"

**Files:**
- Modify: `src/components/MobileNav.tsx:12-17`

**Interfaces:**
- Consumes: ruta `/progreso` (Task 9).
- Produces: `export function MobileNav(): JSX.Element` — misma firma pública, sin cambios en `src/app/(app)/layout.tsx`.

- [ ] **Step 1: Reemplazar el item "Check-in" por "Progreso"**

En `src/components/MobileNav.tsx`, reemplazar el import de íconos:

```typescript
import { House, Activity, LineChart, UserCircle } from "lucide-react";
```

Y el array `items` (líneas 12-17):

```typescript
  const items = [
    { href: "/", label: "Hoy", icon: House },
    { href: "/entrenamiento", label: "Entreno", icon: Activity },
    { href: "/progreso", label: "Progreso", icon: LineChart },
    { href: athleteId ? `/atleta/${athleteId}` : "/", label: "Perfil", icon: UserCircle },
  ];
```

(Se usa `LineChart` en vez de `Heart` para reflejar que la pestaña ahora combina check-in + evaluaciones + progreso, no solo el check-in semanal. La ruta `/checkin` sigue existiendo y accesible desde el sidebar de escritorio — este cambio solo afecta el bottom nav mobile.)

- [ ] **Step 2: Verificar visualmente en mobile**

Con el dev server corriendo y viewport mobile, confirmar:
- El bottom nav muestra `Hoy · Entreno · Progreso · Perfil`.
- Tocar "Progreso" navega a `/progreso` y se resalta como activo.
- Estar en `/checkin` o `/evaluacion` (accedidas por otra vía) no rompe el resaltado del resto de los items del bottom nav.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/MobileNav.tsx
git commit -m "feat: reemplaza Check-in por Progreso en el bottom nav mobile"
```

---

## Verificación final end-to-end

Tras completar las 10 tareas, repetir un barrido corto (no exhaustivo — ya se hizo la revisión QA completa antes del rediseño) en desktop y mobile, ambos roles (admin y escalador), confirmando:
- Paleta y tipografía nuevas aplicadas en toda la app (sin residuos de naranja/Caprasimo/Figtree).
- Sidebar agrupado + selector de atleta funcionando en desktop.
- `MobileTopBar` + bottom nav con "Progreso" funcionando en mobile, cerrar sesión accesible en ambos formatos sin más de un tap/click.
- `npm run build` completa sin errores (Run: `npm run build`, Expected: exit code 0).
