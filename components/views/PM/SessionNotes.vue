<script setup lang="ts">
import type { NoteTag } from '~/stores/eventNotes'

const eventNotes = useEventNotesStore()
const session = useSessionStore()

const tags: readonly NoteTag[] = ['Faculty feedback', 'Tech issue', 'Engagement']
const notesField = ref<HTMLTextAreaElement | null>(null)

const canBeautify = computed(() => eventNotes.notes.trim().length > 0 && !eventNotes.beautifying)

const visibleWordCount = computed(() => {
  const report = eventNotes.report
  if (eventNotes.showingReport && report) {
    const text = [
      report.summary,
      ...report.sections.flatMap(section => section.items),
      ...report.followUps,
    ].join(' ')
    return wordCount(text)
  }
  return wordCount(eventNotes.notes)
})

function wordCount(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function onNotesInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  eventNotes.setNotes(target.value)
}

async function addTag(tag: NoteTag) {
  eventNotes.appendTag(tag, session.userName)
  await nextTick()
  const field = notesField.value
  if (!field) return
  field.focus()
  const end = field.value.length
  field.selectionStart = end
  field.selectionEnd = end
}

watch(
  () => eventNotes.showingReport,
  async (showing) => {
    if (showing) return
    await nextTick()
    notesField.value?.focus()
  },
)
</script>

