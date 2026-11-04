<script setup lang="ts">
const eventNotes = useEventNotesStore()

const SECTIONS = [
  { id: 'att', label: 'Attendance & Registrations', detail: 'Roster, professions, check-in and app connections' },
  { id: 'poll', label: 'Polling & Engagement Stats', detail: 'Response rates and answer distribution per question' },
  { id: 'qa', label: 'Q&A Logs', detail: 'All audience questions with answered / hidden status' },
  { id: 'notes', label: 'Event Notes', detail: 'Everything in Session Notes & Observations' },
] as const

type SectionId = typeof SECTIONS[number]['id']

const included = reactive<Record<SectionId, boolean>>({
  att: true,
  poll: true,
  qa: true,
  notes: true,
})
const email = ref('')
const emailError = ref('')
const phase = ref<'form' | 'sending' | 'sent'>('form')
let sendTimer: ReturnType<typeof setTimeout> | undefined

const rows = computed(() => SECTIONS.map(section => ({
  ...section,
  detail: section.id === 'notes' && eventNotes.report
    ? 'Beautified report from Session Notes & Observations'
    : section.detail,
  checked: included[section.id],
})))

const includedCount = computed(() => rows.value.filter(row => row.checked).length)
const emailInvalid = computed(() => emailError.value.length > 0)
const emailSupport = computed(() => {
  if (emailError.value) return emailError.value
  if (includedCount.value === 0) return 'Select at least one section to include.'
  return 'The package is sent once, to this address only.'
})

function toggle(id: SectionId) {
  included[id] = !included[id]
}

function onEmail(event: Event) {
  const target = event.target as HTMLInputElement
  email.value = target.value
  emailError.value = ''
}

function send() {
  const value = email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    emailError.value = value ? 'Enter a valid email address.' : 'Enter an email address to receive the report.'
    return
  }
  email.value = value
  phase.value = 'sending'
  if (sendTimer) clearTimeout(sendTimer)
  sendTimer = setTimeout(() => {
    phase.value = 'sent'
  }, 1400)
}

function sendAgain() {
  phase.value = 'form'
  email.value = ''
  emailError.value = ''
}

onBeforeUnmount(() => {
  if (sendTimer) clearTimeout(sendTimer)
})
</script>

<template>
  <section class="panel flex h-full min-h-[480px] flex-col gap-3.5 overflow-auto px-5 py-5 xl:min-h-0" aria-labelledby="report-title">
    <div class="flex items-center gap-3 px-1">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-selected text-on-selected">
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
      </span>
      <div class="flex min-w-0 flex-col">
        <h2 id="report-title" class="m-0 text-xl font-medium leading-[26px]">End of Program Report</h2>
        <span class="text-[13px] leading-[18px] text-muted">Choose what goes into the package</span>
      </div>
    </div>

    <div role="group" aria-label="Included data" class="flex flex-col gap-0.5 rounded-[14px] border border-[#ECEEF2] bg-background p-1">
      <button
        v-for="row in rows"
        :key="row.id"
        type="button"
        role="checkbox"
        class="flex min-h-14 w-full items-center gap-3.5 rounded-xl px-3 py-2 text-left text-on-surface hover:bg-hover-fill focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary"
        :aria-checked="row.checked"
        @click="toggle(row.id)"
      >
        <span
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2"
          :class="row.checked ? 'border-primary bg-primary text-white' : 'border-muted text-transparent'"
          aria-hidden="true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>
        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="text-[15px] font-medium leading-5">{{ row.label }}</span>
          <span class="text-xs leading-4 text-subtle">{{ row.detail }}</span>
        </span>
      </button>
    </div>

    <form v-if="phase !== 'sent'" class="flex flex-col gap-3 px-1" novalidate @submit.prevent="send">
      <p class="m-0 text-[13px] leading-[19px] text-muted">
        Since you are logged in via Activity Code, please provide an email address to receive the secure report package.
      </p>
      <div class="mt-1.5">
        <div class="group relative">
          <label
            for="report-email"
            class="absolute -top-2 left-3 bg-white px-1 text-xs font-medium leading-4"
            :class="emailInvalid ? 'text-error' : 'text-muted group-focus-within:text-primary'"
          >
            Destination email
          </label>
          <input
            id="report-email"
            :value="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="Enter destination email..."
            class="h-14 w-full rounded-lg bg-white px-4 text-base text-on-surface outline-none placeholder:text-outline"
            :class="emailInvalid ? 'border-2 border-error px-[15px]' : 'border border-outline hover:border-on-surface focus:border-2 focus:border-primary focus:px-[15px]'"
            aria-describedby="email-support"
            :aria-invalid="emailInvalid"
            @input="onEmail"
          >
        </div>
        <p
          id="email-support"
          class="mt-1 min-h-4 px-4 text-xs leading-4"
          :class="emailInvalid ? 'text-error' : 'text-muted'"
        >
          {{ emailSupport }}
        </p>
      </div>
      <button
        type="submit"
        class="flex h-14 w-full items-center justify-center gap-2.5 rounded-pill border-0 bg-primary text-base font-medium tracking-[0.01em] text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-primary enabled:hover:bg-primary-pressed enabled:hover:shadow-card disabled:cursor-default disabled:bg-menu disabled:text-[#9A9DA4] disabled:shadow-none"
        :disabled="phase === 'sending' || includedCount === 0"
      >
        <template v-if="phase === 'sending'">
          <span class="h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />
          Preparing report…
        </template>
        <template v-else>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
          Send Program Report
        </template>
      </button>
    </form>

    <div v-else role="status" class="flex flex-col gap-2 rounded-[14px] bg-[#DCF5DF] px-4 py-4 text-on-correct">
      <span class="flex items-center gap-2 text-base font-medium leading-[22px]">
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="#146C2E">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        Report package sent
      </span>
      <span class="text-sm leading-5">
        Delivered to <strong>{{ email }}</strong> with {{ includedCount }} sections attached.
      </span>
      <button
        type="button"
        class="-ml-3 h-10 self-start rounded-pill px-3 text-sm font-medium text-primary hover:bg-[rgba(10,86,208,0.08)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="sendAgain"
      >
        Send to another address
      </button>
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #c4c6d0;
  border-radius: 16px;
}
</style>
