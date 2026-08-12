# Rediseño visual "Granito + Salvia" — paleta y tipografía

## Contexto

El sistema de diseño actual de Apex (ver [globals.css](../../../src/app/globals.css) y [ui.tsx](../../../src/components/ui.tsx)) usa una paleta terracota/oliva cálida ("organic") con tipografía Caprasimo (títulos) + Figtree (cuerpo). Tiene identidad propia, pero la paleta y tipografía de base ya no representan la dirección que se busca para la marca.

Se exploraron 4 direcciones visuales dentro del espíritu "cálido y natural (piedra/roca)" mediante un companion visual en el navegador: Piedra caliza, Granito, Arenisca y Basalto. Se aprobó una mezcla de **Granito** (grises piedra fríos, tipografía geométrica bold) con el acento **salvia** de Arenisca, descartando el naranja quemado de la opción Granito original.

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

## Alcance técnico

Este es un cambio de **tokens**, no de estructura ni de layout:

1. **[globals.css](../../../src/app/globals.css)** — reemplazar los valores de `:root` (paleta completa de arriba) y las referencias a `--font-heading`/`--font-body` en el bloque `@theme inline`.
2. **[layout.tsx](../../../src/app/layout.tsx)** — reemplazar la carga de fuentes Caprasimo/Figtree por Archivo Black/Inter vía `next/font/google`.
3. **[ui.tsx](../../../src/components/ui.tsx)** — sin cambios estructurales; los componentes (`Card`, `Button`, `Badge`, `Input`, etc.) heredan los nuevos tokens automáticamente porque referencian `var(--color-*)`.
4. **[Sidebar.tsx](../../../src/components/Sidebar.tsx)** y **[MobileNav.tsx](../../../src/components/MobileNav.tsx)** — revisar si tienen algún color o fuente hardcodeada fuera de los tokens del sistema y migrarla.
5. **Fuera de alcance**: `CATEGORY_COLORS` en [types.ts](../../../src/lib/types.ts) — usa su propia paleta Tailwind (blue/purple/rose/amber/slate/teal) independiente del sistema de marca, no se toca.
6. **Fuera de alcance**: radios de borde, sombras, estructura de componentes, layout de pantallas — no estaban en discusión, se mantienen igual.

## Verificación

Levantar el dev server y revisar visualmente las pantallas clave con la nueva paleta/tipografía aplicada:
- Sidebar / navegación (desktop y `MobileNav` en mobile)
- Dashboard / listados de cards (`Card`, `Badge`, `CategoryTag`)
- Un formulario (`Input`, `Select`, `Button` en sus variantes)

Confirmar legibilidad de texto sobre `--color-bg`/`--color-surface` y contraste suficiente en botones primarios (`accent-500` sobre `--color-bg`).

## No incluido en este rediseño

- Rediseño de layout o de componentes individuales (eso quedó fuera según lo conversado — el pedido fue específicamente cambiar paleta y tipografía, no reestructurar pantallas).
- El branding "Prusik" explorado previamente en `Claude design/` — se descartó explícitamente como base.