<template>
  <section class="panel flex h-full min-h-[520px] flex-col gap-4 overflow-hidden px-6 py-5 xl:min-h-0" aria-labelledby="notes-title">
    <div class="flex items-start gap-3">
      <svg class="mt-0.5 shrink-0" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="#0A56D0">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
      </svg>
      <div class="flex min-w-0 flex-col">
        <h1 id="notes-title" class="m-0 text-[22px] font-normal leading-7">Session Notes & Observations</h1>
        <span class="text-[13px] leading-[18px] text-muted">Private to Program Managers · included in the end-of-program report</span>
      </div>
    </div>

    <div v-if="!eventNotes.showingReport" role="group" aria-label="Insert a timestamped note" class="flex flex-wrap items-center gap-2">
      <span class="mr-0.5 text-xs leading-4 text-muted">Quick add</span>
      <button
        v-for="tag in tags"
        :key="tag"
        type="button"
        class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-white py-0 pl-2 pr-3 text-[13px] font-medium text-on-surface hover:border-outline hover:bg-hover-fill focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="addTag(tag)"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="#0A56D0">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        {{ tag }}
      </button>
      <button
        v-if="eventNotes.report"
        type="button"
        class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#DAE2FF] px-3 text-[13px] font-medium text-[#001848] hover:bg-[#C5D4FF] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary sm:ml-auto"
        @click="eventNotes.showReport()"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
        </svg>
        View report
      </button>
      <button
        v-else
        type="button"
        class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary sm:ml-auto"
        :class="eventNotes.beautifying || canBeautify ? 'bg-[#DAE2FF] text-[#001848] hover:bg-[#C5D4FF]' : 'cursor-default bg-menu text-[#9A9DA4]'"
        :disabled="!canBeautify"
        :aria-busy="eventNotes.beautifying"
        @click="eventNotes.beautify()"
      >
        <span
          v-if="eventNotes.beautifying"
          class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#C4C6D0] border-t-primary"
          aria-hidden="true"
        />
        <svg v-else aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
        </svg>
        {{ eventNotes.beautifying ? 'Beautifying…' : 'Beautify with AI' }}
      </button>
    </div>

    <div v-else class="flex flex-wrap items-center gap-2">
      <span class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#DAE2FF] px-3 text-[13px] font-medium text-[#001848]">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
        </svg>
        Report ready
      </span>
      <button
        type="button"
        class="ml-auto inline-flex h-9 items-center rounded-lg border border-border bg-white px-3 text-[13px] font-medium text-on-surface hover:border-outline hover:bg-hover-fill focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary"
        @click="eventNotes.showRaw()"
      >
        Edit raw notes
      </button>
    </div>

    <div class="group relative flex min-h-0 flex-1 flex-col rounded-xl bg-white shadow-[inset_0_0_0_1px_#74777F] focus-within:shadow-[inset_0_0_0_2px_#0A56D0]">
      <label
        id="notes-field-label"
        :for="eventNotes.showingReport ? undefined : 'pm-notes'"
        class="absolute -top-2 left-3 bg-white px-1 text-xs font-medium leading-[18px]"
        :class="eventNotes.beautifying ? 'text-primary' : 'text-muted group-focus-within:text-primary'"
      >
        {{ eventNotes.showingReport ? 'Report' : 'Notes' }}
      </label>

      <div class="relative min-h-[280px] flex-1 xl:min-h-0">
        <textarea
          v-if="!eventNotes.showingReport"
          id="pm-notes"
          ref="notesField"
          :value="eventNotes.notes"
          class="absolute inset-0 h-full w-full resize-none bg-transparent px-[18px] pb-2 pt-[18px] text-[17px] leading-7 text-on-surface outline-none placeholder:text-outline"
          placeholder="Jot down faculty feedback, tech issues or engagement observations as the session runs…"
          aria-describedby="notes-status"
          @input="onNotesInput"
        />
        <div
          v-else-if="eventNotes.report"
          id="pm-notes-report"
          class="absolute inset-0 overflow-y-auto px-[18px] pb-4 pt-5 outline-none"
          aria-labelledby="notes-field-label"
        >
          <p class="m-0 text-xs font-medium uppercase tracking-[0.08em] text-primary">Report-ready</p>
          <h2 class="m-0 mt-1 text-xl font-medium leading-7">{{ eventNotes.report.title }}</h2>
          <p class="m-0 mt-1 text-[13px] leading-5 text-muted">Activity {{ session.activityCode ?? '—' }}</p>
          <p class="m-0 mt-3 text-[15px] leading-6 text-muted">{{ eventNotes.report.summary }}</p>
          <section v-for="section in eventNotes.report.sections" :key="section.id" class="mt-3">
            <h3 class="m-0 text-sm font-medium leading-5">{{ section.heading }}</h3>
            <p v-for="(item, index) in section.items" :key="`${section.id}-${index}`" class="m-0 mt-1 text-[15px] leading-6">
              {{ item }}
            </p>
          </section>
          <section v-if="eventNotes.report.followUps.length > 0" class="mt-3 rounded-xl border border-divider bg-background px-4 py-2.5">
            <h3 class="m-0 text-sm font-medium leading-5">Recommended follow-up</h3>
            <ul class="m-0 mt-1 list-disc pl-5 text-[15px] leading-6">
              <li v-for="item in eventNotes.report.followUps" :key="item">{{ item }}</li>
            </ul>
          </section>
        </div>
        <div
          v-if="eventNotes.beautifying"
          role="status"
          class="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80"
        >
          <span class="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-[#C4C6D0] border-t-primary" aria-hidden="true" />
            Turning notes into a report…
          </span>
        </div>
      </div>

      <div class="flex shrink-0 items-center justify-between border-t border-[#ECEEF2] pb-2.5 pl-[18px] pr-3.5 pt-2">
        <span class="text-xs leading-4 text-subtle tabular-nums">{{ visibleWordCount }} words</span>
        <span id="notes-status" role="status" aria-live="polite" class="inline-flex items-center gap-1.5 text-xs leading-4 text-muted">
          <template v-if="eventNotes.showingReport && eventNotes.report">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="#0A56D0">
              <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
            </svg>
            Beautified with AI · {{ eventNotes.report.generatedAt }}
          </template>
          <template v-else-if="eventNotes.saveState === 'saving'">
            <span class="h-3 w-3 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden="true" />
            Auto-saving…
          </template>
          <template v-else>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="#146C2E">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Saved to local storage · {{ eventNotes.savedAt }}
          </template>
        </span>
      </div>
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
