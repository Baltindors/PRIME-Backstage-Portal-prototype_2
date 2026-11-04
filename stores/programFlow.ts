export interface CueRow {
  time: string
  segment: string
  cue: string
  owner: string
  highlight: boolean
  emphasis: boolean
}

export interface FlowNote {
  number: 2 | 3
  title: string
  body: string
}

export const FLOW_FILE_NAME = 'Session agenda & cue sheet.pdf'
export const FLOW_UPDATED = 'Updated by Program Manager · [date/time]'
export const FLOW_ZOOM_STEPS = [90, 100, 115, 130] as const

export const FLOW_ACTIVITY_LINE = 'Activity 123LV26 · [Date] · [Start time] – [End time] [Time zone] · [Venue / platform]'

export const FLOW_STAFF = [
  { role: 'Faculty', name: 'Dr. Smith' },
  { role: 'Moderator', name: 'Dr. Adams' },
  { role: 'AV lead', name: 'Mike' },
  { role: 'Program Mgr', name: 'Sarah' },
] as const

export const FLOW_ROWS: CueRow[] = [
  {
    time: '[−0:15]',
    segment: 'Doors open · holding slide and walk-in music',
    cue: 'Holding loop on screen',
    owner: 'AV Tech',
    highlight: true,
    emphasis: true,
  },
  {
    time: '[0:00]',
    segment: 'Welcome, disclosures and learning objectives',
    cue: 'Mic 1 live · slides 1–4',
    owner: 'Moderator',
    highlight: false,
    emphasis: true,
  },
  {
    time: '[0:05]',
    segment: 'Faculty presentation, part 1',
    cue: 'Lapel mic · slides 5–18',
    owner: 'Faculty',
    highlight: false,
    emphasis: false,
  },
  {
    time: '[0:20]',
    segment: 'Polling questions 1 and 2',
    cue: 'Launch Q1 → stop → Q2',
    owner: 'AV · Moderator',
    highlight: true,
    emphasis: true,
  },
  {
    time: '[0:25]',
    segment: 'Faculty presentation, part 2',
    cue: 'Slides 19–38',
    owner: 'Faculty',
    highlight: false,
    emphasis: false,
  },
  {
    time: '[0:45]',
    segment: 'Polling question 3 (trivia round)',
    cue: 'Launch Q3 · show leaderboard',
    owner: 'AV · Moderator',
    highlight: true,
    emphasis: true,
  },
  {
    time: '[0:50]',
    segment: 'Audience Q&A',
    cue: 'Forward top questions to faculty',
    owner: 'Moderator · Faculty',
    highlight: false,
    emphasis: true,
  },
  {
    time: '[1:05]',
    segment: 'Polling questions 4–6 · post-test',
    cue: 'Launch Q4, Q5, Q6',
    owner: 'AV · Moderator',
    highlight: true,
    emphasis: true,
  },
  {
    time: '[1:10]',
    segment: 'Close, evaluation and credit instructions',
    cue: 'Slides 44–45 · outro music',
    owner: 'Program Mgr',
    highlight: false,
    emphasis: false,
  },
]

export const FLOW_FOOTNOTE = 'Highlighted rows are your segments. A 2-minute and 30-second warning will appear in Backstage Chat before each cue.'

export const FLOW_NOTES: FlowNote[] = [
  {
    number: 2,
    title: 'Cue details & moderator script',
    body: '[Per-segment notes, poll launch cues, transitions and hand-offs from the program team]',
  },
  {
    number: 3,
    title: 'Contacts & contingencies',
    body: '[Backstage contacts, fallback plan for AV failure, timing buffers]',
  },
]

export function flowSheetText() {
  const staff = FLOW_STAFF.map(person => `${person.role}: ${person.name}`).join('  ')
  const agenda = FLOW_ROWS.map(row => `${row.time}\t${row.segment}\t${row.cue}\t${row.owner}`).join('\n')
  const notes = FLOW_NOTES.map(note => `${note.title}\n${note.body}`).join('\n\n')
  return [
    'PRIME EDUCATION · RUN OF SHOW',
    '[Activity title]',
    FLOW_ACTIVITY_LINE,
    staff,
    '',
    'TIME\tSEGMENT\tCUE\tOWNER',
    agenda,
    '',
    FLOW_FOOTNOTE,
    '',
    notes,
  ].join('\n')
}

export const useProgramFlowStore = defineStore('programFlow', () => {
  const page = ref(1)
  const zoomIndex = ref(1)
  const pageCount = 3

  const zoom = computed(() => FLOW_ZOOM_STEPS[zoomIndex.value] ?? 100)
  const atMinZoom = computed(() => zoomIndex.value <= 0)
  const atMaxZoom = computed(() => zoomIndex.value >= FLOW_ZOOM_STEPS.length - 1)

  function setPage(next: number) {
    page.value = Math.min(pageCount, Math.max(1, next))
  }

  function zoomIn() {
    zoomIndex.value = Math.min(FLOW_ZOOM_STEPS.length - 1, zoomIndex.value + 1)
  }

  function zoomOut() {
    zoomIndex.value = Math.max(0, zoomIndex.value - 1)
  }

  return {
    page,
    pageCount,
    zoom,
    atMinZoom,
    atMaxZoom,
    fileName: FLOW_FILE_NAME,
    updatedLabel: FLOW_UPDATED,
    activityLine: FLOW_ACTIVITY_LINE,
    staff: FLOW_STAFF,
    rows: FLOW_ROWS,
    footnote: FLOW_FOOTNOTE,
    notes: FLOW_NOTES,
    sheetText: flowSheetText,
    setPage,
    zoomIn,
    zoomOut,
  }
})
