<script setup lang="ts">
type PollStatus = 'live' | 'completed' | 'upcoming'

interface Question {
  n: number
  kind: string
  status: PollStatus
  resp: number
  left: number
  pct: number[]
  correct: number
}

interface LegacyPoll {
  id: string
  title: string
  question: string
  options: string[]
  status: 'queued' | 'live' | 'closed'
}

const INDIVIDUAL_CONNECTED = 342
const TEAMS_CONNECTED = 9
const WINDOW = 30
const RING = 226.19
const LETTERS = ['A', 'B', 'C', 'D']
const TEAM_NAMES = [
  'Team Gorilla - Table 1',
  'Virtual Team 3',
  'Team Eagle - Table 3',
  'Team Tiger - Table 2',
  'Virtual Team 1',
  'Team Bear - Table 6',
  'Team Wolf - Table 4',
  'Virtual Team 2',
  'Team Lion - Table 5',
]

const session = useSessionStore()
const teams = computed(() => session.eventMode === 'teams')
const categoryMode = computed(() => session.eventMode === 'categories' || session.eventMode === 'catteams')
const connected = computed(() => (teams.value ? TEAMS_CONNECTED : INDIVIDUAL_CONNECTED))

const questions = ref<Question[]>([
  { n: 1, kind: 'Poll · scored', status: 'completed', resp: 301, left: 0, pct: [12, 64, 15, 9], correct: 1 },
  { n: 2, kind: 'Poll · scored', status: 'completed', resp: 296, left: 0, pct: [41, 22, 30, 7], correct: 0 },
  { n: 3, kind: 'Trivia · scored', status: 'completed', resp: 321, left: 0, pct: [18, 27, 47, 8], correct: 2 },
  { n: 4, kind: 'Trivia · scored', status: 'upcoming', resp: 0, left: WINDOW, pct: [22, 15, 9, 54], correct: 3 },
  { n: 5, kind: 'Poll · scored', status: 'upcoming', resp: 0, left: WINDOW, pct: [48, 20, 19, 13], correct: 0 },
  { n: 6, kind: 'Opinion poll · unscored', status: 'upcoming', resp: 0, left: WINDOW, pct: [31, 38, 21, 10], correct: -1 },
])

const selectedN = ref(3)

const legacyPolls = ref<LegacyPoll[]>([
  {
    id: 'pre-test',
    title: 'Pre-test',
    question: 'Before today’s session, how confident are you adjusting basal insulin?',
    options: ['Not confident', 'Somewhat confident', 'Confident', 'Very confident'],
    status: 'queued',
  },
  {
    id: 'post-test',
    title: 'Post-test',
    question: 'Which fasting plasma glucose value meets the diagnostic threshold for diabetes?',
    options: ['≥ 110 mg/dL', '≥ 126 mg/dL', '≥ 140 mg/dL', '≥ 200 mg/dL'],
    status: 'closed',
  },
  {
    id: 'trivia-q1',
    title: 'Trivia Q1',
    question: 'How many self-care behaviors make up the ADCES7 framework?',
    options: ['5', '6', '7', '10'],
    status: 'live',
  },
  {
    id: 'trivia-q2',
    title: 'Trivia Q2',
    question: 'Level 2 hypoglycemia is defined as glucose below which value?',
    options: ['70 mg/dL', '54 mg/dL', '40 mg/dL', '60 mg/dL'],
    status: 'queued',
  },
])

let timerId: ReturnType<typeof setInterval> | undefined

function shownResp(resp: number) {
  if (!teams.value) return resp
  return Math.min(TEAMS_CONNECTED, Math.round((resp / INDIVIDUAL_CONNECTED) * TEAMS_CONNECTED))
}

const current = computed(() => questions.value.find(question => question.n === selectedN.value) ?? questions.value[0]!)
const otherLive = computed(() => questions.value.some(question => question.status === 'live' && question.n !== current.value.n))
const liveCount = computed(() => questions.value.filter(question => question.status === 'live').length)
const doneCount = computed(() => questions.value.filter(question => question.status === 'completed').length)
const summary = computed(() => `${questions.value.length} questions · ${doneCount.value} completed · ${liveCount.value} live`)

