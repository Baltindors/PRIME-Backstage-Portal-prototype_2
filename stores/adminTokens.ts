export type TokenStatus = 'active' | 'revoked'
export type TokenDisplayStatus = 'active' | 'expiring' | 'expired' | 'revoked'

export interface DeviceToken {
  id: string
  label: string
  tokenString: string
  owner: string
  issuedBy: string
  status: TokenStatus
  createdAt: string
  expiresAt: string
}

export interface GenerateTokenPayload {
  label: string
  owner?: string
  durationMonths?: number
}

export const KNOWN_ADMINS = ['LS', 'Maria Chen', 'David Ortiz', 'Sarah Jenkins'] as const
export const SELF_SERVICE_OWNER = 'LS'

const STORAGE_KEY = 'prime-admin-tokens'
const DEFAULT_DURATION_MONTHS = 6
const EXPIRING_WINDOW_MS = 30 * 24 * 60 * 60 * 1000

interface StoredTokens {
  tokens: DeviceToken[]
  migrated: boolean
}

export function addCalendarMonths(date: Date, months: number): Date {
  const monthIndex = date.getMonth() + months
  const year = date.getFullYear() + Math.floor(monthIndex / 12)
  const month = ((monthIndex % 12) + 12) % 12
  const lastDay = new Date(year, month + 1, 0).getDate()
  const day = Math.min(date.getDate(), lastDay)
  return new Date(year, month, day, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
}

export function pairingPath(tokenString: string, baseURL: string): string {
  const trimmed = baseURL.trim()
  const withLead = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const base = withLead.replace(/^\/+/, '/').replace(/\/+$/, '')
  return `${base === '/' ? '' : base}/pair?token=${encodeURIComponent(tokenString)}`
}

export function displayStatus(token: DeviceToken, now = new Date()): TokenDisplayStatus {
  if (token.status === 'revoked') return 'revoked'
  const expires = new Date(token.expiresAt)
  if (Number.isNaN(expires.getTime()) || expires.getTime() <= now.getTime()) return 'expired'
  if (expires.getTime() - now.getTime() <= EXPIRING_WINDOW_MS) return 'expiring'
  return 'active'
}

export function formatTokenTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

let listening = false

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

function isStatus(value: unknown): value is TokenStatus {
  return value === 'active' || value === 'revoked'
}

function trimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function shiftDays(from: Date, days: number): string {
  const date = new Date(from)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function seedTokens(): DeviceToken[] {
  const now = new Date()
  return [
    {
      id: '6f1c2a40-8b1e-4d3a-9c21-1a2b3c4d5e6f',
      label: 'iPad Pro - Main Stage',
      tokenString: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      owner: 'LS',
      issuedBy: 'LS',
      status: 'active',
      createdAt: shiftDays(now, -20),
      expiresAt: shiftDays(now, 160),
    },
    {
      id: '7a2d3b51-9c2f-4e4b-8d32-2b3c4d5e6f70',
      label: 'iPad - Registration',
      tokenString: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
      owner: 'LS',
      issuedBy: 'LS',
      status: 'active',
      createdAt: shiftDays(now, -40),
      expiresAt: shiftDays(now, 12),
    },
    {
      id: '8b3e4c62-0d30-4f5c-9e43-3c4d5e6f7081',
      label: 'Laptop - Moderator',
      tokenString: 'c3d4e5f6-a7b8-4c9d-8e1f-2a3b4c5d6e7f',
      owner: 'LS',
      issuedBy: 'LS',
      status: 'revoked',
      createdAt: shiftDays(now, -15),
      expiresAt: shiftDays(now, 90),
    },
    {
      id: '9c4f5d73-1e41-406d-8f54-4d5e6f708192',
      label: 'Surface - Faculty Room',
      tokenString: 'd4e5f6a7-b8c9-4d0e-9f2a-3b4c5d6e7f80',
      owner: 'Maria Chen',
      issuedBy: 'LS',
      status: 'active',
      createdAt: shiftDays(now, -30),
      expiresAt: shiftDays(now, 150),
    },
    {
      id: 'ad506e84-2f52-417e-9065-5e6f708192a3',
      label: 'iPad - Green Room',
      tokenString: 'e5f6a7b8-c9d0-4e1f-8a3b-4c5d6e7f8091',
      owner: 'David Ortiz',
      issuedBy: 'LS',
      status: 'active',
      createdAt: shiftDays(now, -50),
      expiresAt: shiftDays(now, 20),
    },
    {
      id: 'be617f95-3063-428f-a176-6f708192a3b4',
      label: 'Phone - Runner',
      tokenString: 'f6a7b8c9-d0e1-4f2a-9b4c-5d6e7f8091a2',
      owner: 'David Ortiz',
      issuedBy: 'David Ortiz',
      status: 'active',
      createdAt: shiftDays(now, -80),
      expiresAt: shiftDays(now, -10),
    },
    {
      id: 'cf7280a6-4174-4390-b287-708192a3b4c5',
      label: 'Laptop - Outcomes',
      tokenString: 'a7b8c9d0-e1f2-4a3b-8c5d-6e7f8091a2b3',
      owner: 'Sarah Jenkins',
      issuedBy: 'Sarah Jenkins',
      status: 'active',
      createdAt: shiftDays(now, -5),
      expiresAt: shiftDays(now, 300),
    },
    {
      id: 'd08391b7-5285-44a1-c398-8192a3b4c5d6',
      label: 'iPad Mini - Check-in',
      tokenString: 'b8c9d0e1-f2a3-4b4c-9d6e-7f8091a2b3c4',
      owner: 'Sarah Jenkins',
      issuedBy: 'LS',
      status: 'revoked',
      createdAt: shiftDays(now, -12),
      expiresAt: shiftDays(now, 40),
    },
  ]
}

function normalizeToken(value: unknown): { token: DeviceToken, migrated: boolean } | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  const id = trimmedString(row.id)
  const label = trimmedString(row.label)
  const tokenString = trimmedString(row.tokenString)
  const createdAt = trimmedString(row.createdAt)
  if (!id || !label || !tokenString || !isStatus(row.status) || !createdAt) return null
  if (Number.isNaN(Date.parse(createdAt))) return null

  let migrated = false
  let owner = trimmedString(row.owner)
  if (!owner) {
    owner = SELF_SERVICE_OWNER
    migrated = true
  }
  let issuedBy = trimmedString(row.issuedBy)
  if (!issuedBy) {
    const legacy = trimmedString(row.createdBy)
    issuedBy = legacy || SELF_SERVICE_OWNER
    migrated = true
  }
  let expiresAt = trimmedString(row.expiresAt)
  if (!expiresAt || Number.isNaN(Date.parse(expiresAt))) {
    expiresAt = addCalendarMonths(new Date(createdAt), DEFAULT_DURATION_MONTHS).toISOString()
    migrated = true
  }
  if (
    label !== row.label
    || tokenString !== row.tokenString
    || createdAt !== row.createdAt
    || owner !== row.owner
    || issuedBy !== row.issuedBy
    || expiresAt !== row.expiresAt
  ) migrated = true

  return {
    token: {
      id,
      label,
      tokenString,
      owner,
      issuedBy,
      status: row.status,
      createdAt,
      expiresAt,
    },
    migrated,
  }
}

function parseStored(raw: string): StoredTokens | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return null
    const tokens: DeviceToken[] = []
    let migrated = false
    for (const item of parsed) {
      const normalized = normalizeToken(item)
      if (!normalized) {
        migrated = true
        continue
      }
      tokens.push(normalized.token)
      if (normalized.migrated) migrated = true
    }
    return { tokens, migrated }
  }
  catch {
    return null
  }
}

