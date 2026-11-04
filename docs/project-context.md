# PRIME Backstage Portal — Project Context

Living document for the prototype. Update this file after any architectural change, new page, or state modification.

## Project Overview

The PRIME Backstage Portal prototype is a frontend-only Nuxt 3 app that simulates live event management for PRIME Education. A staff member picks a ConnectED event mode, enters an activity code, chooses a role, and works inside a role-specific portal. There is no real backend. The goal is to exercise the backstage tools for different live-session modes before they are wired to production services.

## Tech Stack

- Nuxt 3 (`ssr: false`, strict TypeScript)
- Vue 3 (Composition API, `<script setup>`)
- Pinia (`@pinia/nuxt`)
- Tailwind CSS (`@nuxtjs/tailwindcss`)

## Deployment

The app is frontend-only and is deployed as a statically generated site. `npm run generate` writes the client bundle to `.output/public`. Nitro uses the `github-pages` preset so that directory is ready for GitHub Pages, including the SPA fallback.

`.github/workflows/deploy.yml` deploys that output automatically. It runs on every push to `main` or `master`, and it can be started manually with `workflow_dispatch`. The workflow installs dependencies with `npm ci`, runs `npm run generate`, uploads `.output/public`, and publishes it with GitHub Pages.

GitHub Pages project sites are served from `/<repository-name>/` rather than the domain root. `app.baseURL` in `nuxt.config.ts` is configured to `'/PRIME-Backstage-Portal-prototype_2/'` so that all static assets and router links include the subfolder prefix.

## Architecture & Mocking Strategy

The app relies on a simulated backend driven entirely by Pinia stores containing static mock data extracted from the initial HTML prototypes. Pages and components read and update that store state. They do not call a server.

`stores/session.ts` (`useSessionStore`) owns the global session: event mode, activity code, selected role, user name, staff code, live flag, session timer, pause state, and active tab. The store persists to `sessionStorage` under `prime-portal-session` and restores on load. AV Tech, the Moderator, and Faculty share one stage countdown. Switching between those roles keeps the running time, the pause state, and the live flag. That clock starts at 44:39, and the AV Master Stage Timers tab is what changes it.

`stores/slides.ts` (`useSlidesStore`) owns the live slide index for the shared deck. The same 45-slide presentation is shown in every event mode. Refreshing the page restores slide 12.

`stores/programFlow.ts` (`useProgramFlowStore`) owns the shared cue-sheet reader: the current page and zoom. The same three-page run of show is shown in every event mode. Refreshing the page returns to page 1 at 100%.

`stores/backstageChat.ts` (`useBackstageChatStore`) owns the shared crew thread: the transcript, the participant preview, and quick replies. The same chat is shown in every event mode. A sent message is kept until a full page reload restores the mock transcript.

`stores/leaderboard.ts` (`useLeaderboardStore`) owns the mocked standings. Individual and Categories modes share the player board. Teams and Categories Teams share the team board. The view shows at most the top 50 scored entries. There is no leaderboard reset control. `resetFromGame(mode)` is the only way to clear a board, and it runs when that mode’s game is reset. Resetting a poll question does not clear scores. A full page reload restores the mock snapshot.

`stores/attendees.ts` (`useAttendeesStore`) owns the Program Manager roster. It starts from a ten-person mock list. Sending a registration link adds an Invite Sent row. Checking someone in from the kiosk or the phone page adds a Registered row. The roster is kept in `localStorage` under `prime-portal-attendees`, so a check-in opened from the QR code in another tab appears on the live roster. Clearing that key restores the mock list on the next load.

`stores/eventNotes.ts` (`useEventNotesStore`) owns Program Manager session notes. It starts from three seeded observations. Edits are kept in `localStorage` under `prime-portal-event-notes`, including the timestamp of the last save. Quick-add tags append a timestamped line that uses the signed-in name. Beautify with AI rewrites the current notes in the browser into a report: a summary, sections for technical issues, engagement, and faculty feedback, and any follow-ups. There is no network call. Editing the raw notes clears that report. A full page reload restores the saved notes and drops the generated report.

Accepted mock credentials:

- Activity code: `123LV26`
- Staff code: `4747` (required for AV Tech and Program Manager)