const responseCount = computed(() => shownResp(current.value.resp))
const responsePct = computed(() => Math.round((responseCount.value / connected.value) * 100))
const ringOffset = computed(() => (RING * (1 - current.value.left / WINDOW)).toFixed(2))
const ringColor = computed(() => {
  if (current.value.status !== 'live') return '#A9ACB4'
  return current.value.left <= 10 ? '#C25E00' : '#0A56D0'
})

const statusLabel = computed(() => {
  if (current.value.status === 'live') return 'Live Now'
  if (current.value.status === 'completed') return 'Completed'
  return 'Upcoming'
})

const screenLine = computed(() => {
  if (current.value.status === 'live') return teams.value ? 'On every team screen now' : 'On audience screen now'
  if (current.value.status === 'completed') return 'Closed · results not yet revealed'
  return 'Not on screen'
})

const timerLine = computed(() => {
  if (current.value.status === 'live') {
    if (current.value.left <= 10) return 'Closing soon'
    return teams.value ? 'Teams locking in' : 'Audience locking in'
  }
  if (current.value.status === 'completed') return 'Poll closed'
  return 'Ready · 30s window'
})

const hint = computed(() => {
  if (current.value.status === 'upcoming') {
    if (otherLive.value) return 'Another question is live. Stop it before launching this one.'
    return teams.value
      ? 'Launch pushes this question to every team and starts the 30-second answer window. Each team submits one answer.'
      : 'Launch pushes this question to the audience screen and starts the 30-second answer window.'
  }
  if (current.value.status === 'live') {
    return teams.value
      ? 'Voting is open. Each team locks one shared answer. Stop early once enough teams have answered.'
      : 'Voting is open. Stop early once enough of the room has answered.'
  }
  return teams.value
    ? 'Results are visible to you only. Reset clears every team answer; Relaunch runs the question again from 30 seconds.'
    : 'Results are visible to you only. Reset clears all responses; Relaunch runs the question again from 30 seconds.'
})

const rationale = computed(() => {
  if (current.value.correct < 0) return 'Opinion poll — there is no correct answer and it does not count toward the leaderboard.'
  const letter = LETTERS[current.value.correct]
  return `[Clinical rationale for option ${letter}: the evidence and reasoning to share when revealing the answer]`
})

const stem = computed(() => (
  `[Question ${current.value.n} stem from the activity record — a short clinical vignette ending in the question being asked]`
))

const canLaunch = computed(() => current.value.status === 'upcoming' && !otherLive.value)
const canStop = computed(() => current.value.status === 'live')
const canReset = computed(() => current.value.status === 'completed')
const canRelaunch = computed(() => current.value.status === 'completed' && !otherLive.value)

const unansweredTeams = computed(() => Math.max(0, TEAMS_CONNECTED - responseCount.value))

const options = computed(() => {
  const groups = teamGroups(current.value)
  return LETTERS.map((letter, index) => ({
    letter,
    text: `[Option ${letter} text]`,
    pct: current.value.pct[index] ?? 0,
    correct: index === current.value.correct,
    teams: groups[index] ?? [],
  }))
})

const legacyLive = computed(() => legacyPolls.value.find(poll => poll.status === 'live') ?? null)
const legacySubtitle = computed(() => (legacyLive.value ? `${legacyLive.value.title} is live` : 'No poll is live'))

function teamGroups(question: Question) {
  const total = shownResp(question.resp)
  const answering = TEAM_NAMES.slice(0, total)
  const raw = question.pct.map(pct => (pct / 100) * answering.length)
  const counts = raw.map(value => Math.floor(value))
  let leftover = answering.length - counts.reduce((sum, count) => sum + count, 0)
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
  for (const item of order) {
    if (leftover <= 0) break
    counts[item.index] = (counts[item.index] ?? 0) + 1
    leftover -= 1
  }
  let cursor = 0
  return counts.map((count) => {
    const slice = answering.slice(cursor, cursor + count)
    cursor += count
    return slice
  })
}

