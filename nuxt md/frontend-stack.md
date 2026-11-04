# Frontend Stack

Every major dependency — what it is, how it is used here, and where to look. Versions are from `package.json`.

## Core framework

| Package                | Version | Role                                            | Where                               |
| ---------------------- | ------- | ----------------------------------------------- | ----------------------------------- |
| `nuxt`                 | 4.5.2   | Meta-framework, SSR, Nitro server, file routing | `nuxt.config.ts`, `app/`, `server/` |
| `vue`                  | 3.5.42  | UI library (`<script setup>`)                   | `app/**`                            |
| `vue-router`           | 5.3.0   | Routing (via Nuxt file-based routes)            | `app/pages/`, `app/middleware/`     |
| TypeScript (`vue-tsc`) | strict  | Types; `npm run tslint`                         | `tsconfig.json`, `global.d.ts`      |

`future.compatibilityVersion: 4` opts into Nuxt 4 behavior (notably the `app/` source directory and new data-fetching defaults).

## State & data

| Package                               | Version        | Role                                                           | Where                              |
| ------------------------------------- | -------------- | -------------------------------------------------------------- | ---------------------------------- |
| `pinia` + `@pinia/nuxt`               | 3.0.4 / 0.11.3 | State management (setup stores)                                | `app/stores/`                      |
| `@vueuse/nuxt` + `@vueuse/components` | 14.4.0         | Composition utilities (`useEventListener`, `useStorage`, etc.) | throughout                         |
| `zod`                                 | ^3.23.8        | Form/schema validation (tax & contract forms)                  | `app/composables/use*Form.ts`      |
| `maska`                               | ^3.2.0         | Input masking (phone)                                          | `app/components/UI/InputPhone.vue` |

HTTP uses Nuxt's built-in `$fetch` / `useFetch` (ofetch under the hood) via three composable wrappers — there is **no axios**. See [api-layer.md](api-layer.md).

## UI & styling

| Package                       | Version          | Role                                                                  | Where                                                            |
| ----------------------------- | ---------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `@nuxt/ui`                    | 4.11.0           | Component kit (`UButton`, `UModal`, `UInput`, `UStepper`, `UEditor`…) | `app/components/UI/`, `nuxt.config.ts` `ui`                      |
| `@tailwindcss/vite`           | (Tailwind v4)    | Utility CSS engine (no prefix)                                        | `app/assets/style/tailwind.css`, `nuxt.config.ts` `vite.plugins` |
| `sass-embedded`               | 1.103.1          | SCSS compilation                                                      | `app/assets/style/*.scss`                                        |
| `@nuxt/icon`                  | 2.5.1            | Icons: MDI (CDN) + custom `prime-icon` collection                     | `app/assets/prime-icons/`                                        |
| `@nuxt/image`                 | 2.1.0            | Responsive images (`<NuxtImg>`)                                       | components                                                       |
| `vue-dompurify-html`          | 5.3.0            | Safe HTML rendering (`v-dompurify-html`)                              | `app/plugins/dompurifyHtml.ts`                                   |
| `vue3-social-sharing`         | 1.4.1            | Social share buttons (`<ShareNetwork>`)                               | `app/plugins/socialSharing.client.ts`                            |
| `pdfmake` + `html-to-pdfmake` | 0.3.11 / ^2.5.32 | Client-side PDF export (certificates, disclosures)                    | `app/composables/usePdfCreator.ts`                               |

Color mode (dark mode) and Nuxt UI fonts are disabled (`ui: { colorMode: false, fonts: false }`). See [styling.md](styling.md) and [components-and-ui.md](components-and-ui.md).

## Content, SEO & i18n

| Package         | Version | Role                                                   |
| --------------- | ------- | ------------------------------------------------------ |
| `@nuxtjs/i18n`  | 10.2.3  | Localization — `en` (default) + `es` (`i18n/locales/`) |
| `@nuxtjs/seo`   | 5.3.14  | SEO meta, sitemap, robots, OG images                   |
| `@nuxt/scripts` | 0.13.2  | Third-party script loading (GTM)                       |

`robots: { robotsTxt: false }`; `noindex` is applied per-route via `X-Robots-Tag` headers in `routeRules`.

## Analytics & monitoring

| Package / Script           | Role                                                               | Where                                                |
| -------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| `@datadog/browser-rum` 6.x | Client RUM + session replay (`mask-user-input`)                    | `app/plugins/datadog.client.ts` (ignored on `local`) |
| `dd-trace` 5.124.0         | Server APM dependency (present, not yet imported in app source)    | —                                                    |
| Google Tag Manager         | Injected in `nuxt.config.ts` head; events via `useAnalyticsEvents` | `app/composables/useAnalyticsEvents.ts`              |
| VWO                        | A/B testing snippet in `nuxt.config.ts` head                       | `NUXT_PUBLIC_VWO_ACCOUNT_ID`                         |
| `vue-recaptcha-v3` 2.0.1   | reCAPTCHA v3 tokens                                                | `app/plugins/recaptcha.ts`, `useRecaptcha`           |

## Survey (private package)

| Package                  | Version | Role                                           | Where                                |
| ------------------------ | ------- | ---------------------------------------------- | ------------------------------------ |
| `@evdy-pro/prime-survey` | 0.0.473 | Survey renderer (`EventsAppView`), lazy-loaded | `app/plugins/prime-survey.client.ts` |

Installed from GitHub Packages — requires `GITHUB_TOKEN` in `.npmrc`. Styles are scoped into `@layer prime-survey`. Local `.tgz` install via `npm run install:local-prime-package`.

## Tooling

| Package                           | Version        | Role                                                       |
| --------------------------------- | -------------- | ---------------------------------------------------------- |
| `@nuxt/eslint`                    | 1.17.0         | ESLint flat config base                                    |
| `prettier` (+ eslint plugin)      | ^3.5.3         | Formatting (single quotes, no semi, `printWidth: 100`)     |
| `vitest` + `@nuxt/test-utils`     | 4.1.11 / 4.2.0 | Unit/component tests (Nuxt env + happy-dom)                |
| `@vue/test-utils`                 | 2.5.0          | Component mounting                                         |
| `storybook` + `@storybook/vue3-vite` | 9.1.x      | Component docs, standalone (no Nuxt)                       |
| `lint-staged`                     | 16.2.7         | Staged-file lint/format on `pre-commit`                    |
| `husky`                           | ^9.1.7         | Git hooks: `pre-commit` (lint-staged), `pre-push` (tslint) |

See [build-and-tooling.md](build-and-tooling.md) and [testing.md](testing.md).
