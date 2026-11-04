# Live Activity Landing Page (`/live/:slug`)

The public CME event landing/registration page ("front matter") — the heart of the public domain in [pages-and-domains.md](pages-and-domains.md); see [rendering-and-routing.md](rendering-and-routing.md) for the route table. Note: this is **not** a moderator portal — "moderator" exists in the repo only as a faculty role label (`shared/types/faculty.ts`, rendered as a role chip in `ActivityFacultyCard.vue`).

## Page identity

- **File:** `app/pages/live/[slug].vue` · **URL:** `/cme/live/:slug` (`app.baseURL: '/cme/'`).
- **Rendering:** SSR (SEO-critical) with a `Cache-Control: private, no-store` route rule — registration state must never be edge-cached.
- **Layout:** `layout: false` — composes its own `TheSkipLink` + `TheHeader` + `main#content` + `LazyTheFooter`.
- **Auth:** none — fully public. Optional MH soft-login via `?mh=` query (MagnetMail email/SMS links); `/live` is deliberately absent from `MH_RESTRICTED_ROUTES`. See [auth.md](auth.md).
- **Entry:** external only (marketing email/SMS with `?mh=`, primeinc.org listings, search engines) — no internal link points to `/live/`.
- **Data load:** top-level await in setup — `activityStore.fetchActivity(slug)` → BFF `/api/activity/:slug`, then `syncLiveEventRegistration()`, then a possible ConnectED redirect, then gift-card load.

## Layout & sections

Desktop grid: 100px sticky left sidebar nav | main content (`lg:w-4/6`) | right rail (`lg:w-2/6`). Sidebar anchors (each conditional on content): resources / overview / cme / faculty / agenda / objectives / connected, plus a floating back-to-top button. On mobile the sidebar is hidden and the CTA lives in a fixed bottom drawer (footer gets extra bottom padding so it is never covered — PRIMED-11687).

| Section (`#id`)   | Component                                            | Visitor sees                                                                 |
| ----------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| banner / title    | `LazyActivityHeaderBanner` / `ActivityTitle`         | Hero banner (title/date/format/credits overlay) when a `Heading` file exists; plain `h1` + date otherwise |
| registration      | `ActivityRegistrationDetails`                        | Post-registration confirmation: participation mode, what's next (registered only) |
| intro             | `ActivityInfo`                                       | 640px artwork + marketing copy + credits (unregistered only)                  |
| `#connected`      | `ActivityConnectedExperience`                        | ConnectED companion-app promo/launch (QR / open button), variant-aware        |
| logos / alerts    | `ActivityPartnerLogo`, `ActivityMarketingAlert`, `ActivityMarketingDisclaimer` | Partner/series logos; time-windowed alert banner; boxed disclaimer |
| statements        | `ActivityAccessibilityStatement` (×2)                | Funding disclosure; accessibility statement                                   |
| `#resources`      | `ActivityResources`                                  | Downloadable files accordion                                                  |
| `#overview`       | `ActivityOverview`                                   | Program overview HTML accordion                                               |
| `#faculty`        | `LazyActivityFaculty`                                | Faculty/Disclosure ARIA tabs; cards with SPEAKER / MODERATOR / PANELIST chips |
| `#cme`            | `LazyActivityCME`                                    | Credits per certificate + Joint Accreditation statement                       |
| `#agenda`         | `LazyActivityAgenda`                                 | Agenda HTML accordion                                                         |
| `#objectives`     | `LazyActivityObjectives`                             | Learning objectives accordion                                                 |
| right rail        | `ActivityDetails`                                    | Date/time/timezone, duration, format, venue, price, program code, primary CTA, calendar, ConnectED button, resend email, certificates list |

Accordion behavior: resources/overview/faculty open by default for unregistered visitors; a watch on `activityRegistered` collapses all when registered and expands when not. Sidebar click (`handleSidebarNavigation`) smooth-scrolls, opens the target accordion, updates the `#hash`, and focuses the section (a11y). `Lazy*` sections hydrate on visibility.

## States & flows