function responseLine(question: Question) {
  const count = shownResp(question.resp)
  if (question.status === 'upcoming') return 'Not launched'
  const unit = teams.value ? (count === 1 ? 'team' : 'teams') : (count === 1 ? 'response' : 'responses')
  if (question.status === 'live') return `${count} ${unit} · ${question.left}s left`
  return `${count} ${unit}`
}

function listStatus(status: PollStatus) {
  if (status === 'live') return 'Live Now'
  if (status === 'completed') return 'Completed'
  return 'Upcoming'
}

function selectQuestion(n: number) {
  selectedN.value = n
}

function patch(n: number, next: Partial<Question>) {
  questions.value = questions.value.map(question => (
    question.n === n ? { ...question, ...next } : question
  ))
}

function launch() {
  if (!canLaunch.value) return
  patch(current.value.n, { status: 'live', left: WINDOW, resp: 0 })
}

function stop() {
  if (!canStop.value) return
  patch(current.value.n, { status: 'completed' })
}

function reset() {
  if (!canReset.value) return
  // Clears this question only. A game reset is what clears the leaderboard.
  patch(current.value.n, { status: 'upcoming', left: WINDOW, resp: 0 })
}

function relaunch() {
  if (!canRelaunch.value) return
  patch(current.value.n, { status: 'live', left: WINDOW, resp: 0 })
}

function launchLegacy(id: string) {
  legacyPolls.value = legacyPolls.value.map(poll => ({
    ...poll,
    status: poll.status === 'live' ? 'closed' : poll.status,
  }))
  legacyPolls.value = legacyPolls.value.map(poll => (
    poll.id === id ? { ...poll, status: 'live' } : poll
  ))
}

function closeLegacy(id: string) {
  legacyPolls.value = legacyPolls.value.map(poll => (
    poll.id === id && poll.status === 'live' ? { ...poll, status: 'closed' } : poll
  ))
}

onMounted(() => {
  timerId = setInterval(() => {
    const cap = Math.round(INDIVIDUAL_CONNECTED * 0.94)
    questions.value = questions.value.map((question) => {
      if (question.status !== 'live') return question
      const next = { ...question, left: Math.max(0, question.left - 1) }
      if (next.resp < cap) next.resp = Math.min(cap, next.resp + 11)
      if (next.left === 0) next.status = 'completed'
      return next
    })
  }, 1000)
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
})
</script>

