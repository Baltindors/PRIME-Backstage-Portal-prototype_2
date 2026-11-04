<script setup lang="ts">
type PollStatus = 'active' | 'completed' | 'upcoming'

interface FacultyPoll {
  num: number
  status: PollStatus
  votes: number
  pct: number[]
  correct: number
}

const LETTERS = ['A', 'B', 'C', 'D'] as const

const STATUS_LABEL: Record<PollStatus, string> = {
  active: 'Active on Screen',
  completed: 'Completed',
  upcoming: 'Upcoming',
}

const polls: FacultyPoll[] = [
  { num: 1, status: 'completed', votes: 186, pct: [12, 64, 15, 9], correct: 1 },
  { num: 2, status: 'completed', votes: 174, pct: [41, 22, 30, 7], correct: 0 },
  { num: 3, status: 'active', votes: 98, pct: [18, 27, 47, 8], correct: 2 },
  { num: 4, status: 'upcoming', votes: 0, pct: [0, 0, 0, 0], correct: 3 },
  { num: 5, status: 'upcoming', votes: 0, pct: [0, 0, 0, 0], correct: 0 },
]

const selectedNum = ref(3)
const menuOpen = ref(false)
const isNarrow = ref(typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)
const menuButton = ref<HTMLButtonElement | null>(null)
let narrowQuery: MediaQueryList | undefined

function closeMenu() {
  if (!menuOpen.value) return
  menuOpen.value = false
  menuButton.value?.focus()
}

function syncNarrow() {
  isNarrow.value = narrowQuery?.matches ?? false
  if (!isNarrow.value) menuOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

onMounted(() => {
  narrowQuery = window.matchMedia('(max-width: 767px)')
  syncNarrow()
  narrowQuery.addEventListener('change', syncNarrow)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  narrowQuery?.removeEventListener('change', syncNarrow)
  window.removeEventListener('keydown', onKeydown)
})

const completedCount = polls.filter(poll => poll.status === 'completed').length
const summary = `${polls.length} questions · ${completedCount} completed · 1 on screen`

const current = computed(() => polls.find(poll => poll.num === selectedNum.value) ?? polls[0])
const hasVotes = computed(() => current.value.status !== 'upcoming')
const votesCaption = computed(() => (
  current.value.status === 'active' ? 'responses so far · updating live' : 'total responses'
))
const rationale = computed(() => {
  const letter = LETTERS[current.value.correct] ?? 'A'
  return `[Clinical rationale for option ${letter}: the evidence and reasoning faculty can cite when revealing the answer]`
})
const stem = computed(() => (
  `[Question ${current.value.num} stem from the activity record — a two- to three-line clinical vignette ending in the question being asked]`
))
const options = computed(() => LETTERS.map((letter, index) => ({
  letter,
  text: `[Option ${letter} text]`,
  correct: index === current.value.correct,
  pct: current.value.pct[index] ?? 0,
})))

function votesLine(poll: FacultyPoll) {
  if (poll.status === 'upcoming') return 'Locked'
  if (poll.status === 'active') return `${poll.votes} votes so far`
  return `${poll.votes} votes`
}

function selectPoll(num: number) {
  selectedNum.value = num
  closeMenu()
}
</script>

<template>
  <div class="poll-layout">
    <button
      v-if="menuOpen"
      type="button"
      class="poll-scrim"
      aria-label="Close question list"
      @click="closeMenu"
    />

    <section
      id="faculty-poll-list"
      class="panel poll-list"
      :class="{ 'is-open': menuOpen }"
      :inert="isNarrow && !menuOpen"
      aria-labelledby="overview-title"
    >
      <div class="flex items-start gap-3 px-5 pb-2 pt-5">
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <h1 id="overview-title" class="m-0 text-lg font-medium leading-6">
            Session polls & trivia
          </h1>
          <span class="text-[13px] leading-[18px] text-muted">{{ summary }}</span>
        </div>
        <button
          type="button"
          class="poll-close inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-[rgba(26,28,30,0.06)]"
          aria-label="Close question list"
          @click="closeMenu"
        >
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
      <div role="listbox" aria-label="Polling questions" class="flex min-h-0 flex-1 flex-col gap-1 overflow-auto px-3 pb-3 pt-2">
        <button
          v-for="poll in polls"
          :key="poll.num"
          type="button"
          role="option"
          class="poll-item"
          :class="{
            'is-selected': poll.num === current.num,
            'is-locked': poll.status === 'upcoming',
          }"
          :aria-selected="poll.num === current.num"
          @click="selectPoll(poll.num)"
        >
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#ECEEF2] text-sm font-medium text-muted">
            Q{{ poll.num }}
          </span>
          <span class="flex min-w-0 flex-1 flex-col gap-1.5">
            <span class="text-sm leading-5">[Question {{ poll.num }} stem, first line]</span>
            <span class="flex items-center gap-2">
              <span class="pill" :class="poll.status">
                <span v-if="poll.status === 'active'" class="h-1.5 w-1.5 rounded-full bg-white" />
                <svg v-else-if="poll.status === 'upcoming'" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                {{ STATUS_LABEL[poll.status] }}
              </span>
              <span class="text-xs leading-4 text-subtle">{{ votesLine(poll) }}</span>
            </span>
          </span>
        </button>
      </div>
    </section>

    <section class="panel poll-detail flex min-h-0 flex-1 flex-col overflow-hidden" aria-labelledby="detail-title">
      <div class="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-5 py-6 sm:px-7 sm:pb-7">
        <button
          ref="menuButton"
          type="button"
          class="poll-open inline-flex h-10 items-center gap-2 self-start rounded-full border border-outline px-3 text-sm font-medium"
          :aria-expanded="menuOpen"
          aria-controls="faculty-poll-list"
          @click="menuOpen = true"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
          Questions · Q{{ current.num }}
        </button>
        <div class="flex flex-wrap items-center gap-2.5">
          <span class="pill" :class="current.status">
            <span v-if="current.status === 'active'" class="h-1.5 w-1.5 rounded-full bg-white" />
            {{ STATUS_LABEL[current.status] }}
          </span>
          <span class="text-[13px] leading-4 text-muted">Question {{ current.num }} of {{ polls.length }}</span>
          <span class="view-only sm:ml-auto">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            View only
          </span>
        </div>

        <h2 id="detail-title" class="m-0 text-2xl font-normal leading-[34px]">
          {{ stem }}
        </h2>

        <div v-if="current.status === 'upcoming'" class="flex items-center gap-2.5 rounded-xl bg-[#F2F3F7] px-3.5 py-2.5 text-sm leading-5 text-muted">
          <svg aria-hidden="true" class="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
          Not launched yet. Preview only — the AV team will push this to screen per the program flow.
        </div>

        <div v-if="hasVotes" class="flex items-baseline gap-2">
          <span class="text-[28px] font-medium leading-8 tabular-nums">{{ current.votes }}</span>
          <span class="text-sm leading-5 text-muted">{{ votesCaption }}</span>
        </div>

        <div class="flex flex-col gap-2.5">
          <div
            v-for="option in options"
            :key="option.letter"
            class="opt"
            :class="{ 'is-correct': option.correct }"
          >
            <div class="flex items-center gap-3.5">
              <span class="ltr">{{ option.letter }}</span>
              <span class="min-w-0 flex-1 text-lg leading-[26px]">{{ option.text }}</span>
              <span v-if="option.correct" class="correct-chip">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Correct Answer
              </span>
              <span v-if="hasVotes" class="w-[52px] text-right text-lg font-medium leading-6 tabular-nums">{{ option.pct }}%</span>
            </div>
            <div v-if="hasVotes" class="bar-track ml-[46px]">
              <div class="bar" :style="{ width: `${option.pct}%` }" />
            </div>
          </div>
        </div>

        <section aria-labelledby="rat-title" class="flex flex-col gap-2.5 rounded-2xl bg-[#F2F3F7] px-6 py-5">
          <div class="flex items-center gap-2.5">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="#0A56D0">
              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
            </svg>
            <h3 id="rat-title" class="m-0 text-base font-medium leading-6">
              Clinical rationale & explanation
            </h3>
          </div>
          <p class="m-0 text-base leading-[26px]">
            {{ rationale }}
          </p>
          <p class="m-0 text-base leading-[26px] text-muted">
            [Why each distractor is incorrect, one line per option]
          </p>
          <p class="m-0 text-[13px] leading-5 text-subtle">
            References: [Citation 1] · [Citation 2]
          </p>
        </section>
      </div>
    </section>
  </div>
