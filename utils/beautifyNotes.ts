export interface ReportSection {
  id: string
  heading: string
  items: string[]
}

export interface BeautifiedReport {
  title: string
  summary: string
  sections: ReportSection[]
  followUps: string[]
  generatedAt: string
}

const NOTE_KINDS = ['Tech issue', 'Engagement', 'Faculty feedback', 'Observation'] as const

type NoteKind = typeof NOTE_KINDS[number]

interface ParsedNote {
  time: string | null
  author: string | null
  tag: NoteKind
  body: string
}

const SECTION_COPY: Record<NoteKind, { id: string, heading: string }> = {
  'Tech issue': { id: 'tech', heading: 'Technical' },
  Engagement: { id: 'engagement', heading: 'Audience engagement' },
  'Faculty feedback': { id: 'faculty', heading: 'Faculty feedback' },
  Observation: { id: 'other', heading: 'Additional observations' },
}

const COUNT_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const STAMPED = /^\[([^\]]+)\]\s*(.*)$/
const AUTHORED = /^Program Manager\s+(.+?)\s*·\s*(.*)$/
const TAGGED = /^(Faculty feedback|Tech issue|Engagement)\s*[—–-]\s*(.*)$/

function countWord(count: number) {
  return COUNT_WORDS[count] ?? String(count)
}

function countWordCapitalized(count: number) {
  const word = countWord(count)
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function joinList(items: string[]) {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function isNoteKind(value: string): value is NoteKind {
  return NOTE_KINDS.some(kind => kind === value)
}

function finishSentence(text: string) {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  const capitalized = trimmed.replace(
    /(^|[.]\s+)([a-z])/g,
    (_match, lead: string, letter: string) => lead + letter.toUpperCase(),
  )
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`
}

function polishBody(body: string) {
  const compact = body.trim().replace(/\s+/g, ' ')
  const engagement = /^strong response to Q(\d+):\s*(\d+)\s+of\s+(\d+)\s+connected devices answered\.?$/i.exec(compact)
  if (engagement) {
    const question = engagement[1] ?? ''
    const answered = Number(engagement[2])
    const connected = Number(engagement[3])
    const percent = connected > 0 ? Math.round((answered / connected) * 100) : 0
    return `Question ${question} drew a strong response, with ${answered} of ${connected} connected devices answering (${percent}%).`
  }

  const text = compact
    .replace(/\blapel mic\b/gi, 'lapel microphone')
    .replace(/\bdropped out\b/gi, 'lost its signal')
    .replace(/\bswapped the battery\b/gi, 'replaced the battery')
    .replace(/\basked for\b/gi, 'requested')
    .replace(/\b(\d+)-minute\b/gi, (_match, digits: string) => `${countWord(Number(digits))}-minute`)
    .replace(/\bnext time\b/gi, 'at the next session')
    .replace(/;\s*/g, '. ')
    .replace(/^lapel microphone\b/i, 'The lapel microphone')

  return finishSentence(text)
}

function parseLine(line: string): ParsedNote {
  const stamped = STAMPED.exec(line)
  const time = stamped?.[1] ?? null
  let rest = (stamped ? stamped[2] : line).trim()
  let author: string | null = null
  const authored = AUTHORED.exec(rest)
  if (authored?.[1] && authored[2] !== undefined) {
    author = authored[1].trim()
    rest = authored[2].trim()
  }
  const tagged = TAGGED.exec(rest)
  const tag = tagged?.[1]
  if (tag && isNoteKind(tag)) {
    return { time, author, tag, body: (tagged[2] ?? '').trim() }
  }
  return { time, author, tag: 'Observation', body: rest }
}

function narrate(entry: ParsedNote, polished: string) {
  const sentence = polished.replace(/\.$/, '')
  const when = entry.time ? `at ${entry.time}` : null
  const who = entry.author ? `by ${entry.author}` : null
  const noted = [who, when].filter((part): part is string => part !== null).join(' ')
  if (!noted) return polished
  return `${sentence}, noted ${noted}.`
}

function followUpsFor(entry: ParsedNote) {
  const items: string[] = []
  if (/\b2-minute warning\b/i.test(entry.body) || /\btwo-minute warning\b/i.test(entry.body)) {
    items.push('Give faculty a two-minute warning before Q&A.')
  }
  if (/\b(battery|batteries)\b/i.test(entry.body) && /\b(mic|microphone)\b/i.test(entry.body)) {
    items.push('Stage a spare microphone battery before the next sound check.')
  }
  return items
}

function topicPhrase(tag: NoteKind, count: number) {
  if (tag === 'Tech issue') return count === 1 ? 'a technical issue' : `${countWord(count)} technical issues`
  if (tag === 'Engagement') return count === 1 ? 'audience engagement' : `${countWord(count)} engagement notes`
  if (tag === 'Faculty feedback') return count === 1 ? 'faculty feedback' : `${countWord(count)} faculty notes`
  return count === 1 ? 'an additional observation' : `${countWord(count)} additional observations`
}

function summaryFor(groups: Array<{ tag: NoteKind, count: number }>) {
  const total = groups.reduce((sum, group) => sum + group.count, 0)
  if (total === 0) return 'Notes were started, but no details were written yet.'
  const lead = `${countWordCapitalized(total)} ${total === 1 ? 'observation was' : 'observations were'} prepared for the end-of-program report`
  if (groups.length === 1 && groups[0]?.tag === 'Observation') return `${lead}.`
  return `${lead}, covering ${joinList(groups.map(group => topicPhrase(group.tag, group.count)))}.`
}

export function buildBeautifiedReport(raw: string, generatedAt: string): BeautifiedReport {
  const entries = raw
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(parseLine)
    .filter(entry => entry.body.length > 0)

  const grouped = new Map<NoteKind, string[]>()
  const followUps: string[] = []

  for (const entry of entries) {
    const polished = polishBody(entry.body)
    if (!polished) continue
    const items = grouped.get(entry.tag) ?? []
    items.push(narrate(entry, polished))
    grouped.set(entry.tag, items)
    followUps.push(...followUpsFor(entry))
  }

  const sections = NOTE_KINDS.flatMap((tag) => {
    const items = grouped.get(tag)
    if (!items || items.length === 0) return []
    return [{ ...SECTION_COPY[tag], items }]
  })

  const groups = NOTE_KINDS.flatMap((tag) => {
    const count = grouped.get(tag)?.length ?? 0
    return count > 0 ? [{ tag, count }] : []
  })

  return {
    title: 'Session observations',
    summary: summaryFor(groups),
    sections,
    followUps: [...new Set(followUps)],
    generatedAt,
  }
}