<template>
  <section v-if="categoryMode" aria-labelledby="poll-title" class="panel flex h-full min-h-0 flex-col overflow-hidden">
    <header class="flex flex-col gap-1 border-b border-divider px-4 py-4 sm:px-6 sm:py-5">
      <h1 id="poll-title" class="m-0 text-lg font-medium leading-6">
        Poll Triggers
      </h1>
      <p class="m-0 text-[13px] leading-[18px] text-muted">
        {{ legacySubtitle }}
      </p>
    </header>
    <ul class="m-0 flex min-h-0 flex-1 list-none flex-col gap-3 overflow-auto p-4">
      <li
        v-for="poll in legacyPolls"
        :key="poll.id"
        class="flex flex-col gap-3 rounded-xl border border-divider bg-surface px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="flex min-w-0 flex-col gap-1.5">
          <h2 class="m-0 text-base font-medium leading-6">
            {{ poll.title }}
          </h2>
          <p class="m-0 text-sm leading-5">
            {{ poll.question }}
          </p>
          <p class="m-0 text-[13px] leading-[18px] text-muted">
            {{ poll.options.join(' · ') }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button v-if="poll.status === 'queued'" type="button" class="legacy-launch" @click="launchLegacy(poll.id)">
            Launch Poll
          </button>
          <template v-else-if="poll.status === 'live'">
            <span class="live-badge"><span class="pulse" aria-hidden="true" />Live</span>
            <button type="button" class="legacy-close" @click="closeLegacy(poll.id)">
              Close Poll
            </button>
          </template>
          <span v-else class="completed-badge">Completed</span>
        </div>
      </li>
    </ul>
  </section>

  <div v-else class="grid grid-cols-1 gap-4 xl:h-full xl:min-h-0 xl:grid-cols-[330px_minmax(0,1fr)] xl:gap-6">
    <section class="panel flex max-h-[42vh] min-h-0 flex-col overflow-hidden xl:max-h-none" aria-labelledby="list-title">
      <div class="flex flex-col gap-0.5 px-[18px] pb-1.5 pt-[18px]">
        <h1 id="list-title" class="m-0 text-lg font-medium leading-6">
          Session questions
        </h1>
        <span class="text-[13px] leading-[18px] text-muted">{{ summary }}</span>
      </div>
      <div role="listbox" aria-label="Session questions" class="flex min-h-0 flex-1 flex-col gap-1 overflow-auto px-2.5 pb-3 pt-2">
        <button
          v-for="question in questions"
          :key="question.n"
          type="button"
          role="option"
          class="q-item"
          :class="{ 'is-selected': question.n === current.n }"
          :aria-selected="question.n === current.n"
          @click="selectQuestion(question.n)"
        >
          <span class="q-num">Q{{ question.n }}</span>
          <span class="flex min-w-0 flex-1 flex-col gap-1.5">
            <span class="text-xs leading-4 text-muted">{{ question.kind }}</span>
            <span class="text-sm leading-5">[Question {{ question.n }} stem, first line]</span>
            <span class="flex flex-wrap items-center gap-2">
              <span class="pill" :class="question.status">
                <span v-if="question.status === 'live'" class="pulse white" aria-hidden="true" />
                {{ listStatus(question.status) }}
              </span>
              <span class="text-xs leading-4 text-subtle">{{ responseLine(question) }}</span>
            </span>
          </span>
        </button>
      </div>
    </section>

    <section class="panel flex min-h-0 flex-col overflow-hidden" aria-labelledby="ctrl-title">
      <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 py-5 sm:px-6 sm:pb-6">
        <div class="flex flex-wrap items-center gap-2.5">
          <span class="pill" :class="current.status">
            <span v-if="current.status === 'live'" class="pulse white" aria-hidden="true" />
            {{ statusLabel }}
          </span>
          <span class="text-[13px] leading-4 text-muted">Question {{ current.n }} of {{ questions.length }} · {{ current.kind }}</span>
          <span class="text-[13px] leading-4 text-muted sm:ml-auto">{{ screenLine }}</span>
        </div>

        <h2 id="ctrl-title" class="m-0 text-xl font-normal leading-[30px]">
          {{ stem }}
        </h2>

        <div v-if="current.status !== 'completed'" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div v-for="option in options" :key="option.letter" class="opt">
            <span class="ltr">{{ option.letter }}</span>
            <span>{{ option.text }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)]">
          <div class="stat">
            <span class="flex items-center gap-2 text-[13px] font-medium leading-4 text-muted">
              <span class="pulse green" aria-hidden="true" />
              {{ teams ? 'Connected Teams' : 'Connected Users' }}
            </span>
            <span class="text-[40px] font-medium leading-[44px] tabular-nums">{{ connected }}</span>
            <span class="text-xs leading-4 text-muted">
              {{ teams ? 'Onsite tables and virtual teams' : 'Devices in the audience app' }}
            </span>
          </div>
          <div class="stat">
            <span class="flex items-center gap-2 text-[13px] font-medium leading-4 text-muted">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="#0A56D0">
                <path d="M3 10h11v2H3v-2zm0-2h11V6H3v2zm0 8h7v-2H3v2zm15.01-3.13l.71-.71c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71-2.12-2.12zm-.71.71l-5.3 5.3V21h2.12l5.3-5.3-2.12-2.12z" />
              </svg>
              Responses Received
            </span>
            <span class="flex items-baseline gap-2 tabular-nums">
              <span class="text-[40px] font-medium leading-[44px]">{{ responseCount }}</span>
              <span class="text-lg leading-6 text-muted">/ {{ connected }}</span>
              <span class="ml-auto inline-flex h-[26px] items-center rounded-[13px] bg-[#DAE2FF] px-2.5 text-[13px] font-bold text-[#001848]">{{ responsePct }}%</span>
            </span>
            <div
              class="bar-track"
              role="progressbar"
              aria-label="Response rate"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-valuenow="responsePct"
            >
              <div class="bar rate" :style="{ width: `${responsePct}%` }" />
            </div>
          </div>
          <div class="stat timer">
            <svg role="img" :aria-label="`${current.left} seconds remaining`" width="84" height="84" viewBox="0 0 84 84" class="shrink-0">
              <circle cx="42" cy="42" r="36" fill="none" stroke="#DDE0E6" stroke-width="8" />
              <circle
                cx="42"
                cy="42"
                r="36"
                fill="none"
                :stroke="ringColor"
                stroke-width="8"
                stroke-linecap="round"
                stroke-dasharray="226.19"
                :stroke-dashoffset="ringOffset"
                transform="rotate(-90 42 42)"
              />
              <text x="42" y="49" text-anchor="middle" font-size="22" font-weight="500" fill="#1A1C1E">{{ current.left }}s</text>
            </svg>
            <span class="flex flex-col gap-1">
              <span class="text-[13px] font-medium leading-4 text-muted">Answer window</span>
              <span class="text-[15px] font-medium leading-5">{{ timerLine }}</span>
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <button type="button" class="act launch" :disabled="!canLaunch" @click="launch">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            Launch Poll
          </button>
          <button type="button" class="act stop" :disabled="!canStop" @click="stop">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z" /></svg>
            Stop Poll Early
          </button>
          <button type="button" class="act out" :disabled="!canReset" @click="reset">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
            Reset Question
          </button>
          <button type="button" class="act out" :disabled="!canRelaunch" @click="relaunch">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
            Relaunch Poll
          </button>
        </div>
        <p class="m-0 -mt-1 text-[13px] leading-[18px] text-muted">
          {{ hint }}
        </p>

        <div v-if="current.status === 'completed'" class="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div class="flex flex-col gap-2">
            <span class="text-sm font-medium leading-5">
              Results preview · {{ responseCount }} {{ teams ? (responseCount === 1 ? 'team' : 'teams') : 'responses' }}
            </span>
            <p v-if="teams && unansweredTeams > 0" class="m-0 text-xs leading-4 text-subtle">
              {{ unansweredTeams }} {{ unansweredTeams === 1 ? 'team has' : 'teams have' }} not answered.
            </p>
            <div v-for="option in options" :key="option.letter" class="res" :class="{ 'is-correct': option.correct }">
              <div class="flex items-center gap-2.5">
                <span class="ltr">{{ option.letter }}</span>
                <span class="flex-1 text-[15px] leading-5">{{ option.text }}</span>
                <span v-if="option.correct" class="correct-chip">
                  <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  Correct Answer
                </span>
                <span class="w-11 text-right text-base font-medium tabular-nums">{{ option.pct }}%</span>
              </div>
              <div class="bar-track ml-10">
                <div class="bar" :style="{ width: `${option.pct}%` }" />
              </div>
              <div v-if="teams && option.teams.length" class="ml-10 flex flex-wrap gap-1.5">
                <span v-for="name in option.teams" :key="name" class="team-chip">{{ name }}</span>
              </div>
            </div>
          </div>
          <section aria-label="Clinical rationale" class="flex flex-col gap-2 rounded-2xl bg-[#F2F3F7] px-[18px] py-4">
            <span class="flex items-center gap-2 text-[15px] font-medium leading-5">
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="#0A56D0">
                <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
              </svg>
              Clinical rationale
            </span>
            <p class="m-0 text-sm leading-[21px]">
              {{ rationale }}
            </p>
            <p class="m-0 text-xs leading-[18px] text-subtle">
              References: [Citation 1] · [Citation 2]
            </p>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #c4c6d0;
  border-radius: 16px;
}

