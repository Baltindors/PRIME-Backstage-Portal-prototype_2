export type WhitelistType = 'single' | 'cidr' | 'range'

export interface WhitelistEntry {
  id: string
  activityCode: string
  value: string
  type: WhitelistType
  label?: string
  addedBy: string
  createdAt: string
  expiresAt: string
}

export interface InvalidWhitelistEntry {
  value: string
  message: string
}

export interface AddEntriesResult {
  addedCount: number
  duplicateCount: number
  invalidEntries: InvalidWhitelistEntry[]
}

const STORAGE_KEY = 'prime-portal-ip-whitelist'
const SEED_ACTIVITY_CODE = '123LV26'
const SEED_AUTHOR = 'Jordan Hale'
const TTL_MS = 48 * 60 * 60 * 1000
const PURGE_INTERVAL_MS = 20_000

interface StoredEntries {
  entries: WhitelistEntry[]
  migrated: boolean
}

interface StoredRead {
  entries: WhitelistEntry[]
  shouldPublish: boolean
}

interface WhitelistRuntime {
  __primeIpWhitelistInterval?: number
  __primeIpWhitelistOnStorage?: (event: StorageEvent) => void
  __primeIpWhitelistOnVisibility?: () => void
}

type ParsedToken =
  | { ok: true, value: string, type: WhitelistType }
  | { ok: false, message: string }

function createUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
  }
  else {
    const now = Date.now()
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256) ^ ((now >>> ((index % 4) * 8)) & 0xff)
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function trimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function isWhitelistType(value: unknown): value is WhitelistType {
  return value === 'single' || value === 'cidr' || value === 'range'
}

function parseIpv4(value: string): number | null {
  const parts = value.split('.')
  if (parts.length !== 4) return null
  let result = 0
  for (const part of parts) {
    if (!/^(?:0|[1-9]\d{0,2})$/.test(part)) return null
    const octet = Number(part)
    if (octet > 255) return null
    result = result * 256 + octet
  }
  return result
}

function formatIpv4(value: number): string {
  return [
    Math.floor(value / 16777216) % 256,
    Math.floor(value / 65536) % 256,
    Math.floor(value / 256) % 256,
    value % 256,
  ].join('.')
}

function parseIpv6(value: string): number[] | null {
  let text = value.toLowerCase()
  if (text.includes('%') || text.includes(':::')) return null
  if (text.includes('.')) {
    const lastColon = text.lastIndexOf(':')
    if (lastColon < 0) return null
    const v4 = parseIpv4(text.slice(lastColon + 1))
    if (v4 === null) return null
    const hi = (Math.floor(v4 / 65536) % 65536).toString(16)
    const lo = (v4 % 65536).toString(16)
    text = `${text.slice(0, lastColon)}:${hi}:${lo}`
  }
  if (!/^[0-9a-f:]+$/.test(text)) return null
  const double = text.indexOf('::')
  if (double !== -1 && text.indexOf('::', double + 2) !== -1) return null

  const leftRaw = double === -1 ? text : text.slice(0, double)
  const rightRaw = double === -1 ? null : text.slice(double + 2)
  const left = parseHextets(leftRaw)
  if (!left) return null
  if (rightRaw === null) return left.length === 8 ? left : null
  const right = parseHextets(rightRaw)
  if (!right) return null
  if (left.length + right.length >= 8) return null
  return [...left, ...Array<number>(8 - left.length - right.length).fill(0), ...right]
}

function parseHextets(value: string): number[] | null {
  if (value === '') return []
  const parts = value.split(':')
  const hextets: number[] = []
  for (const part of parts) {
    if (!/^[0-9a-f]{1,4}$/.test(part)) return null
    hextets.push(Number.parseInt(part, 16))
  }
  return hextets
}

function formatIpv6(parts: number[]): string {
  let bestStart = -1
  let bestLength = 0
  let index = 0
  while (index < parts.length) {
    if (parts[index] !== 0) {
      index += 1
      continue
    }
    let end = index
    while (end < parts.length && parts[end] === 0) end += 1
    const length = end - index
    if (length > bestLength) {
      bestStart = index
      bestLength = length
    }
    index = end
  }
  const render = (slice: number[]) => slice.map(part => part.toString(16)).join(':')
  if (bestLength < 2) return render(parts)
  const left = render(parts.slice(0, bestStart))
  const right = render(parts.slice(bestStart + bestLength))
  return `${left}::${right}`
}

function parsePrefix(value: string, max: number): number | null {
  if (!/^(?:0|[1-9]\d{0,2})$/.test(value)) return null
  const prefix = Number(value)
  if (prefix > max) return null
  return prefix
}

function maskIpv4(value: number, prefix: number): number {
  if (prefix <= 0) return 0
  if (prefix >= 32) return value
  const block = 2 ** (32 - prefix)
  return Math.floor(value / block) * block
}

