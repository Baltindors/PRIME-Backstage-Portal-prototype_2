# PRIME Backstage Portal — Project Context

Living map for this prototype. Agents: read Invariants and Index, then only the section for the files you will change. Update that section after an architectural change, a new page, or a store behavior change. Leave validation and persistence algorithms in the store files.

`nuxt md/` documents prime-synapse-site, a different app. Ignore it here.

## Invariants

- Nuxt 3, `ssr: false`, strict TypeScript, Vue 3 `<script setup>`, Pinia, Tailwind. Static site via `npm run generate` → `.output/public`.
- No server and no API client. Pages read and update Pinia. Mock data stays in stores.
- Entry order is mode → paired device → activity code → role → portal. See Routes.
- Accepted activity code: `123LV26`. Staff code: `4747`, required for AV Tech and Program Manager (also to leave the check-in kiosk).
- Role ids, tab ids, labels, and default tabs live in `stores/session.ts`. The portal shell does not apply `TabView` `split` or `aside` layouts.
- AV Tech, Moderator, and Faculty share one stage clock. Switching among those three keeps the running time, pause state, and live flag. A fresh AV Tech or Moderator login starts at 44:39. A fresh Faculty login starts at 20:00. Program Manager starts at 5:00. Only AV Tech’s Master Stage Timers tab changes that clock.
- Polls, audience Q&A, and category clues are still local arrays inside their views. Move them into Pinia when those tools grow.

## Index

| Change this | Read |
| --- | --- |
| Routes, layouts, middleware, pairing | Routes |
| Roles, tabs, timer, portal shell | Roles and tabs |
| Any `stores/*.ts` or a tool that reads one | Stores |
| A mode-specific behavior that is not built yet | Not built |
| Generate, base URL, GitHub Pages | Deploy |
| Where to put a file | Code map |

## Routes

`middleware/session.global.ts` redirects until mode, activity code, and role exist. `/pair`, `/admin`, and `/walk-in` sit outside that chain.

| Path | Page | Layout | Gate |
| --- | --- | --- | --- |
| `/` | `pages/index.vue` | default | Four event-mode cards. Choosing one calls `setEventMode`. |
| `/pair` | `pages/pair.vue` | default | `?token=` pairs this browser, then opens `/join` when the token is valid. Invalid token stays here with the reason. |
| `/join` | `pages/join.vue` | default | Needs a mode. Activity-code form only after this browser holds a valid device token. Otherwise scan, simulate, or paste a token. |
| `/role-selection` | `pages/role-selection.vue` | default | Needs mode and activity code. Name plus staff code when the role requires it. |
| `/portal` | `pages/portal.vue` | `layouts/portal.vue` | Needs mode, code, and role. A Moderator without a valid device token returns to `/join`. Other roles stay. Logout clears the session only. |
| `/walk-in` | `pages/walk-in.vue` | default | Phone check-in from the kiosk QR. Writes the attendee store. |
| `/admin` | `pages/admin/index.vue` | `layouts/admin.vue` | No session and no permission gate. |
| `/admin/tokens` | `pages/admin/tokens/index.vue` | admin | Token Dashboard: every admin’s tokens. |
| `/admin/tokens/generate` | `pages/admin/tokens/generate.vue` | admin | Token Generator: tokens owned by `LS` only. |

`layouts/portal.vue` is the signed-in shell: mode chip, activity code, role switcher, leave session, live countdown, and that role’s tab bar. `pages/portal.vue` is the only tab switch; add a branch there when a tab id needs a view.

`layouts/admin.vue` is a separate shell. Sidebar: Program Management, Marketing, Outcomes, Reporting, Tools, User Manager. Only Token Dashboard and Token Generator are links. Other children are labels. Header search is visual. Create opens the generator.

## Roles and tabs

Source of truth: `ROLES` and `TABS` in `stores/session.ts`. Labels below are the role overrides, not the generic `TABS` label.