.q-item {
  display: flex;
  width: 100%;
  min-height: 76px;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: #1a1c1e;
  text-align: left;
  font: inherit;
  cursor: pointer;
}

.q-item:hover {
  background: #f2f3f7;
}

.q-item.is-selected {
  background: #dae2ff;
  border-color: #0a56d0;
}

.q-item:focus-visible {
  outline: 3px solid #0a56d0;
  outline-offset: 2px;
}

.q-num {
  display: flex;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #eceef2;
  color: #44474e;
  font-size: 14px;
  font-weight: 500;
}

.pill {
  display: inline-flex;
  height: 26px;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  box-sizing: border-box;
  padding: 0 10px;
  border-radius: 13px;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  white-space: nowrap;
}

.pill.live {
  background: #ba1a1a;
  color: #ffffff;
}

.pill.completed {
  background: #eceef2;
  color: #44474e;
}

.pill.upcoming {
  border: 1px dashed #8e9199;
  background: transparent;
  color: #5d6066;
}

.opt {
  display: flex;
  min-height: 56px;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  padding: 8px 14px;
  border: 1px solid #e1e2ea;
  border-radius: 12px;
  background: #f8f9fa;
  font-size: 16px;
  line-height: 22px;
}

.ltr {
  display: flex;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #eceef2;
  color: #44474e;
  font-size: 13px;
  font-weight: 700;
}

