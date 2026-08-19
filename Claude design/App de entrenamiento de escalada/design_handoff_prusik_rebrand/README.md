# Handoff: Prusik — rebrand & visual design for the climbing-training app

## Overview
This is a rebrand and visual redesign of the existing **ClimbPlan** app (Next.js + Supabase, repo `climbplan-app`) under a new brand name, **Prusik**. No new features or routes are introduced — every screen designed here maps to a route that already exists in the codebase (`/`, `/mesociclo`, `/catalogo`, `/evaluacion`, `/analitica`, `/atleta/[id]`, `/plantillas`, `/formularios`, `/admin`, `/entrenamiento`, `/checkin`). The job is a **reskin**: new brand identity, new logo, new color/type system, refined layout and density on top of the app's existing data model and component library (`src/components/ui.tsx`).

## About the Design Files
The files in `reference/` are **design references built as an HTML prototype** (a component-runtime format, not production code) — they show intended look, layout, copy and states. They are not meant to be copied verbatim into the Next.js app. **Recreate these designs inside the existing Next.js/React/Tailwind codebase**, using its established patterns:
- Reuse and restyle the existing primitives in `src/components/ui.tsx` (`Card`, `Input`, `Select`, `Button`, `Badge`, `Spinner`, `EmptyState`, `Modal`, `Field`) rather than introducing a parallel component system.
- Keep the existing Supabase data flow, route structure, and role-gating (`RequireRole`, `useProfile`, `useAthlete`) exactly as-is — only the visual layer changes.
- `reference/Prusik - Brand & Product Design.dc.html` and `reference/DesktopNav.dc.html` are viewable in a browser (they pull in a small runtime, `support.js`, referenced relatively — if that file isn't present they will only partially render; treat the file as source-to-read, not something to deploy). Open them to see the intended visuals, or read the markup directly — every screen's exact structure, classes and copy live in that file.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, and copy are final-intent. Recreate pixel-for-pixel where the current codebase's stack (Tailwind + the `ui.tsx` primitives) allows; use the Design Tokens section below as the exact source of truth for values.

## Brand
- **Name:** Prusik — named for the prusik knot, a friction hitch climbers tie onto a fixed rope to ascend it safely. The concept: the app is the "knot" that keeps a climber attached to steady progress, session after session.
- **Logomark:** a photo of an actual red paracord prusik knot tied around a grey/white kernmantle rope, center-cropped to a square. The knot's silhouette (coil wraps + a loop swinging to the lower right) doubles as an abstracted "K". File: `reference/prusik-logo.png` (193×193px source — replace with a proper high-res / vector lockup before shipping; this is a placeholder photograph, not final production art).
  - Used at 88×88px (hero contexts) and 30×30px (nav bar), both `border-radius: 26px` / `10px` respectively (roughly a 30%-of-width radius — a squircle, not a full circle), `object-fit: cover`, drop shadow `--shadow-sm`.
- **Tagline:** "Tu cordada perfecta para progresar."
- **Tone:** Direct and technical, but warm — like a climbing partner ("cordada" = the rope team) who happens to keep the training log. No gamification, no artificial urgency, no streak-shaming.

## Design Tokens
All values below come from the Organic design system tokens (`reference/organic-tokens.css`). Port these into the app's Tailwind theme / CSS variables.

### Color
- `--color-bg`: `#f5ead8` (page background — warm cream)
- `--color-surface`: `#ebddc5` (card/panel background)
- `--color-text`: `#201e1d`
- `--color-divider`: `#201e1d` at 16% opacity
- **Accent (primary, terracotta)** ramp 100→900: `#fff2eb, #ffe1d0, #ffc6a5, #f6a06b, #d67f48, #b2622d, #8c491a, #643312, #402310`. Base/500 is the primary action color; 700 (`#8c491a`) is used for accent-colored body text (meets contrast on the cream ground); 200 is used for tinted fills.
- **Accent-2 (secondary, sage)** ramp 100→900: `#f0fae1, #e1eecc, #ccdbb2, #aebf92, #8fa073, #728157, #56633f, #3d472b, #272e1b`. Used as a genuine second voice (phase tags, secondary tags) — not just a highlight.
- **Neutral** ramp 100→900: `#f9f4ed, #eee7db, #dcd3c4, #c0b6a5, #a19786, #82796a, #645c50, #474238, #2e2b25`. Neutral-900 is used as the dark logo-badge background.
- Shadows: `--shadow-sm: 0 1px 2px rgba(46,43,37,.14)`, `--shadow-md: 0 3px 10px rgba(46,43,37,.16)`, `--shadow-lg: 0 12px 32px rgba(46,43,37,.22)`.

### Type
- Headings: **Caprasimo** (display serif-slab, weight 400 only), loaded from Google Fonts. h1 42px / h2 32px / h3 25px / h4 20px, line-height 1.12, letter-spacing -0.015em.
- Body: **Figtree**, weights 400/600/700. Base body 15px / line-height 1.55.
- Buttons and card titles also use Caprasimo (see Components below) — the display face appears in more places than just headings.

### Spacing & radius
- Spacing scale: 4.4 / 8.8 / 13.2 / 17.6 / 26.4 / 35.2px (a 1.10× density multiple of a 4px base).
- Radius: `--radius-sm` 8px, `--radius-md` 16px (buttons/inputs round further to a 999px pill in the final layer), `--radius-lg` 28px → cards/dialogs actually render at `28 × 1.15 ≈ 32px`.
- Icons: Lucide, stroke-width 2.75 (rounder/heavier than default 2).

## Components (map to `ui.tsx`)
- **Button** — pill-shaped (999px radius), Caprasimo 13px label. `primary`: solid accent-500 fill, cream text, hover→accent-600, active→accent-700. `secondary`: transparent bg, 1px divider border, hover→7% ink tint. `ghost`: no border, accent-colored text. Icon-only variant is 34×34px.
- **Input / Select / Textarea** — pill radius, `--color-surface` fill, 1px divider border, focus border → accent, min-height 36px (30px in the dense mobile "log your set" row).
- **Card** — `--color-surface` fill, ~32px radius, `--space-3` (13px) padding, `--shadow-sm` elevation on most instances. Sub-parts: `.card-kicker` (10px uppercase accent label), `.card-title` (17px Caprasimo), `.card-body` (13px, 80% opacity), `.card-meta` (11px, 50% ink).
- **Tag/Badge** — pill, 11px label. `accent` = accent-100 bg / accent-800 text, `accent-2` = sage equivalent, `neutral` = neutral-100/800, `outline` = 1px accent border + accent text (used for "Borrador"/draft state).
- **Table** — plain rows, uppercase 11px header, hairline dividers, row hover = 4% ink tint. Used for the Tindeq strength-test protocol on the Evaluación screen.
- **Segmented control** (`.seg`) — pill-container of radio options; the active option gets a solid accent fill. Used for the Evaluación tab switcher (General / Salud / Movilidad / Fuerza-Dedos / Resistencia / Nivel).
- **Nav bar** — `--color-surface` background, logo + wordmark left, pill-style tab links center (active tab = accent-200 bg + accent-800 bold text), role label + avatar chip right (avatar = accent-300 circle with initial in accent-800).

## Screens
All screens share the desktop nav bar described above (tabs: Dashboard, Mesociclo, Planes, Formularios, Catálogo, Evaluación, Analítica, Perfil, Admin) and, on mobile, a 4-item bottom tab bar (Hoy / Entreno / Check-in / Perfil) using Lucide house/activity/heart/user-circle icons.

### 1. Dashboard (`/`)
Admin/coach landing view. `h1` "Panel general" + subtext "Vista de administrador — todos los atletas". A 2-column grid of athlete summary cards (avatar-initial circle, name, current week + mesocycle name, status tag, phase tag, an adherence progress bar + %, "Ver mesociclo →" link). Below, a 3-column stat row (evaluations logged / check-ins this week / average adherence), each centered, big Caprasimo number in accent-700 over a small caption.

### 2. Mesociclo — week view (`/mesociclo`)
`h1` block name + week number, phase + status tags, and two actions top-right ("Copiar semana →" secondary, "Guardar todo" primary). Below: a 7-column grid (one per weekday), each a rounded surface panel containing the day name, a "Descanso" neutral tag on rest days, or a focus caption + stacked exercise-block chips (title + meta line) on training days.

### 3. Catálogo de ejercicios (`/catalogo`)
`h1` + "+ Nuevo" primary button top-right. A filter row: search input (flex-grow) + two selects (category, equipment). A 3-column card grid; each card has exercise name, an optional "Test" accent tag for benchmark exercises, a category neutral tag, a one-line description, and equipment tags (accent-2).

### 4. Evaluación — Fuerza/Dedos (`/evaluacion`)
`h1` "Evaluación — {athlete}" + date. A 6-option segmented control (General/Salud/Movilidad/Fuerza-Dedos/Resistencia/Nivel) with Fuerza-Dedos active. Two summary tags for L/R asymmetry callouts. A data table of the Tindeq Progressor protocol (MVC kg & %BW, Critical Force reps, mean CF force, CF drop %, RFD at 100/150/200/250ms), one row per metric, left/right columns.

### 5. Analítica (`/analitica`)
`h1` + athlete name. A 3-stat row (adherence %, average RPE, blocks completed) matching the Dashboard's stat-card style. Below, a labeled bar chart ("Adherencia semanal") — 6 vertical bars (one per week), accent-500 fill, week label beneath each.

### 6. Perfil del atleta (`/atleta/[id]`)
`h1` "Perfil de {athlete}". A single column of cards: basic data (age/height/weight/wingspan in a 4-col grid), grades (indoor/outdoor boulder & sport, 2-col grid), goals (free text), available equipment (tag list), health status (a header row with an inline "Sin lesión activa" tag + a free-text rule, e.g. finger-load progression cap).

### 7. Planes — plantillas de mesociclo (`/plantillas`)
`h1` "Planes por defecto" + "+ Nueva plantilla" (admin only). Explanatory subtext. A 2-column card grid: template name, optional "Borrador" outline tag for unpublished templates, phase accent tag, description, and two actions ("Aplicar a {athlete}" primary, "Editar" secondary, admin only). Applying opens a dialog (see Interactions) asking for a start date.

### 8. Formularios — plantillas de formulario (`/formularios`)
`h1` + "+ Nueva plantilla" (admin/coach only). Explanatory subtext noting the default Evaluación/Check-in forms (with the Tindeq protocol, PAR-Q, etc.) always remain available — these are additional templates for specific cases. 2-column card grid: name, type tag (Evaluación/Check-in, accent-2), description, "Usar" + "Editar" (editable only by admin or the coach who created it) actions.

### 9. Admin — usuarios y roles (`/admin`, admin-only route)
`h1` "Administración". Three stacked cards:
  - **Usuarios y roles**: one row per profile — name/email, a role select, and (only when role = Escalador) an athlete-link select, an athlete-name tag, and a "Restringido" checkbox (restricted climbers only see their coach's assigned content, cannot touch the exercise catalog).
  - **Atletas**: a tag list of existing athletes + an inline "create athlete" input/button.
  - **Asignaciones entrenador → escalador**: list of coach→athlete pairs, each with a "Quitar" ghost button, plus two selects + a button to add a new assignment.

### 10. Mobile — Hoy (`/`, phone) — admin/coach view
Greeting ("Hola, {athlete}") + current block/week caption. Three stacked cards: today's session (day + block-count tag, focus title, full-width primary "Empezar entrenamiento" button), a streak card (big % + "adherencia — N semanas seguidas"), and a tinted (accent-100) pending-check-in card with a secondary full-width CTA.

### 11. Mobile — Entrenamiento (`/entrenamiento`, phone)
Day header (weekday + "Hoy" tag) + session focus. Stacked exercise-block cards: name/meta on the left, a "Marcar hecho"/"✓ Hecho" button on the right (primary once logged), an optional pain-flag warning line (accent-700 text, ⚠ prefix) when the athlete reported pain on that movement, and a 4-column mini input row (Series / Reps / Carga / RPE) sized for one-handed thumb entry at the wall (30px min-height, 11px labels).

### 12. Mobile — Check-in semanal (`/checkin`, phone)
Date header. Three labeled progress bars (sleep quality, motivation, plan adherence — value/max + accent-filled bar). A 2×2 grid of per-zone pain ratings (0–10; a value ≥3 escalates the tag from neutral to accent, flagging it for coach attention). A comment textarea ("¿Algo para contarle a tu entrenador?"). Full-width primary "Guardar check-in".

### 13. Mobile — Hoy, restricted Escalador view (comparison view, phone)
Same shell as screen 10, simplified for the "restricted" climber role set in Admin: shows who their coach is ("Entrenás con {coach}") and a neutral "Acceso restringido — solo tu plan" tag instead of dashboard-style stats. No adherence-streak card — just today's session CTA and the pending check-in prompt. This is the reference point for how the restricted role should visually differ from the admin/coach's fuller Hoy screen; the interior Entrenamiento/Check-in screens are otherwise identical between roles (a restricted climber does not see the exercise catalog or other athletes anywhere in the flow).

## Interactions & Behavior (carried over from the existing app — unchanged by the rebrand)
- **Planes → Aplicar**: clicking "Aplicar a {athlete}" opens a modal dialog with a start-date field; confirming calls the existing `apply_mesocycle_template` RPC and redirects to `/mesociclo/{new_id}` (admin/coach) or `/mesociclo` (climber).
- **Admin role select**: changing a profile's role or athlete link persists immediately (no separate save step) via `supabase.from("profiles").update(...)`.
- **Entrenamiento "Marcar hecho"**: toggles a block's completed state; button becomes primary/filled once done.
- **Check-in pain zones**: a rating ≥3 visually escalates from a neutral tag to the accent (warning) tag — carry this threshold-based color rule over.
- **Restricted climbers**: hide catalog-editing, other-athlete data, and admin/coach-only nav tabs (Admin, and edit actions on Planes/Formularios) entirely — this is a role gate already implemented via `RequireRole`/`isAdmin` in the codebase, not new logic to build.
- No new loading/error/empty states are specified beyond what `Spinner` / `EmptyState` already provide in `ui.tsx` — reuse those.

## Assets
- `reference/prusik-logo.png` — the logomark photograph (see Brand section). Needs a final production pass (vector or higher-res crop) before shipping; treat as a stand-in for the real asset.
- No other custom imagery is used; all other visuals are typographic, color, and card/layout composition.

## Files in this bundle
- `reference/Prusik - Brand & Product Design.dc.html` — the full set of screen mockups (desktop + mobile), with exact copy, layout and states, plus the sample data used to populate them.
- `reference/DesktopNav.dc.html` — the nav-bar component in isolation.
- `reference/organic-tokens.css` — the complete token sheet (colors, ramps, type, spacing, radius, shadows, and the exact CSS for every component class: `.btn`, `.card`, `.tag`, `.input`, `.table`, `.seg`, `.dialog`, `.nav`, etc). This is the most direct source of truth for porting values into Tailwind config / CSS variables.
- `reference/prusik-logo.png` — logo source image.
