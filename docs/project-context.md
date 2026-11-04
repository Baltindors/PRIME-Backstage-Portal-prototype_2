# PRIME Backstage Portal — Project Context

Living document for the prototype. Update this file after any architectural change, new page, or state modification.

## Project Overview

The PRIME Backstage Portal prototype is a frontend-only Nuxt 3 app that simulates live event management for PRIME Education. A staff member picks a ConnectED event mode, enters an activity code, chooses a role, and works inside a role-specific portal. There is no real backend. The goal is to exercise the backstage tools for different live-session modes before they are wired to production services.

## Tech Stack

- Nuxt 3 (`ssr: false`, strict TypeScript)
- Vue 3 (Composition API, `<script setup>`)
- Pinia (`@pinia/nuxt`)
- Tailwind CSS (`@nuxtjs/tailwindcss`)

## Architecture & Mocking Strategy

The app relies on a simulated backend driven entirely by Pinia stores containing static mock data extracted from the initial HTML prototypes. Pages and components read and update that store state. They do not call a server.

`stores/session.ts` (`useSessionStore`) owns the global session: event mode, activity code, selected role, user name, staff code, live flag, session timer, pause state, and active tab. The store persists to `sessionStorage` under `prime-portal-session` and restores on load.

`stores/slides.ts` (`useSlidesStore`) owns the live slide index for the shared deck. The same 45-slide presentation is shown in every event mode. Refreshing the page restores slide 12.

`stores/programFlow.ts` (`useProgramFlowStore`) owns the shared cue-sheet reader: the current page and zoom. The same three-page run of show is shown in every event mode. Refreshing the page returns to page 1 at 100%.

`stores/backstageChat.ts` (`useBackstageChatStore`) owns the shared crew thread: the transcript, the participant preview, and quick replies. The same chat is shown in every event mode. A sent message is kept until a full page reload restores the mock transcript.

`stores/leaderboard.ts` (`useLeaderboardStore`) owns the mocked standings. Individual and Categories modes share the player board. Teams and Categories Teams share the team board. The view shows at most the top 50 scored entries. There is no leaderboard reset control. `resetFromGame(mode)` is the only way to clear a board, and it runs when that mode’s game is reset. Resetting a poll question does not clear scores. A full page reload restores the mock snapshot.

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

- Nuxt 3 app shell with Pinia, Tailwind, and strict TypeScript (`nuxt.config.ts`, `app.vue`, `tailwind.config.ts`, `assets/css/main.css`).
- Pinia session store with typed roles, tabs, event modes, validation, timer actions, logout, and session persistence.
- Pinia leaderboard store with the individual player board and the team board. The view is capped at the top 50, and scores clear only through `resetFromGame`.
- Pinia slides store. The Slide Deck tab shows one 45-slide presentation in every event mode, opening on slide 12. The slide keeps a 747:420 frame and grows to the widest size that fits the deck stage.
- Pinia program-flow store. Program Flow is a three-page PDF reader for the same cue sheet in every event mode.
- Pinia backstage-chat store. Backstage Chat shows one crew thread in every event mode: participant preview, role-colored bubbles, the new-messages divider, quick replies, and a composer. The signed-in name and role appear on the “You” chip. Messages the signed-in person sends stay on that shared thread.
- Homepage (`pages/index.vue`) with four event-mode cards (`components/EventModeCard.vue`).
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

`PollingControl.vue` also covers the Moderator trivia-polls tab and already branches on Teams versus Categories modes. `components/views/CategoriesGame.vue` renders the `game-board` tab. Program Manager is assigned every tab, so that board is reachable from that role. AV Tech’s tab list does not include it.

### Pending ConnectED event modes

All four modes can be selected and are stored on the session. The portal chrome labels the active mode. Mode-specific play is not finished:

- **Individual** — individual polling is still local mock state in the poll view. The player leaderboard is in the leaderboard store.
- **Teams** — polling knows the mode is Teams, and the leaderboard ranks teams. Team chat and the Moderator Teams Monitor are not built.
- **Categories** — the category board component exists, but buzz-in scoring is not wired. The leaderboard for this mode currently reuses the individual player board.
- **Categories Teams** — team vote, the all-teams answer step, and the 50% correct rule are not built. The leaderboard currently reuses the team board.

### Pending roles

Role definitions, default tabs, labels, and layout overrides live in `stores/session.ts`. The portal does not yet apply `TabView` split or aside layouts.

- **AV Tech** — tab set and views above are in place. Timer controls write to the session store.
- **Moderator** — Active Q&A, Polling & Gamification, and Backstage Chat reuse the AV views. Teams Monitor is not built.
- **Faculty** — Live Question, Rationale & Citations, and Speaker Timer have no views. Opening those tabs renders an empty panel.
- **Program Manager** — sees every defined tab, including Faculty and analytics tabs that have no view. Attendees, notes, and end-of-program reporting are not built. Audience Analytics has no view.

## Key Terminology

### Roles

- **AV Tech** (`av-tech`) — AV Tech / Stage Producer. Runs the master stage timers, polling, audience Q&A, the leaderboard, slides, program flow, and backstage chat.
- **Moderator** (`moderator`) — Session Moderator. Triages audience Q&A, runs polls and trivia, and uses backstage chat. Teams mode adds a Teams Monitor.
- **Faculty** (`faculty`) — Medical Faculty / Speaker. Answers the live audience question, reviews rationale and citations, and follows a speaker timer.
- **Program Manager** (`program-manager`) — CME Program Manager. Oversees attendees, notes, and reporting, and can view every tool.

### Event modes

- **Individual** (`individual`) — ConnectED Individual. Each attendee answers and scores alone. Standard badge.
- **Teams** (`teams`) — ConnectED Teams. Attendees join teams, chat privately, and answer together. Hybrid badge. Adds team polls, a team leaderboard, and the Moderator Teams Monitor.
- **Categories** (`categories`) — ConnectED Categories – Individuals. Jeopardy-style board. Players pick a category and buzz in. Wrong answers lose points. Buzzer badge.
- **Categories Teams** (`catteams`) — ConnectED Categories Teams. The controlling team votes on the category and value. Every team answers, and the 50% correct rule applies. Team vote badge.