.stat {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  border-radius: 16px;
  background: #f2f3f7;
  padding: 16px 18px;
}

.stat.timer {
  flex-direction: row;
  align-items: center;
  gap: 14px;
}

.act {
  display: inline-flex;
  height: 56px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-sizing: border-box;
  padding: 0 16px;
  border: 0;
  border-radius: 16px;
  font: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.01em;
  cursor: pointer;
}

@media (min-width: 640px) {
  .act {
    height: 64px;
  }
}

.act.launch {
  background: #0a56d0;
  color: #ffffff;
}

.act.launch:hover:not(:disabled) {
  background: #0849b3;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.act.stop {
  background: #ba1a1a;
  color: #ffffff;
}

.act.stop:hover:not(:disabled) {
  background: #9c1414;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.act.out {
  border: 1px solid #74777f;
  background: #ffffff;
  color: #0a56d0;
}

.act.out:hover:not(:disabled) {
  background: rgba(10, 86, 208, 0.06);
}

.act:focus-visible {
  outline: 3px solid #0a56d0;
  outline-offset: 3px;
}

.act:disabled {
  border: 1px solid transparent;
  background: #eceef2;
  color: #9a9da4;
  box-shadow: none;
  cursor: default;
}

.res {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border: 1px solid #e1e2ea;
  border-radius: 12px;
}

.res.is-correct {
  border: 2px solid #2e7d3e;
  background: #eaf7eb;
  padding: 9px 11px;
}

.res.is-correct .ltr {
  background: #2e7d3e;
  color: #ffffff;
}

.bar-track {
  height: 10px;
  overflow: hidden;
  border-radius: 5px;
  background: #eceef2;
}

.bar {
  height: 10px;
  border-radius: 5px;
  background: #8ea6d9;
}

.bar.rate,
.res.is-correct .bar {
  background: #2e7d3e;
}

.bar.rate {
  background: #0a56d0;
}

.correct-chip {
  display: inline-flex;
  height: 24px;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  background: #b7f1b9;
  padding: 0 8px;
  color: #002107;
  font-size: 11px;
  font-weight: 700;
}

.team-chip {
  display: inline-flex;
  height: 24px;
  align-items: center;
  border: 1px solid #c4c6d0;
  border-radius: 9999px;
  background: #ffffff;
  padding: 0 8px;
  font-size: 11px;
  line-height: 16px;
}

.pulse {
  position: relative;
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: #ba1a1a;
}

.pulse::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: inherit;
  animation: poll-pulse 1.6s ease-out infinite;
}

.pulse.green,
.pulse.green::after {
  background: #1e8e3e;
}

.pulse.white,
.pulse.white::after {
  background: #ffffff;
}

.legacy-launch,
.legacy-close {
  height: 40px;
  padding: 0 16px;
  border: 0;
  border-radius: 9999px;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.legacy-launch {
  background: #0a56d0;
  color: #ffffff;
}

.legacy-close {
  background: #ba1a1a;
  color: #ffffff;
}

.live-badge,
.completed-badge {
  display: inline-flex;
  height: 32px;
  align-items: center;
  gap: 8px;
  border-radius: 9999px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
}

.live-badge {
  background: #ffdad6;
  color: #410002;
}

.completed-badge {
  background: #eceef2;
  color: #74777f;
}

@keyframes poll-pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}
</style>