| Role | Default tab | Tabs, in order | View |
| --- | --- | --- | --- |
| AV Tech `av-tech` | Master Stage Timers | Master Stage Timers, Polling & Gamification, Audience Q&A, Leaderboard, Slide Deck, Program Flow, Backstage Chat, IP Whitelist | `AV/MasterTimers`, `AV/PollingControl`, `AV/AudienceQA`, `AV/Leaderboard`, `AV/SlideDeck`, `AV/ProgramFlow`, `AV/BackstageChat`, `AV/IpWhitelist` |
| Moderator `moderator` | Audience Q&A | Same as AV Tech without Master Stage Timers and without IP Whitelist | Same AV views. Header clock is the shared stage timer. |
| Faculty `faculty` | Faculty Q&A | Faculty Q&A, Polling Questions (View), Slide Deck, Program Flow, Backstage Chat | `AudienceQA` `variant="faculty"`, `Faculty/FacultyPolls`, then the same Slide Deck, Program Flow, and Backstage Chat. Polls have no launch, stop, or reset. On tablet and desktop the poll list is one third and the question is two thirds. On a phone the list is a left menu. |
| Program Manager `program-manager` | Attendee Management | Attendee Management, Event Notes & Reporting, Faculty Q&A (View), Polling Questions (View), Slide Deck, Program Flow, Backstage Chat | `PM/AttendeeManagement`, `PM/EventNotes`, `AudienceQA` `variant="view"`, `Faculty/FacultyPolls`, then the shared Slide Deck, Program Flow, and Backstage Chat. Same set in every event mode. |

Backstage Chat shows a badge of 3 on every role. `CategoriesGame.vue` renders `game-board`, and `PollingControl.vue` also renders `trivia-polls`. No current role includes those tab ids.

Defined tab ids with no role and no special portal branch: `rationale`, `speaker-timer`, `audience-analytics`.

Event modes (`EventMode`), all selectable on `/`:

| Id | Name | Badge | Built | Not built |
| --- | --- | --- | --- | --- |
| `individual` | ConnectED Individual | Standard | Player leaderboard | Individual polling is still local state in the poll view |
| `teams` | ConnectED Teams | Hybrid | Poll view branches on Teams; team leaderboard | Team chat, Moderator Teams Monitor |
| `categories` | ConnectED Categories – Individuals | Buzzer | `CategoriesGame.vue` exists; leaderboard reuses the player board | Buzz-in scoring. No role shows the game board |
| `catteams` | ConnectED Categories Teams | Team vote | Leaderboard reuses the team board | Team vote, all-teams answer step, 50% correct rule |

Leaderboard copy: Individual and Categories say “Top players” (top 50 of the scored players). Teams and Categories Teams say “Top teams”.

## Stores

Shared session facts, mocked records, and anything another tab or role must see belong here. A draft that has not been submitted can stay in the component.