`middleware/session.global.ts` enforces the entry order:

1. `/` — select an event mode
2. `/join` — enter the activity code
3. `/role-selection` — choose a role, enter a name, and enter the staff code when the role requires it
4. `/portal` — role tools, using `layouts/portal.vue`

Several tool views still hold their own static arrays (polls, Q&A, category clues). That data is mocked and should move into Pinia stores as those tools are extended. Do not introduce a real API client for prototype data.

## Current State

### Built

- Nuxt 3 app shell with Pinia, Tailwind, and strict TypeScript (`nuxt.config.ts`, `app.vue`, `tailwind.config.ts`, `assets/css/main.css`). Static generation targets `.output/public` and deploys through `.github/workflows/deploy.yml`.
- Pinia session store with typed roles, tabs, event modes, validation, timer actions, logout, and session persistence.
- Pinia leaderboard store with the individual player board and the team board. The view is capped at the top 50, and scores clear only through `resetFromGame`.
- Pinia slides store. The Slide Deck tab shows one 45-slide presentation in every event mode, opening on slide 12. The slide keeps a 747:420 frame and grows to the widest size that fits the deck stage.
- Pinia program-flow store. Program Flow is a three-page PDF reader for the same cue sheet in every event mode.
- Pinia backstage-chat store. Backstage Chat shows one crew thread in every event mode: participant preview, role-colored bubbles, the new-messages divider, quick replies, and a composer. The signed-in name and role appear on the “You” chip. Messages the signed-in person sends stay on that shared thread.
- Homepage (`pages/index.vue`) with four event-mode cards (`components/EventModeCard.vue`). Individual, Teams, Categories, and Categories Teams each start a session.
- Activity code entry (`pages/join.vue`).
- Role selection (`pages/role-selection.vue`, `components/RoleCard.vue`) with name and staff-code gating.
- Shared portal shell (`layouts/portal.vue`), used by every role after onboarding: mode chip, activity code, role switcher, leave session, live countdown, and that role’s tab bar.
- Portal page (`pages/portal.vue`) renders the active tab.

AV Tech tabs and the views that render them:

| Tab | View |
| --- | --- |
| Master Stage Timers | `components/views/AV/MasterTimers.vue` |
| Polling & Gamification | `components/views/AV/PollingControl.vue` |
| Audience Q&A | `components/views/AV/AudienceQA.vue` |
| Leaderboard | `components/views/AV/Leaderboard.vue` |
| Slide Deck | `components/views/AV/SlideDeck.vue` |
| Program Flow | `components/views/AV/ProgramFlow.vue` |
| Backstage Chat | `components/views/AV/BackstageChat.vue` |

The leaderboard matches the individual prototype: a top-three podium and a two-column list of the remaining ranks (`components/LeaderboardPodiumCard.vue`, `components/LeaderboardStandingRow.vue`). Individual mode reads “Top players” and is capped at 50 of the 214 scored players. Teams mode reads “Top teams” and ranks the nine onsite and virtual teams. Categories uses the player board. Categories Teams uses the team board.

The Moderator uses the same Polling & Gamification, Audience Q&A, Leaderboard, Slide Deck, Program Flow, and Backstage Chat tabs as AV Tech, in that order, without the Master Stage Timers control. `PollingControl.vue` renders that shared polling tab and already branches on Teams versus Categories modes. Faculty uses Faculty Q&A (`AudienceQA.vue`), a view-only poll preview (`components/views/Faculty/FacultyPolls.vue`), and the same Slide Deck, Program Flow, and Backstage Chat views. On tablet and desktop the poll list takes one third of the row and the question takes the other two thirds. On a phone the list opens as a menu from the left. `components/views/CategoriesGame.vue` renders the `game-board` tab. No current role includes that tab.

CME Program Manager tabs and the views that render them. Attendee Management opens by default. Backstage Chat shows a red badge of 3. This same set is used in every event mode.

