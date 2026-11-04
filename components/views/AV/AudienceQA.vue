<script setup lang="ts">
type QuestionStatus = 'new' | 'answered' | 'hidden'

interface Question {
  id: number
  votes: number
  mins: number
  status: QuestionStatus
  text: string
}

const props = withDefaults(defineProps<{
  variant?: 'audience' | 'faculty' | 'view'
}>(), {
  variant: 'audience',
})

const canModerate = computed(() => props.variant !== 'view')

const sortNote = computed(() => {
  if (props.variant === 'view') return 'View only · managed by Moderator and Faculty'
  if (props.variant === 'faculty') return 'Sorted by most upvoted · approved by moderator'
  return 'Sorted by most upvoted · shared live with faculty'
})

const emptyNote = computed(() => {
  if (props.variant === 'view') return 'No new questions. Approved questions appear here for review.'
  if (props.variant === 'faculty') return 'All caught up. New questions appear here as the moderator approves them.'
  return 'All caught up. New audience questions appear here as they arrive.'
})

const questions = ref<Question[]>([
  { id: 1, votes: 42, mins: 2, status: 'new', text: 'How do you decide when to escalate therapy if a patient’s response plateaus after the first three months?' },
  { id: 2, votes: 31, mins: 3, status: 'new', text: 'Are there monitoring intervals you recommend specifically for older adults on this regimen?' },
  { id: 3, votes: 24, mins: 5, status: 'new', text: 'What is your approach when patients report side effects but want to continue treatment?' },
  { id: 4, votes: 18, mins: 6, status: 'new', text: 'Can you clarify how the latest guideline update changes first-line recommendations?' },
  { id: 5, votes: 9, mins: 8, status: 'new', text: 'How do you handle shared decision-making when clinic time is limited?' },
  { id: 6, votes: 27, mins: 12, status: 'answered', text: 'Could you repeat the key takeaway from the second case?' },
  { id: 7, votes: 15, mins: 14, status: 'answered', text: 'Which patient groups were excluded from the trial you discussed?' },
  { id: 8, votes: 6, mins: 9, status: 'hidden', text: 'Will the slides be available after the session?' },
])

const answeredOpen = ref(true)
const hiddenOpen = ref(false)

const byVotes = computed(() => [...questions.value].sort((a, b) => b.votes - a.votes || a.id - b.id))
const incoming = computed(() => byVotes.value.filter(question => question.status === 'new'))
const answered = computed(() => byVotes.value.filter(question => question.status === 'answered'))
const hidden = computed(() => byVotes.value.filter(question => question.status === 'hidden'))

function move(id: number, status: QuestionStatus) {
  const question = questions.value.find(item => item.id === id)
  if (question) question.status = status
}

function markAnswered(id: number) {
  move(id, 'answered')
  answeredOpen.value = true
}

function hide(id: number) {
  move(id, 'hidden')
}