| Store | Persists | Owns | Reset |
| --- | --- | --- | --- |
| `useSessionStore` `stores/session.ts` | `sessionStorage` `prime-portal-session` | Event mode, activity code, role, name, staff code, live flag, timer, pause, active tab | `logout()` removes the key. Reload restores a valid session. |
| `useSlidesStore` | memory | One 45-slide deck for every mode. Opens on slide 12. Frame is 747:420 and grows to the stage. | Reload returns to slide 12. |
| `useProgramFlowStore` | memory | One 3-page cue sheet for every mode. Page and zoom. | Reload returns to page 1 at 100%. |
| `useBackstageChatStore` | memory | One crew thread for every mode: preview, role-colored bubbles, new-messages divider, quick replies, composer. Sent messages use the signed-in name and role. | Full reload restores the mock transcript. |
| `useLeaderboardStore` | memory | Player board for Individual and Categories. Team board for Teams and Categories Teams. View caps at the top 50. | `resetFromGame(mode)` only, and only when that mode’s game is reset. Resetting a poll does not clear scores. Reload restores the mock snapshot. |
| `useAttendeesStore` | `localStorage` `prime-portal-attendees` | Program Manager roster. Starts from ten people. A registration link adds Invite Sent. Kiosk or `/walk-in` adds Registered. | Delete the key to restore the seed on the next load. Other tabs see writes through `storage`. |
| `useEventNotesStore` | `localStorage` `prime-portal-event-notes` | Three seeded notes, last-saved time, quick-add lines (signed-in name), and an in-browser report from `utils/beautifyNotes.ts` (summary, technical issues, engagement, faculty feedback, follow-ups). | Editing the raw notes clears the report. Reload keeps the notes and drops the report. No network call. The end-of-program package is a simulated send to one email address. |
| `useAdminTokensStore` | `localStorage` `prime-admin-tokens` | Device tokens: id, device label, token string, owner, issuer, stored status `active` or `revoked`, created time, expiration. Display buckets (expired, expiring soon = within 30 days) are separate from stored status. Owner and issuer default to `LS`. New tokens last six months. Extend adds calendar months from the current expiration, or from now if it has passed. Revoked tokens cannot be extended. | Missing or corrupt JSON is replaced with eight seed devices. An empty list stays empty. Malformed rows are dropped. `localStorage.clear()` or removing the key resets other admin tabs to the seed. Dashboard issues, shares, extends, and revokes any admin’s token. Generator is `LS` only and selects another `LS` token if the current one disappears. A share dialog closes if that token disappears. Pairing URL is `origin` + `app.baseURL` + `pair?token=`. |
| `useModeratorDeviceStore` | `localStorage` `prime-moderator-device-token` | Token paired on this browser. Valid only when stored status is active and `expiresAt` is still ahead. Expiring-soon still counts. Failures: `missing`, `not-found`, `revoked`, `expired`. A failure does not replace the saved token. Accepts a raw token or a URL with `token`. | Unpair removes the key. Other tabs follow `storage`. A visible tab rechecks about every 10 seconds. `/pair` and the Moderator `/portal` check refresh that clock before reading authorization. |
| `useIpWhitelistStore` | `localStorage` `prime-portal-ip-whitelist` | AV Tech only, every ConnectED mode. Rows: id, activity code, normalized value, type `single` \| `CIDR` \| `range`, optional location, who added it, created time, expiration 48 hours later. One paste may mix newlines, commas, and semicolons. Valid rows save even when other tokens in the paste fail. IPv4, IPv4 CIDR, IPv4 ranges, IPv6, and IPv6 CIDR are accepted. IPv6 hyphen ranges are rejected. | First load, or corrupt JSON, writes three unexpired seed rows for `123LV26`. An empty array stays empty. Expired rows drop on read, when the tab becomes visible, and about every 20 seconds in the foreground. The portal layout starts this store when an AV Tech opens `/portal`. Removing the key resets other tabs to the three seeds. |

Read the store before changing its validation, canonical form, or migration of old rows. Those rules are the spec.

## Not built

- Teams: team chat and the Moderator Teams Monitor.
- Categories: buzz-in scoring. The board component is unused by every role.
- Categories Teams: team vote, the all-teams answer step, and the 50% correct rule.
- Faculty: Rationale & Citations, Speaker Timer.
- Program Manager: Audience Analytics.
- Portal layouts: `TabView` `split` and `aside` are unused.

## Deploy

`.github/workflows/deploy.yml` runs on push to `main` or `master`, and on `workflow_dispatch`. It runs `npm ci`, `npm run generate`, and publishes `.output/public` with the `github-pages` Nitro preset.

`app.baseURL` in `nuxt.config.ts` is `/PRIME-Backstage-Portal-prototype_2/`. GitHub Pages serves the site from that subfolder. Pairing links must keep that prefix.

## Code map

```
pages/                 routes only
layouts/portal.vue     signed-in shell
layouts/admin.vue      admin shell
middleware/session.global.ts
stores/                Pinia. Mock backend lives here.
components/views/AV/   shared stage tools
components/views/Faculty/
components/views/PM/
components/views/CategoriesGame.vue
components/            shared widgets (QR, role card, leaderboard rows)
utils/beautifyNotes.ts in-browser notes report
assets/css/main.css    Tailwind entry. Do not add a parallel stylesheet.
```

Components and composables are auto-imported. Import types explicitly.