| Tab | View |
| --- | --- |
| Attendee Management | `components/views/PM/AttendeeManagement.vue` — roster, quick registration, and full-screen kiosk |
| Event Notes & Reporting | `components/views/PM/EventNotes.vue` — session notes (`SessionNotes.vue`), Beautify with AI, and the end-of-program package (`ProgramReport.vue`) |
| Faculty Q&A (View) | `components/views/AV/AudienceQA.vue` with `variant="view"` |
| Polling Questions (View) | `components/views/Faculty/FacultyPolls.vue` |
| Slide Deck | `components/views/AV/SlideDeck.vue` |
| Program Flow | `components/views/AV/ProgramFlow.vue` |
| Backstage Chat | `components/views/AV/BackstageChat.vue` |

### Pending ConnectED event modes

All four ConnectED modes can be selected from the homepage and continue through the activity code, role selection, and the portal. Mode-specific play is not finished:

- **Individual** — individual polling is still local mock state in the poll view. The player leaderboard is in the leaderboard store.
- **Teams** — polling knows the mode is Teams, and the leaderboard ranks teams. Team chat and the Moderator Teams Monitor are not built.
- **Categories** — the category board component exists, but buzz-in scoring is not wired. The leaderboard for this mode currently reuses the individual player board.
- **Categories Teams** — team vote, the all-teams answer step, and the 50% correct rule are not built. The leaderboard currently reuses the team board.

### Pending roles

Role definitions, default tabs, labels, and layout overrides live in `stores/session.ts`. The portal does not yet apply `TabView` split or aside layouts.

- **AV Tech** — tab set and views above are in place. Timer controls write to the session store.
- **Moderator** — Audience Q&A, Polling & Gamification, Leaderboard, Slide Deck, Program Flow, and Backstage Chat are the same tabs and views as AV Tech. The header countdown stays on the AV stage timer. Teams Monitor is not built.
- **Faculty** — Faculty Q&A, view-only Polling Questions, Slide Deck, Program Flow, and Backstage Chat. Slide Deck, Program Flow, and Backstage Chat are the same views as AV Tech and the Moderator. Polling has no launch, stop, or reset controls. The header countdown uses the same stage timer. Rationale & Citations and Speaker Timer still have no views.
- **Program Manager** — Attendee Management is the live roster and quick registration. Full-screen self check-in is a split screen: the walk-in form on one side, and a QR code for phone check-in on the other. Leaving the kiosk requires staff code `4747`. Phone check-in is `pages/walk-in.vue`. Event Notes & Reporting is the session log and the end-of-program package. Notes autosave locally. Quick add inserts a Faculty feedback, Tech issue, or Engagement line. Beautify with AI turns the raw log into the report version included when Event Notes is checked. The package itself is a simulated send to one email address. Faculty Q&A is view-only. Polling Questions, Slide Deck, Program Flow, and Backstage Chat reuse the existing views. Audience Analytics is not on this role.

## Key Terminology

### Roles

- **AV Tech** (`av-tech`) — AV Tech / Stage Producer. Runs the master stage timers, polling, audience Q&A, the leaderboard, slides, program flow, and backstage chat.
- **Moderator** (`moderator`) — Session Moderator. Uses the same audience Q&A, polling, leaderboard, slides, program flow, and backstage chat as AV Tech. The header countdown follows the AV stage timer. Teams mode adds a Teams Monitor.
- **Faculty** (`faculty`) — Medical Faculty / Speaker. Answers faculty Q&A, reviews polling questions in view-only mode, and uses the same slide deck, program flow, backstage chat, and stage countdown as AV Tech and the Moderator.
- **Program Manager** (`program-manager`) — CME Program Manager. Opens on Attendee Management (roster, registration, and kiosk check-in), then Event Notes & Reporting, view-only Faculty Q&A, view-only Polling Questions, and the same Slide Deck, Program Flow, and Backstage Chat as AV Tech.

### Event modes

- **Individual** (`individual`) — ConnectED Individual. Each attendee answers and scores alone. Standard badge.
- **Teams** (`teams`) — ConnectED Teams. Attendees join teams, chat privately, and answer together. Hybrid badge. Adds team polls, a team leaderboard, and the Moderator Teams Monitor.
- **Categories** (`categories`) — ConnectED Categories – Individuals. Jeopardy-style board. Players pick a category and buzz in. Wrong answers lose points. Buzzer badge.
- **Categories Teams** (`catteams`) — ConnectED Categories Teams. The controlling team votes on the category and value. Every team answers, and the 50% correct rule applies. Team vote badge.