function maskIpv6(parts: number[], prefix: number): number[] {
  const bits = Math.min(128, Math.max(0, prefix))
  return parts.map((part, index) => {
    const start = index * 16
    if (bits >= start + 16) return part
    if (bits <= start) return 0
    const shift = start + 16 - bits
    return (part >> shift) << shift
  })
}

function parseIpv4Range(token: string): ParsedToken {
  const parts = token.split('-')
  if (parts.length !== 2) {
    return { ok: false, message: 'Enter a valid IPv4 range, such as 192.0.2.10-192.0.2.50.' }
  }
  const start = parseIpv4(parts[0].trim())
  const end = parseIpv4(parts[1].trim())
  if (start === null || end === null) {
    return { ok: false, message: 'Enter a valid IPv4 range, such as 192.0.2.10-192.0.2.50.' }
  }
  if (start > end) {
    return { ok: false, message: 'Range end must be greater than or equal to the start.' }
  }
  return { ok: true, type: 'range', value: `${formatIpv4(start)}-${formatIpv4(end)}` }
}

function parseCidr(token: string): ParsedToken {
  const slash = token.indexOf('/')
  if (slash < 0 || slash !== token.lastIndexOf('/')) {
    return { ok: false, message: 'Enter a valid CIDR block, such as 203.0.113.0/24 or 2001:db8::/32.' }
  }
  const address = token.slice(0, slash).trim()
  const prefixText = token.slice(slash + 1).trim()
  const v4 = parseIpv4(address)
  if (v4 !== null) {
    const prefix = parsePrefix(prefixText, 32)
    if (prefix === null) return { ok: false, message: 'IPv4 CIDR prefix must be a number from 0 to 32.' }
    return { ok: true, type: 'cidr', value: `${formatIpv4(maskIpv4(v4, prefix))}/${prefix}` }
  }
  const v6 = parseIpv6(address)
  if (v6) {
    const prefix = parsePrefix(prefixText, 128)
    if (prefix === null) return { ok: false, message: 'IPv6 CIDR prefix must be a number from 0 to 128.' }
    return { ok: true, type: 'cidr', value: `${formatIpv6(maskIpv6(v6, prefix))}/${prefix}` }
  }
  return { ok: false, message: 'Enter a valid CIDR block, such as 203.0.113.0/24 or 2001:db8::/32.' }
}

export function parseWhitelistToken(token: string): ParsedToken {
  if (token.includes('-') && token.includes(':')) {
    return { ok: false, message: 'IPv6 ranges are not supported. Enter a single IPv6 address or an IPv6 CIDR block.' }
  }
  if (token.includes('-')) return parseIpv4Range(token)
  if (token.includes('/')) return parseCidr(token)
  const v4 = parseIpv4(token)
  if (v4 !== null) return { ok: true, type: 'single', value: formatIpv4(v4) }
  const v6 = parseIpv6(token)
  if (v6) return { ok: true, type: 'single', value: formatIpv6(v6) }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(token)) {
    return { ok: false, message: 'Enter a valid IPv4 address. Each octet must be 0–255 with no leading zeros.' }
  }
  return { ok: false, message: 'Enter a valid IPv4 address, IPv6 address, CIDR block, or IPv4 range.' }
}

export function splitWhitelistInput(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map(token => token.trim())
    .filter(token => token.length > 0)
}

function isExpired(entry: WhitelistEntry, now: number): boolean {
  const expires = new Date(entry.expiresAt).getTime()
  return Number.isNaN(expires) || expires <= now
}

function withoutExpired(entries: WhitelistEntry[], now = Date.now()) {
  const next = entries.filter(entry => !isExpired(entry, now))
  return { entries: next, dropped: next.length !== entries.length }
}

function hoursAgo(hours: number): { createdAt: string, expiresAt: string } {
  const created = new Date(Date.now() - hours * 60 * 60 * 1000)
  return {
    createdAt: created.toISOString(),
    expiresAt: new Date(created.getTime() + TTL_MS).toISOString(),
  }
}

function seedEntries(): WhitelistEntry[] {
  const ballroom = hoursAgo(1)
  const guest = hoursAgo(12)
  const registration = hoursAgo(28)
  return [
    {
      id: '6f1c2a40-8b1e-4d3a-9c21-1a2b3c4d5e01',
      activityCode: SEED_ACTIVITY_CODE,
      value: '203.0.113.42',
      type: 'single',
      label: 'Hotel Main Ballroom Wi-Fi',
      addedBy: SEED_AUTHOR,
      createdAt: ballroom.createdAt,
      expiresAt: ballroom.expiresAt,
    },
    {
      id: '7a2d3b51-9c2f-4e4b-8d32-2b3c4d5e6f02',
      activityCode: SEED_ACTIVITY_CODE,
      value: '198.51.100.0/24',
      type: 'cidr',
      label: 'Venue Guest Network',
      addedBy: SEED_AUTHOR,
      createdAt: guest.createdAt,
      expiresAt: guest.expiresAt,
    },
    {
      id: '8b3e4c62-ad30-4f5c-9e43-3c4d5e6f7003',
      activityCode: SEED_ACTIVITY_CODE,
      value: '192.0.2.10-192.0.2.50',
      type: 'range',
      label: 'Registration Desk VLAN',
      addedBy: SEED_AUTHOR,
      createdAt: registration.createdAt,
      expiresAt: registration.expiresAt,
    },
  ]
}

