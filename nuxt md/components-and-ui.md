# Components & UI

## Wrapper layer over `@nuxt/ui`

The project wraps Nuxt UI primitives in `app/components/UI/*` and uses those wrappers throughout domain components. Prefer the wrapper if one exists; drop to the raw Nuxt UI component only when no wrapper covers the case.

```vue
<!-- app/components/UI/Button.vue -->
<template>
  <UButton
    :type="type ?? 'button'"
    :variant="isBrand ? 'solid' : (variant ?? 'solid')"
    :ui="ui"
    @click="$emit('click', $event)"
  >
    <slot />
  </UButton>
</template>
```

| Nuxt UI | Wrapper / usage |
|---------|-----------------|
| `UButton` | `UI/Button.vue` (brand variants); also direct in modals |
| `UInput` | `UI/Input.vue` — floating-label pattern via SCSS |
| `USelect`, `UTextarea`, `URadioGroup`, `UCheckbox` | wrapped in `UI/` |
| `UModal` | `ConfirmModal`, `ContentModal`, `PhotoUploadModal`, `ActivityRegistration/Modal` |
| `UStepper` | faculty preferences wizard |
| `UEditor` + `UEditorToolbar` | preferences steps (rich text; toolbar config in `constants/preferences.ts`) |
| `UAccordion`, `UPopover`, `UIcon` | throughout |
| `UApp` | root shell in `app/app.vue` |

Custom (non-Nuxt UI) components: `PrimeToast` (event bus via `useToasty`), `ProgressBarSteps`, `RedirectCountdown`, `UISoftLoginBanner`, `UIExpiredAlert`.

## Component directories (`app/components/`)

| Folder | Purpose |
|--------|---------|
| `UI/` | Shared primitives (wrapped Nuxt UI + toast/loading) |
| `global/` | `TheHeader`, `TheFooter`, `TheSkipLink` (auto-imported globally) |
| `Activity/` | Live event landing page: agenda, faculty, CME, calendar, tabs |
| `ActivityRegistration/` | Multi-step registration modal flow |
| `Certificates/` | Accrediting-body certificate templates (ACCME, ANCC, NABP, …) |
| `Disclosures/` | Faculty financial disclosure form sections |
| `CmeReview/` | CME/CE Review Questionnaire sections (activity info, materials, questions) |
| `FDashboard/` | Faculty portal sidebar, header, forms table, contracts |
| `Preferences/` | Faculty preferences wizard steps |
| `GiftCardClaim/` | Cohort gift-card email flow |
| `PhoneVerification/` | SMS verification gate |
| `SocialSection/` | Social share + add-to-calendar |
| `UserForms/` | Login, registration, evaluation, claim credit, survey |
| `Icons/` | `AnimatedHamburger` |

The root-level `components/` directory is **empty** — all components live under `app/components/`.

## Icons — `@nuxt/icon`

Two sources, both via `<UIcon>` / `<Icon>`:

- **MDI** — loaded from CDN (`@mdi/font`) in `nuxt.config.ts` head; use `i-mdi-*` names (e.g. `<UIcon name="i-mdi-loading" />`).
- **`prime-icon` collection** — custom SVGs in `app/assets/prime-icons/` (`calendar-circle`, `facebook`, `gmail`, `ical`, `linkedin`, `mail`, `outlook`, `x`); use `<Icon name="prime-icon:mail" />`.

```ts
// nuxt.config.ts
icon: {
  customCollections: [{ prefix: 'prime-icon', dir: './app/assets/prime-icons' }],
  clientBundle: { scan: true },
}
```

To add a custom icon: drop `foo.svg` in `app/assets/prime-icons/` and reference `prime-icon:foo`.

## Third-party UI libraries

| Library | Integration | Notes |
|---------|-------------|-------|
| `vue-dompurify-html` | `app/plugins/dompurifyHtml.ts` | `v-dompurify-html` for CMS/rich HTML (disclosures, contracts, certificates). **Always** use this — never `v-html` — for untrusted HTML |
| `vue3-social-sharing` | `app/plugins/socialSharing.client.ts` | `<ShareNetwork>` in `SocialSection/SocialShare.vue` |
| `pdfmake` + `html-to-pdfmake` | `app/composables/usePdfCreator.ts` | client-side PDF export (certificates/disclosures) with Roboto/Allison fonts |
| `maska` | `app/components/UI/InputPhone.vue` | `v-maska` phone masking |
| `@evdy-pro/prime-survey` | `app/plugins/prime-survey.client.ts` | lazy-loaded `EventsAppView`; styles scoped in `@layer prime-survey` |

## Conventions

- Vue 3 `<script setup lang="ts">` with typed `defineProps` / `defineEmits`.
- Prefer `UI/*` wrappers; reach for raw `U*` only when necessary.
- Lazy-load below-the-fold/heavy components with the `Lazy` prefix (`<LazyTheFooter>`).
- Rich/untrusted HTML → `v-dompurify-html` with the `.rich-html-content` class for styling.
- Icons via `<UIcon>`/`<Icon>` — MDI (`i-mdi-*`) or `prime-icon:*`.