</template>

<style scoped>
.poll-layout {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
}

.poll-scrim {
  position: fixed;
  inset: 0;
  z-index: 20;
  border: 0;
  background: rgba(26, 28, 30, 0.4);
}

.poll-list {
  position: fixed;
  inset-block: 0;
  left: 0;
  z-index: 30;
  display: flex;
  width: min(20rem, 86vw);
  max-width: 100%;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  transform: translateX(-100%);
  transition: transform 200ms ease;
}

.poll-list.is-open {
  transform: translateX(0);
}

@media (min-width: 768px) {
  .poll-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: 1.5rem;
  }

  .poll-scrim,
  .poll-open,
  .poll-close {
    display: none;
  }

  .poll-list,
  .poll-list.is-open {
    position: static;
    z-index: auto;
    width: auto;
    max-width: none;
    height: 100%;
    transform: none;
    box-shadow: none;
  }
}

.panel {
  background: #ffffff;
  border: 1px solid #c4c6d0;
  border-radius: 16px;
}

.poll-item {
  display: flex;
  width: 100%;
  min-height: 72px;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: #1a1c1e;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.poll-item:hover {
  background: #f2f3f7;
}

.poll-item.is-selected {
  border-color: #0a56d0;
  background: #dae2ff;
}

.poll-item.is-locked {
  color: #5d6066;
}

.poll-item:focus-visible {
  outline: 3px solid #0a56d0;
  outline-offset: 3px;
}

.pill {
  display: inline-flex;
  height: 26px;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  border-radius: 13px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

.pill.active {
  background: #0a56d0;
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

.view-only {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 6px;
  border: 1px solid #c4c6d0;
  border-radius: 8px;
  padding: 0 10px;
  color: #44474e;
  font-size: 12px;
  font-weight: 500;
}

.opt {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #e1e2ea;
  border-radius: 12px;
  background: #ffffff;
  padding: 14px 16px;
}

.opt.is-correct {
  border: 2px solid #2e7d3e;
  background: #eaf7eb;
  padding: 13px 15px;
}

.ltr {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #eceef2;
  color: #44474e;
  font-size: 14px;
  font-weight: 700;
}

.opt.is-correct .ltr {
  background: #2e7d3e;
  color: #ffffff;
}

.correct-chip {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 4px;
  border-radius: 8px;
  background: #b7f1b9;
  padding: 0 10px;
  color: #002107;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.bar-track {
  height: 8px;
  overflow: hidden;
  border-radius: 4px;
  background: #eceef2;
}

.bar {
  height: 8px;
  border-radius: 4px;
  background: #8ea6d9;
}

.opt.is-correct .bar {
  background: #2e7d3e;
}
</style>
