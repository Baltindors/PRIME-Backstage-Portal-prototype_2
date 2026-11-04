export type AttendeeStatus = 'invite' | 'reg' | 'app'

export interface Attendee {
  id: string
  name: string
  email: string
  profession: string
  specialty: string
  status: AttendeeStatus
  updatedAt: string
  fresh: boolean
}

export interface CheckInInput {
  name: string
  email: string
  profession: string
  specialty: string
}

export interface InviteInput {
  email: string
  profession: string
  specialty: string
}

export type CheckInResult =
  | { ok: true, name: string, email: string }
  | { ok: false, field: 'name' | 'email' }

export type InviteResult =
  | { ok: true, email: string }
  | { ok: false, reason: 'required' | 'invalid' }

export const PROFESSIONS = [
  'Physician (MD/DO)',
  'Nurse Practitioner',
  'Physician Assistant',
  'Pharmacist',
  'Registered Nurse',
  'Other',
] as const

export const SPECIALTIES = [
  'Cardiology',
  'Endocrinology',
  'Family Medicine',
  'Internal Medicine',
  'Oncology',
  'Other',
] as const

const STORAGE_KEY = 'prime-portal-attendees'

const SEED: readonly Omit<Attendee, 'id' | 'fresh'>[] = [
  { name: 'Maria Chen', email: 'm.chen@example.org', profession: 'Physician (MD/DO)', specialty: 'Cardiology', status: 'app', updatedAt: '1:41 PM' },
  { name: 'James Okafor', email: 'jokafor@example.org', profession: 'Physician (MD/DO)', specialty: 'Internal Medicine', status: 'app', updatedAt: '1:39 PM' },
  { name: 'Priya Raman', email: 'praman@example.org', profession: 'Pharmacist', specialty: 'Oncology', status: 'reg', updatedAt: '1:37 PM' },
  { name: 'Daniel Brooks', email: 'd.brooks@example.org', profession: 'Nurse Practitioner', specialty: 'Family Medicine', status: 'app', updatedAt: '1:36 PM' },
  { name: 'Elena Rossi', email: 'erossi@example.org', profession: 'Physician Assistant', specialty: 'Endocrinology', status: 'invite', updatedAt: '1:34 PM' },
  { name: 'Kevin Tran', email: 'ktran@example.org', profession: 'Registered Nurse', specialty: 'Cardiology', status: 'reg', updatedAt: '1:31 PM' },
  { name: 'Aisha Mohammed', email: 'a.mohammed@example.org', profession: 'Physician (MD/DO)', specialty: 'Family Medicine', status: 'app', updatedAt: '1:29 PM' },
  { name: 'Lucas Meyer', email: 'lmeyer@example.org', profession: 'Physician (MD/DO)', specialty: 'Oncology', status: 'invite', updatedAt: '1:26 PM' },
  { name: 'Sofia Alvarez', email: 's.alvarez@example.org', profession: 'Nurse Practitioner', specialty: 'Internal Medicine', status: 'app', updatedAt: '1:22 PM' },
  { name: 'Thomas Reed', email: 'treed@example.org', profession: 'Pharmacist', specialty: 'Endocrinology', status: 'reg', updatedAt: '1:18 PM' },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

let sequence = SEED.length
let listening = false

function seedAttendees(): Attendee[] {
  return SEED.map((row, index) => ({
    ...row,
    id: `attendee-${index + 1}`,
    fresh: false,
  }))
}

function isStatus(value: unknown): value is AttendeeStatus {
  return value === 'invite' || value === 'reg' || value === 'app'
}

function isAttendee(value: unknown): value is Attendee {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<Attendee>
  return typeof row.id === 'string'
    && typeof row.name === 'string'
    && typeof row.email === 'string'
    && typeof row.profession === 'string'
    && typeof row.specialty === 'string'
    && isStatus(row.status)
    && typeof row.updatedAt === 'string'
}

function parseStored(raw: string, keepFresh: boolean): Attendee[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    if (!parsed.every(isAttendee)) return null
    return parsed.map(row => ({ ...row, fresh: keepFresh && row.fresh }))
  }
  catch {
    return null
  }
}

function readStored(): Attendee[] | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  return parseStored(raw, false)
}

function clock() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function nextId() {
  sequence += 1
  return `attendee-${sequence}`
}

export function isAttendeeEmail(value: string) {
  return EMAIL_PATTERN.test(value)
}

export const useAttendeesStore = defineStore('attendees', () => {
  const attendees = ref<Attendee[]>(readStored() ?? seedAttendees())

function syncSequence(rows: Attendee[]) {
  for (const row of rows) {
    const match = /^attendee-(\d+)$/.exec(row.id)
    if (match) sequence = Math.max(sequence, Number(match[1]))
  }
}

syncSequence(attendees.value)

  function publish() {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attendees.value))
  }

  function prepend(row: Attendee) {
    attendees.value = [
      row,
      ...attendees.value.map(item => ({ ...item, fresh: false })),
    ]
    publish()
  }

  function sendInvite(input: InviteInput): InviteResult {
    const email = input.email.trim()
    if (!email) return { ok: false, reason: 'required' }
    if (!isAttendeeEmail(email)) return { ok: false, reason: 'invalid' }
    prepend({
      id: nextId(),
      name: 'Pending registration',
      email,
      profession: input.profession || '—',
      specialty: input.specialty || '—',
      status: 'invite',
      updatedAt: clock(),
      fresh: true,
    })
    return { ok: true, email }
  }

  function checkIn(input: CheckInInput): CheckInResult {
    const name = input.name.trim()
    const email = input.email.trim()
    if (!name) return { ok: false, field: 'name' }
    if (!isAttendeeEmail(email)) return { ok: false, field: 'email' }
    prepend({
      id: nextId(),
      name,
      email,
      profession: input.profession || '—',
      specialty: input.specialty || '—',
      status: 'reg',
      updatedAt: clock(),
      fresh: true,
    })
    return { ok: true, name, email }
  }

  if (typeof window !== 'undefined' && !listening) {
    listening = true
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      const next = parseStored(event.newValue, true)
      if (next) attendees.value = next
    })
  }

  if (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === null) {
    publish()
  }

  return {
    attendees,
    sendInvite,
    checkIn,
  }
})