function unhide(id: number) {
  move(id, 'new')
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
    <section class="panel flex min-h-[420px] flex-col overflow-hidden xl:min-h-0" aria-labelledby="feed-title">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pb-3 pt-5 sm:px-6">
        <h1 id="feed-title" class="m-0 text-[22px] font-normal leading-7">
          New incoming questions
        </h1>
        <span class="inline-flex h-7 items-center rounded-lg bg-[#DAE2FF] px-2.5 text-[13px] font-medium text-[#001848]">
          {{ incoming.length }} new
        </span>
        <span class="text-[13px] leading-4 text-muted sm:ml-auto">{{ sortNote }}</span>
      </div>

      <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 pb-6 pt-1 sm:px-6">
        <article v-for="question in incoming" :key="question.id" class="q-card">
          <div
            class="vote"
            :aria-label="`${question.votes} upvotes`"
          >
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
            </svg>
            <span class="text-[22px] font-medium leading-7 text-on-surface tabular-nums">{{ question.votes }}</span>
            <span class="text-[11px] leading-[14px] tracking-[0.04em] text-muted">votes</span>
          </div>
          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <p class="m-0 text-lg font-normal leading-7 sm:text-[19px] sm:leading-7">
              {{ question.text }}
            </p>
            <span class="text-[13px] leading-4 text-muted">Attendee · {{ question.mins }} min ago</span>
            <div v-if="canModerate" class="mt-0.5 flex flex-wrap gap-2">
              <button type="button" class="btn-tonal" :aria-label="`Mark answered: ${question.text}`" @click="markAnswered(question.id)">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Mark Answered
              </button>
              <button type="button" class="btn-text" :aria-label="`Hide: ${question.text}`" @click="hide(question.id)">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z" />
                </svg>
                Hide
              </button>
            </div>
          </div>
        </article>
        <p v-if="incoming.length === 0" class="m-0 px-6 py-12 text-center text-base leading-6 text-muted">
          {{ emptyNote }}
        </p>
      </div>
    </section>

    <aside class="panel max-h-full self-start overflow-auto" aria-label="Question history">
      <button
        type="button"
        class="acc-head"
        :aria-expanded="answeredOpen"
        aria-controls="answered-list"
        @click="answeredOpen = !answeredOpen"
      >
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="#146C2E">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <span>Answered questions</span>
        <span class="count">{{ answered.length }}</span>
        <svg class="chev" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="#44474E">
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
        </svg>
      </button>
      <ul v-if="answeredOpen" id="answered-list" class="m-0 flex list-none flex-col gap-1 px-3 pb-3">
        <li v-for="question in answered" :key="question.id" class="flex gap-2.5 rounded-[10px] bg-[#F8F9FA] px-2 py-2.5">
          <svg aria-hidden="true" class="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="#8E9199">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <span class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="text-sm leading-5 text-subtle">{{ question.text }}</span>
            <span class="text-xs leading-4 text-[#74777F]">{{ question.votes }} votes · answered</span>
          </span>
        </li>
        <li v-if="answered.length === 0" class="px-2 py-3 text-sm leading-5 text-muted">
          No questions answered yet.
        </li>
      </ul>

      <div class="mx-4 h-px bg-divider" />

      <button
        type="button"
        class="acc-head"
        :aria-expanded="hiddenOpen"
        aria-controls="hidden-list"
        @click="hiddenOpen = !hiddenOpen"
      >
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="#74777F">
          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z" />
        </svg>
        <span>Hidden questions</span>
        <span class="count">{{ hidden.length }}</span>
        <svg class="chev" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="#44474E">
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
        </svg>
      </button>
      <ul v-if="hiddenOpen" id="hidden-list" class="m-0 flex list-none flex-col gap-1 px-3 pb-3">
        <li v-for="question in hidden" :key="question.id" class="flex items-center gap-2 rounded-[10px] bg-[#F8F9FA] py-1.5 pl-2 pr-1">
          <span class="min-w-0 flex-1 text-sm leading-5 text-subtle">{{ question.text }}</span>
          <button v-if="canModerate" type="button" class="btn-link" :aria-label="`Unhide: ${question.text}`" @click="unhide(question.id)">
            Unhide
          </button>
        </li>
        <li v-if="hidden.length === 0" class="px-2 py-3 text-sm leading-5 text-muted">
          No hidden questions.
        </li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #c4c6d0;
  border-radius: 16px;
}

.q-card {
  display: flex;
  gap: 16px;
  padding: 16px 16px 12px;
  border: 1px solid #e1e2ea;
  border-radius: 16px;
  background: #ffffff;
}

.q-card:hover {
  border-color: #c4c6d0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

.vote {
  display: flex;
  width: 64px;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  align-self: flex-start;
  gap: 2px;
  padding: 10px 0;
  border-radius: 12px;
  background: #f2f3f7;
  color: #0a56d0;
}

.btn-tonal,
.btn-text,
.btn-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 9999px;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.btn-tonal {
  height: 48px;
  padding: 0 20px 0 16px;
  background: #dae2ff;
  color: #001848;
  font-size: 14px;
  letter-spacing: 0.01em;
}

.btn-tonal:hover {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.btn-text {
  height: 48px;
  padding: 0 16px;
  background: transparent;
  color: #44474e;
  font-size: 14px;
}

.btn-text:hover {
  background: rgba(26, 28, 30, 0.08);
}

.btn-link {
  height: 40px;
  flex-shrink: 0;
  padding: 0 12px;
  background: transparent;
  color: #0a56d0;
  font-size: 13px;
}

.btn-link:hover {
  background: rgba(10, 86, 208, 0.08);
}

.btn-tonal:focus-visible,
.btn-text:focus-visible,
.btn-link:focus-visible,
.acc-head:focus-visible {
  outline: 3px solid #0a56d0;
  outline-offset: 3px;
}

.acc-head {
  display: flex;
  width: 100%;
  min-height: 56px;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border: 0;
  background: transparent;
  color: #1a1c1e;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.acc-head:hover {
  background: rgba(26, 28, 30, 0.05);
}

.chev {
  margin-left: auto;
  transition: transform 0.2s;
}

.acc-head[aria-expanded='true'] .chev {
  transform: rotate(180deg);
}

.count {
  display: inline-flex;
  height: 24px;
  min-width: 24px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #eceef2;
  padding: 0 8px;
  color: #44474e;
  font-size: 12px;
  font-weight: 500;
}
</style>
