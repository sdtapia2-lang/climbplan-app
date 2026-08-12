# Rediseño visual "Granito + Salvia" — paleta, tipografía, layout y navegación

## Contexto

El sistema de diseño actual de Apex (ver [globals.css](../../../src/app/globals.css) y [ui.tsx](../../../src/components/ui.tsx)) usa una paleta terracota/oliva cálida ("organic") con tipografía Caprasimo (títulos) + Figtree (cuerpo). Tiene identidad propia, pero la paleta y tipografía de base ya no representan la dirección que se busca para la marca.

Se exploraron 4 direcciones visuales dentro del espíritu "cálido y natural (piedra/roca)" mediante un companion visual en el navegador: Piedra caliza, Granito, Arenisca y Basalto. Se aprobó una mezcla de **Granito** (grises piedra fríos, tipografía geométrica bold) con el acento **salvia** de Arenisca, descartando el naranja quemado de la opción Granito original.

Tras validar que la app funciona correctamente de punta a punta (ver [QA report](#anexo--resultado-de-la-revisión-qa-previa) al final de este documento), se amplió el alcance para incluir también el rediseño de layout y navegación, y un pase de pulido visual general.

## Objetivo

Reemplazar los tokens de color y tipografía del sistema de diseño existente, sin cambiar la estructura de componentes, el radio de bordes ni las sombras (`--shadow-organic-*`), que se mantienen.

## Paleta — "Granito + Salvia"

```css
--color-bg:      #f1efe9;
--color-surface: #e4e1d9;
--color-text:    #2a2825;
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
--color-accent-500: #7d9169; /* primario — salvia */
--color-accent-600: #647550;
--color-accent-700: #5c6e4a;
--color-accent-800: #414f34;
--color-accent-900: #2b3423;

--color-accent-2-100: #f5efe8;
--color-accent-2-200: #e9dccb;
--color-accent-2-300: #d6bfa0;
--color-accent-2-400: #bd9a72;
--color-accent-2-500: #a17c54; /* secundario — arcilla mate */
--color-accent-2-600: #816140;
--color-accent-2-700: #614933;
--color-accent-2-800: #443323;
--color-accent-2-900: #2c2116;
```

`--color-accent` (salvia) reemplaza al naranja como color principal de acción (botones primarios, foco, progreso). `--color-accent-2` deja de ser oliva y pasa a ser una arcilla apagada — mantiene la función de "segundo color" para tags/badges sin reintroducir el naranja descartado.

Los `--shadow-organic-sm/md/lg` no cambian de valor (dependen de `#2e2b25`, que se puede recalcular con el nuevo `--color-neutral-900` `#2e2c27` — prácticamente idéntico, sin impacto visual perceptible).

## Tipografía

- **Títulos** (`--font-heading`): `Archivo Black` — geométrica, bold, carácter deportivo. Reemplaza a Caprasimo.
- **Cuerpo** (`--font-body` / `--font-sans`): `Inter` — sans humanista, alta legibilidad en datos y tablas. Reemplaza a Figtree.
- Cargar ambas vía `next/font/google` en [layout.tsx](../../../src/app/layout.tsx), reemplazando la carga actual de Caprasimo/Figtree.

## Alcance técnico — paleta y tipografía

Cambio de **tokens**, no de estructura:

1. **[globals.css](../../../src/app/globals.css)** — reemplazar los valores de `:root` (paleta completa de arriba) y las referencias a `--font-heading`/`--font-body` en el bloque `@theme inline`.
2. **[layout.tsx](../../../src/app/layout.tsx)** — reemplazar la carga de fuentes Caprasimo/Figtree por Archivo Black/Inter vía `next/font/google`.
3. **[ui.tsx](../../../src/components/ui.tsx)** — sin cambios estructurales; los componentes (`Card`, `Button`, `Badge`, `Input`, etc.) heredan los nuevos tokens automáticamente porque referencian `var(--color-*)`.
4. **Fuera de alcance**: `CATEGORY_COLORS` en [types.ts](../../../src/lib/types.ts) — usa su propia paleta Tailwind (blue/purple/rose/amber/slate/teal) independiente del sistema de marca, no se toca.
5. **Fuera de alcance**: radios de borde, sombras (`--shadow-organic-*`) — no estaban en discusión, se mantienen igual.

## Rediseño de layout y navegación

### Sidebar agrupado (desktop)

Reemplaza la lista plana de 12 links en [Sidebar.tsx](../../../src/components/Sidebar.tsx) por 3 secciones con encabezado:
- **Planificación**: Mesociclo, Planes, Catálogo
- **Seguimiento**: Evaluación, Check-in, Analítica
- **Personas**: Entrenadores, Solicitudes, Admin (Admin solo visible para rol admin, como ya ocurre hoy)

`Mi perfil` y `Cerrar sesión` quedan fuera de los grupos, fijos en la parte inferior del sidebar — visibles siempre, sin scroll, en cualquier pantalla.

### Selector de atleta persistente

Nuevo componente `AthleteSwitcher`, ubicado arriba del sidebar agrupado: avatar + nombre del atleta activo + control para desplegar el roster y cambiar. Se apoya en el contexto ya existente de `AthleteProvider.tsx` — no requiere nuevo estado global. Resuelve la ambigüedad actual de no saber sobre qué atleta está parada la vista en Mesociclo/Evaluación/Check-in/Analítica.

### Bottom nav móvil (atleta)

[MobileNav.tsx](../../../src/components/MobileNav.tsx) pasa de `Hoy · Entreno · Check-in · Perfil` a `Hoy · Entreno · Progreso · Perfil`, donde **Progreso** unifica Evaluación + Check-in + hitos en una sola pantalla con tabs internos (nueva ruta o vista compuesta; a definir en el plan de implementación).

**Cerrar sesión en mobile**: se agrega como ícono persistente en una barra superior fija, visible en cualquier pantalla del rol atleta — no queda enterrado dentro de Perfil. Debe estar accesible del mismo modo en desktop (ya lo está, fijo abajo del sidebar) y en mobile (barra superior fija).

### Polish general

Transversal, no son pantallas nuevas:
- Normalizar la escala de espaciado en [ui.tsx](../../../src/components/ui.tsx) — hoy hay paddings arbitrarios (`p-[13px]`, `p-[17.6px]`) que se pasan a la escala estándar de Tailwind (múltiplos de 4/8px).
- Unificar tamaños de `h1`/`h2` entre pantallas — actualmente varían archivo a archivo sin una escala consistente.

### Fuera de alcance (layout)

- Reestructurar el panel de Admin en sí, o el flujo funcional de Mesociclo/Evaluación.
- Agregar funcionalidad nueva más allá de lo descripto (el objetivo es reorganizar y pulir, no sumar features).

## Verificación

Levantar el dev server y revisar visualmente:
- Sidebar agrupado + `AthleteSwitcher`, cambiando de atleta y confirmando que Mesociclo/Evaluación/Check-in/Analítica reflejan el cambio.
- Bottom nav mobile con la pestaña "Progreso" y el ícono de cerrar sesión accesible en cualquier pantalla.
- Dashboard / listados de cards (`Card`, `Badge`, `CategoryTag`) y un formulario (`Input`, `Select`, `Button`) con la nueva paleta/tipografía y el espaciado normalizado.

Confirmar legibilidad de texto sobre `--color-bg`/`--color-surface` y contraste suficiente en botones primarios (`accent-500` sobre `--color-bg`).

## No incluido en este rediseño

- El branding "Prusik" explorado previamente en `Claude design/` — se descartó explícitamente como base.
- Nueva funcionalidad de producto (el alcance es visual/estructural, no features nuevas).

## Anexo — resultado de la revisión QA previa

Antes de este rediseño se hizo una revisión funcional de punta a punta en producción (`https://climbplan-app.vercel.app`), como admin (`test-admin@example.com`) y como escalador (`test-apex@example.com`), cubriendo los 16 módulos de la app. Resultado: **sin bugs funcionales**. Único hallazgo — una request que responde 404 en la consola en cada carga de página (recurso no identificado, no bloqueante) — pendiente de que alguien con acceso a DevTools lo aísle en algún momento, sin urgencia.