function normalizeEntry(value: unknown): { entry: WhitelistEntry, migrated: boolean } | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const id = trimmedString(row.id)
  const activityCode = trimmedString(row.activityCode)
  const storedValue = trimmedString(row.value)
  const addedBy = trimmedString(row.addedBy)
  const createdAt = trimmedString(row.createdAt)
  const expiresAt = trimmedString(row.expiresAt)
  if (!id || !activityCode || !storedValue || !addedBy || !createdAt || !expiresAt) return null
  if (!isWhitelistType(row.type)) return null
  if (Number.isNaN(Date.parse(createdAt)) || Number.isNaN(Date.parse(expiresAt))) return null

  const parsed = parseWhitelistToken(storedValue)
  if (!parsed.ok || parsed.type !== row.type) return null

  let migrated = parsed.value !== storedValue
    || id !== row.id
    || activityCode !== row.activityCode
    || addedBy !== row.addedBy
    || createdAt !== row.createdAt
    || expiresAt !== row.expiresAt

  const entry: WhitelistEntry = {
    id,
    activityCode,
    value: parsed.value,
    type: parsed.type,
    addedBy,
    createdAt,
    expiresAt,
  }

  if ('label' in row && row.label !== undefined) {
    if (typeof row.label !== 'string') return null
    const label = row.label.trim()
    if (label) entry.label = label
    if (row.label !== entry.label) migrated = true
  }

  return { entry, migrated }
}

function collapseDuplicates(entries: WhitelistEntry[]) {
  const order: string[] = []
  const byKey = new Map<string, WhitelistEntry>()
  let collapsed = false
  for (const entry of entries) {
    const key = `${entry.activityCode}\0${entry.value}`
    const current = byKey.get(key)
    if (!current) {
      byKey.set(key, entry)
      order.push(key)
      continue
    }
    collapsed = true
    const currentExpires = new Date(current.expiresAt).getTime()
    const nextExpires = new Date(entry.expiresAt).getTime()
    const retained = nextExpires > currentExpires ? entry : current
    const dropped = retained === entry ? current : entry
    if (!retained.label && dropped.label) retained.label = dropped.label
    if (retained !== current) byKey.set(key, retained)
  }
  const next: WhitelistEntry[] = []
  for (const key of order) {
    const entry = byKey.get(key)
    if (entry) next.push(entry)
  }
  return { entries: next, collapsed }
}

function parseStored(raw: string): StoredEntries | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const entries: WhitelistEntry[] = []
    let migrated = false
    for (const item of parsed) {
      const normalized = normalizeEntry(item)
      if (!normalized) {
        migrated = true
        continue
      }
      entries.push(normalized.entry)
      if (normalized.migrated) migrated = true
    }
    const deduped = collapseDuplicates(entries)
    return { entries: deduped.entries, migrated: migrated || deduped.collapsed }
  }
  catch {
    return null
  }
}