- **Unregistered ↔ registered** — `ActivityInfo` swaps for `ActivityRegistrationDetails` (`v-show` on registration state).
- **CTA contract** — `useActivityProgress.registerButtonText` returns `{ text, mobileText, message, icon, disabled, action }` and drives the CTA through the lifecycle: pre-event → live → post-event → expired, plus gift-card claim window. `action ∈ 'join-meeting' | 'claim-credit' | 'claim-gift-card' | …`.
- **CTA click** — `handleOpenModal()` branch order (asserted by source-text tests, do not reorder): soft-login + join-meeting + PRIME BigMarker → `openMeeting()` (PRIMED-11824); other soft-login → registration modal on the login form (PRIMED-11560); logged in → `getUser(false)` refresh; join-meeting + already attended → `openMeeting()`; join-meeting → `openMeeting()` + attendance `POST /event-attended/:pc`; claim actions → GA `COMPLETE_ACTIVITY`; default → confirmation + registration modal.
- **ConnectED event-day redirect** (`useConnectedEventRedirect`, PRIMED-11265) — on-site variant + mobile + event day → 302/`location.replace` to `{connectedHost}/{slug}?mh={muidHash}`; `hideLivePageForConnectedRedirect` suppresses the entire template while deciding (including while `?mh` soft-login resolves client-side).
- **BigMarker join** (`useMeetingJoin` + `bigMarkerService`) — opens a blank tab synchronously (popup blockers), fetches a personalized join URL (`Mh` header for soft-login), falls back to `manualJoinUrl` then `meetingLink` on failure.
- **Gift card** — `giftCardStore.ensureGiftCard(landingPageId)` (de-duped/cached) loads at setup, on mount, and when user identity resolves; a post-window alert shows when the claim window has passed.
- **Registration** — `LazyActivityRegistrationModal` (multi-step login/register/survey/claim) + `LazyActivityRegistrationRecaptchaV2Challenge` fallback when v3 scoring fails.

## Data & state

| Store | File | Role |
| ----- | ---- | ---- |
| `useActivity` | `app/stores/activity/activity.ts` | `fetchActivity(slug)` → BFF; normalizes raw payload; `certificates`, `faculties`, `disclosures`, format/expiry getters; 404 `showError` on failure |
| `useActivityRegistration` | `app/stores/activity/activity-registration.ts` | Modal + flow state: `activityRegistered`, `openRegistrationModal()`, register/cancel/resend actions, reCAPTCHA v2 state |
| `useActivityProgress` | `app/stores/activity/activity-progress.ts` | Event-lifecycle state machine: live/expired flags, gift-card + ConnectED windows, step/widget model, `registerButtonText` |
| `useActivitySurveys` | `app/stores/activity/activity-surveys.ts` | Survey handles/types from the activity payload |
| `useGiftCard` | `app/stores/gift-card.ts` | `ensureGiftCard`, passcode verify/submit, follow-up copy |
| `useUser` | `app/stores/user.ts` | `user`/`mhUser`, `isFullyLoggedIn`, `hasSoftLoginSession`, `getUser()`, `checkMhUser(activityId)` |

| Composable | File | Role |
| ---------- | ---- | ---- |
| `useConnectedEventRedirect` | `app/composables/useConnectedEventRedirect.ts` | Event-day mobile redirect + template suppression |
| `useConnectedUrl` / `useConnectedVariant` | `app/composables/` | ConnectED deep link (`?mh=`) / `marketing`-`on-site`-`virtual` variant |
| `useMeetingJoin` | `app/composables/useMeetingJoin.ts` | `openMeeting()` — BigMarker personalized join or plain `window.open` |
| `useEventAttended` | `app/composables/useEventAttended.ts` | Attendance `POST /event-attended/:pc` |
| `useAnalyticsEvents` | `app/composables/useAnalyticsEvents.ts` | GTM dataLayer dispatch |

- **BFF:** `server/api/activity/[slug].ts` — `GET {VITE_SYNAPSE_PUBLIC}landing-pages/{slug}?type=live` + parallel certificates (`defineCachedFunction`, 1h, production only) + `faculties/{activityId}`; returns `{ activity, certificates, faculties, disclosures }`. See [api-layer.md](api-layer.md).
- **Soft-login re-sync:** the page re-calls `checkMhUser(activityId)` because `app/plugins/02.soft-login.client.ts` restores the MH session without an `activity_id`, so event registration state must be resolved per-activity here.

## SEO & analytics

- `useHead` builds title/description (`stripHtmlToText`), OG/Twitter tags, canonical from `useRequestURL()`, and JSON-LD `schema.org/Event` via `buildEventJsonLd` (`app/utils/eventStructuredData.ts`).
- Two conditional LCP preloads (artwork 640px; banner `MAX_IMAGE_WIDTH` 1600, `min-width: 769px`) — the `getFastlyImageUrl` options must stay byte-identical to the component URLs or the preload is wasted.
- GA: `FRONT_MATTER_VIEWED` on mount; `START_ACTIVITY` / `COMPLETE_ACTIVITY` from the CTA. Events reach GA only if the eventAction matches a GTM lookup-table row.

## Guardrails

- `test/pages/liveSlug.spec.ts` asserts on **source text and statement ordering** (gift-card load, `handleOpenModal` branch order, `footerBottomPadding` values) — reordering or renaming breaks it by design.
- `:CMEAccordionOpen` prop binding must stay camelCase — kebab-case does not bind (eslint-disable comment in the template).
- Sidebar `Overview` and `CME` labels are hardcoded English; the other six items use `$t()`.
