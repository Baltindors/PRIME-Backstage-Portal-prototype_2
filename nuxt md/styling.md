# Styling

## Tailwind CSS v4 (no prefix) + `@nuxt/ui`

Styling is **Tailwind v4** via `@tailwindcss/vite` (wired in `nuxt.config.ts` `vite.plugins`), with `@nuxt/ui` layered on top. There is **no Tailwind prefix** — use plain utilities (`flex`, `text-primary`, `gap-4`).

Global CSS entry (`nuxt.config.ts`): `css: ['~/assets/style/tailwind.css', '~/assets/style/main.scss']`.

```css
/* app/assets/style/tailwind.css */
@layer prime-survey;      /* isolates @evdy-pro/prime-survey styles */
@import "tailwindcss";
@import "@nuxt/ui";
@source "../../../content/**/*";   /* extra class scanning */

@theme static { /* design tokens (see below) */ }
```

## Design tokens (`@theme static`)

Defined in `app/assets/style/tailwind.css`. Consume as Tailwind color/font/breakpoint utilities.

| Group | Tokens |
|-------|--------|
| Fonts | `--font-sans` = IBM Plex Sans, `--font-serif` = Roboto |
| Brand | `--color-primary` `#1867c0`, `--color-brand-primary` `#065284`, `--color-brand-primary-light`, `--color-brand-secondary` `#265c20` (CTA green), `--color-brand-secondary-dark` |
| Text/UI | `--color-black-text`, `--color-blue-text`, `--color-blue-menu`, `--color-field-label` `#62748E`, `--color-field-text`, `--color-error` `#FB2C36`, `--color-border-divider` |
| Faculty Dashboard | full palettes `--color-fd-blue-*`, `--color-fd-green-*`, `--color-fd-yellow-*`, plus status/neutral/slate tokens |
| Breakpoints | `sm: 601px`, `md: 769px`, `lg: 1025px`, `xl: 1200px`, `2xl: 1920px` |

## Nuxt UI theming

There is **no `app.config.ts`**. Nuxt UI is themed via CSS variables, not a config object:

- `:root { --ui-primary: var(--color-primary) }` — Nuxt UI primary = `#1867c0` site-wide.
- `.fd-layout` overrides `--color-primary` / `--ui-primary` to `--color-fd-blue-500` for the faculty portal.
- `body:has(.fd-layout)` re-applies the override so **portal-teleported** content (`UModal`, `UPopover`, `USelectMenu`, etc., rendered in `<body>`) still gets the faculty blue.

In `nuxt.config.ts`: `ui: { colorMode: false, fonts: false }` — **no dark mode**, and Nuxt UI's own font loading is disabled (the app loads Google Fonts itself). Per-component overrides use the `:ui` prop.

## Fonts

Loaded from Google Fonts in `nuxt.config.ts` head:

- **IBM Plex Sans** — body / default sans (`--font-sans`).
- **Roboto Flex** — headings (`h1`–`h6`, `.h1`–`.h6`, faculty headings).
- **Allison** — faculty countersignature script (CME Review / Planning Survey).
- **Roboto** — `@evdy-pro/prime-survey`.

These are plain `rel: 'stylesheet'` links. Do not use `media: 'print'` + string `onload` — Unhead 3 keeps that media and never activates the sheet for screen.

## SCSS

Vite injects shared variables into **every** SCSS block:

```ts
// nuxt.config.ts
css: { preprocessorOptions: { scss: { additionalData: '@use "@/assets/style/_variables.scss" as *;' } } }
```

So `$primary`, `$cta-green`, `$fd-blue-*`, `$zoom-multiplier`, etc. are available in any `<style lang="scss">` without importing.

| File | Purpose |
|------|---------|
| `_variables.scss` | SCSS tokens mirroring Tailwind (`$primary #065284`, `$cta-green #265c20`, `$fd-*` palettes) |
| `main.scss` | Global typography, `.container`, `.skip-link`, `.rich-html-content`, modal scroll-lock |
| `_fd-design-system.scss` | Faculty design system: `.fd-page-heading`, `.fd-heading-lg/md`, `.fd-label`, `.fd-status-*`, `.fd-card-*` |
| `_transitions.scss` | Vue transition classes (`.dropdown-*`, `.tooltip-*`, `.slide-fade-*`) |

## MDI icons

Material Design Icons load from the jsDelivr CDN as a normal stylesheet in `app.head`. Use them through Nuxt UI: `<UIcon name="i-mdi-loading" />`. See [components-and-ui.md](components-and-ui.md) for the `prime-icon` custom collection.

## Conventions

- **Layout/spacing/color** → Tailwind utilities (no prefix).
- **Interactive components** → `@nuxt/ui` via `UI/*` wrappers.
- **Faculty portal** → wrap the page/layout in `.fd-layout` to get the blue primary; use `.fd-*` design-system classes for headings/labels/status.
- **Rich/untrusted HTML** → `.rich-html-content` + `v-dompurify-html`.
- **Typography** → global `body`/heading styles from `main.scss`; use `--font-serif`/Roboto Flex for headings.
- **Component SCSS is rare** — most styling is utility classes; use SCSS only for the faculty design system, floating-label inputs, or transitions.
- **Breakpoints** are custom (`sm:601px` … `2xl:1920px`) — use the Tailwind `sm:`/`md:`/`lg:` prefixes which map to these.