interface StoredRead {
  tokens: DeviceToken[]
  shouldPublish: boolean
}

function readStored(): StoredRead {
  if (typeof localStorage === 'undefined') {
    return { tokens: seedTokens(), shouldPublish: false }
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return { tokens: seedTokens(), shouldPublish: true }
  const parsed = parseStored(raw)
  if (!parsed) return { tokens: seedTokens(), shouldPublish: true }
  return { tokens: parsed.tokens, shouldPublish: parsed.migrated }
}

export const useAdminTokensStore = defineStore('adminTokens', () => {
  const stored = readStored()
  const tokens = ref<DeviceToken[]>(stored.tokens)
  const appBaseURL = useRuntimeConfig().app.baseURL

  function publish() {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens.value))
  }

  function getPairingUrl(tokenString: string): string {
    const path = pairingPath(tokenString, appBaseURL)
    if (typeof window === 'undefined') return path
    return `${window.location.origin}${path}`
  }

  function generateToken(payload: GenerateTokenPayload): DeviceToken | null {
    const label = payload.label.trim()
    const owner = (payload.owner ?? SELF_SERVICE_OWNER).trim()
    const durationMonths = payload.durationMonths ?? DEFAULT_DURATION_MONTHS
    if (!label || !owner || !Number.isFinite(durationMonths) || durationMonths <= 0) return null
    const createdAt = new Date()
    const token: DeviceToken = {
      id: createUuid(),
      label,
      tokenString: createUuid(),
      owner,
      issuedBy: SELF_SERVICE_OWNER,
      status: 'active',
      createdAt: createdAt.toISOString(),
      expiresAt: addCalendarMonths(createdAt, durationMonths).toISOString(),
    }
    tokens.value = [token, ...tokens.value]
    publish()
    return token
  }

  function extendToken(id: string, additionalMonths: number) {
    if (!Number.isFinite(additionalMonths) || additionalMonths <= 0) return
    const current = tokens.value.find(token => token.id === id)
    if (!current || current.status === 'revoked') return
    const now = new Date()
    const expires = new Date(current.expiresAt)
    const base = !Number.isNaN(expires.getTime()) && expires.getTime() > now.getTime() ? expires : now
    const expiresAt = addCalendarMonths(base, additionalMonths).toISOString()
    tokens.value = tokens.value.map(token => (
      token.id === id ? { ...token, expiresAt } : token
    ))
    publish()
  }

  function revokeToken(id: string) {
    const current = tokens.value.find(token => token.id === id)
    if (!current || current.status === 'revoked') return
    tokens.value = tokens.value.map(token => (
      token.id === id ? { ...token, status: 'revoked' } : token
    ))
    publish()
  }

  if (typeof window !== 'undefined' && !listening) {
    listening = true
    window.addEventListener('storage', (event) => {
      const keyCleared = event.key === STORAGE_KEY || event.key === null
      if (event.newValue === null && keyCleared) {
        tokens.value = seedTokens()
        return
      }
      if (event.key !== STORAGE_KEY || event.newValue === null) return
      const next = parseStored(event.newValue)
      if (!next) return
      tokens.value = next.tokens
      if (next.migrated) publish()
    })
  }

  if (stored.shouldPublish) publish()

  return {
    tokens,
    getPairingUrl,
    generateToken,
    extendToken,
    revokeToken,
  }
})