function readStored(): StoredRead {
  if (typeof localStorage === 'undefined') {
    return { entries: seedEntries(), shouldPublish: false }
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return { entries: seedEntries(), shouldPublish: true }
  const parsed = parseStored(raw)
  if (!parsed) return { entries: seedEntries(), shouldPublish: true }
  const purged = withoutExpired(parsed.entries)
  return {
    entries: purged.entries,
    shouldPublish: parsed.migrated || purged.dropped,
  }
}

function detachRuntime() {
  const host = globalThis as WhitelistRuntime
  if (host.__primeIpWhitelistInterval !== undefined) {
    clearInterval(host.__primeIpWhitelistInterval)
    host.__primeIpWhitelistInterval = undefined
  }
  if (typeof window !== 'undefined' && host.__primeIpWhitelistOnStorage) {
    window.removeEventListener('storage', host.__primeIpWhitelistOnStorage)
    host.__primeIpWhitelistOnStorage = undefined
  }
  if (typeof document !== 'undefined' && host.__primeIpWhitelistOnVisibility) {
    document.removeEventListener('visibilitychange', host.__primeIpWhitelistOnVisibility)
    host.__primeIpWhitelistOnVisibility = undefined
  }
}

export const useIpWhitelistStore = defineStore('ipWhitelist', () => {
  const stored = readStored()
  const entries = ref<WhitelistEntry[]>(stored.entries)

  function publish() {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
  }

  function purgeExpired() {
    const purged = withoutExpired(entries.value)
    if (!purged.dropped) return
    entries.value = purged.entries
    publish()
  }

  function activeFor(activityCode: string | null, now = Date.now()): WhitelistEntry[] {
    if (!activityCode) return []
    return entries.value.filter(entry => entry.activityCode === activityCode && !isExpired(entry, now))
  }

  function addEntries(rawInput: string, label?: string): AddEntriesResult {
    const note = label?.trim() ?? ''
    const session = useSessionStore()
    const activityCode = session.activityCode
    const tokens = splitWhitelistInput(rawInput)
    if (!activityCode) {
      return {
        addedCount: 0,
        duplicateCount: 0,
        invalidEntries: [{
          value: rawInput.trim(),
          message: 'Join an event before whitelisting IPs.',
        }],
      }
    }
    if (tokens.length === 0) {
      return {
        addedCount: 0,
        duplicateCount: 0,
        invalidEntries: [{
          value: '',
          message: 'Enter at least one IP address, CIDR block, or range.',
        }],
      }
    }

    purgeExpired()
    const invalidEntries: InvalidWhitelistEntry[] = []
    const fresh: WhitelistEntry[] = []
    const next = entries.value.map(entry => ({ ...entry }))
    let duplicateCount = 0
    let changed = false
    const createdAt = new Date()
    const createdIso = createdAt.toISOString()
    const expiresIso = new Date(createdAt.getTime() + TTL_MS).toISOString()
    const addedBy = session.userName.trim() || 'AV Tech'

    function matching(list: WhitelistEntry[], value: string) {
      return list.find(entry => entry.activityCode === activityCode && entry.value === value)
    }

    for (const token of tokens) {
      const parsed = parseWhitelistToken(token)
      if (!parsed.ok) {
        invalidEntries.push({ value: token, message: parsed.message })
        continue
      }
      const existing = matching(fresh, parsed.value) ?? matching(next, parsed.value)
      if (existing) {
        duplicateCount += 1
        if (note && existing.label !== note) {
          existing.label = note
          changed = true
        }
        continue
      }
      const entry: WhitelistEntry = {
        id: createUuid(),
        activityCode,
        value: parsed.value,
        type: parsed.type,
        addedBy,
        createdAt: createdIso,
        expiresAt: expiresIso,
      }
      if (note) entry.label = note
      fresh.push(entry)
      changed = true
    }

    if (changed) {
      entries.value = [...fresh, ...next]
      publish()
    }

    return {
      addedCount: fresh.length,
      duplicateCount,
      invalidEntries,
    }
  }

  function removeEntry(id: string) {
    const next = entries.value.filter(entry => entry.id !== id)
    if (next.length === entries.value.length) return
    entries.value = next
    publish()
  }

  function applyStorage(event: StorageEvent) {
    const keyCleared = event.key === STORAGE_KEY || event.key === null
    if (event.newValue === null && keyCleared) {
      entries.value = seedEntries()
      return
    }
    if (event.key !== STORAGE_KEY || event.newValue === null) return
    const parsed = parseStored(event.newValue)
    if (!parsed) {
      entries.value = seedEntries()
      publish()
      return
    }
    const purged = withoutExpired(parsed.entries)
    entries.value = purged.entries
    if (parsed.migrated || purged.dropped) publish()
  }

  function attachRuntime() {
    if (!import.meta.client) return
    detachRuntime()
    const host = globalThis as WhitelistRuntime
    const onStorage = (event: StorageEvent) => applyStorage(event)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') purgeExpired()
    }
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') purgeExpired()
    }, PURGE_INTERVAL_MS)
    host.__primeIpWhitelistOnStorage = onStorage
    host.__primeIpWhitelistOnVisibility = onVisibility
    host.__primeIpWhitelistInterval = interval
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisibility)

    import.meta.hot?.dispose(() => {
      if (host.__primeIpWhitelistOnStorage === onStorage) {
        window.removeEventListener('storage', onStorage)
        host.__primeIpWhitelistOnStorage = undefined
      }
      if (host.__primeIpWhitelistOnVisibility === onVisibility) {
        document.removeEventListener('visibilitychange', onVisibility)
        host.__primeIpWhitelistOnVisibility = undefined
      }
      if (host.__primeIpWhitelistInterval === interval) {
        clearInterval(interval)
        host.__primeIpWhitelistInterval = undefined
      }
    })
  }

  if (stored.shouldPublish) publish()
  attachRuntime()

  return {
    entries,
    activeFor,
    addEntries,
    removeEntry,
  }
})
