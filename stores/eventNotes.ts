import type { BeautifiedReport } from '~/utils/beautifyNotes'

export type NoteTag = 'Faculty feedback' | 'Tech issue' | 'Engagement'

const STORAGE_KEY = 'prime-portal-event-notes'
const SEED_SAVED_AT = '2:14 PM'
const SEED_NOTES = '[1:52 PM] Tech issue — Lapel mic for Dr. Smith dropped out during sound check; AV swapped the battery.\n[2:06 PM] Engagement — Strong response to Q1: 301 of 342 connected devices answered.\n[2:14 PM] Faculty feedback — Dr. Smith asked for a 2-minute warning before Q&A next time.\n'

interface StoredNotes {
  notes: string
  savedAt: string
}

function clock() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function readStored(): StoredNotes | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<StoredNotes>
    if (typeof parsed.notes !== 'string' || typeof parsed.savedAt !== 'string') return null
    return { notes: parsed.notes, savedAt: parsed.savedAt }
  }
  catch {
    return null
  }
}

function publish(notes: string, savedAt: string) {
  if (typeof localStorage === 'undefined') return
  const payload: StoredNotes = { notes, savedAt }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const useEventNotesStore = defineStore('eventNotes', () => {
  const stored = readStored()
  const notes = ref(stored?.notes ?? SEED_NOTES)
  const savedAt = ref(stored?.savedAt ?? SEED_SAVED_AT)
  const saveState = ref<'saving' | 'saved'>('saved')
  const report = ref<BeautifiedReport | null>(null)
  const showingReport = ref(false)
  const beautifying = ref(false)
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  let beautifyTimer: ReturnType<typeof setTimeout> | undefined

  function setNotes(value: string) {
    notes.value = value
    saveState.value = 'saving'
    report.value = null
    showingReport.value = false
    beautifying.value = false
    if (beautifyTimer) clearTimeout(beautifyTimer)
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      savedAt.value = clock()
      saveState.value = 'saved'
      publish(notes.value, savedAt.value)
    }, 900)
  }

  function appendTag(tag: NoteTag, author: string) {
    const name = author.trim() || 'Sarah'
    const current = notes.value
    const separator = current.length > 0 && !current.endsWith('\n') ? '\n' : ''
    setNotes(`${current}${separator}[${clock()}] Program Manager ${name} · ${tag} — `)
  }

  function beautify() {
    const snapshot = notes.value
    if (beautifying.value || !snapshot.trim()) return
    if (report.value) {
      showingReport.value = true
      return
    }
    if (beautifyTimer) clearTimeout(beautifyTimer)
    beautifying.value = true
    beautifyTimer = setTimeout(() => {
      if (notes.value !== snapshot) {
        beautifying.value = false
        return
      }
      report.value = buildBeautifiedReport(snapshot, clock())
      showingReport.value = true
      beautifying.value = false
    }, 1100)
  }

  function showRaw() {
    showingReport.value = false
  }

  function showReport() {
    if (report.value) showingReport.value = true
  }

  if (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === null) {
    publish(notes.value, savedAt.value)
  }

  return {
    notes,
    savedAt,
    saveState,
    report,
    showingReport,
    beautifying,
    setNotes,
    appendTag,
    beautify,
    showRaw,
    showReport,
  }
})
