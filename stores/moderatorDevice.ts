import type { DeviceToken } from '~/stores/adminTokens'
import { displayStatus } from '~/stores/adminTokens'

export type DeviceAuthReason = 'missing' | 'not-found' | 'revoked' | 'expired'

export type PairDeviceResult =
  | { ok: true, token: DeviceToken }
  | { ok: false, reason: DeviceAuthReason }

const STORAGE_KEY = 'prime-moderator-device-token'
const CHECK_INTERVAL_MS = 10_000

interface CheckHost {
  __primeModeratorDeviceCheck?: number
}

let listening = false

function clearCheckTimer() {
  const host = globalThis as CheckHost
  if (host.__primeModeratorDeviceCheck === undefined) return
  clearInterval(host.__primeModeratorDeviceCheck)
  host.__primeModeratorDeviceCheck = undefined
}

function readPaired(): string {
  if (typeof localStorage === 'undefined') return ''
  return localStorage.getItem(STORAGE_KEY)?.trim() ?? ''
}

function extractToken(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const looksLikeUrl = /^https?:\/\//i.test(trimmed) || trimmed.startsWith('/') || trimmed.includes('?token=')
  if (!looksLikeUrl) return trimmed
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    return new URL(trimmed, base).searchParams.get('token')?.trim() ?? ''
  }
  catch {
    return ''
  }
}

function classify(tokenString: string, tokens: DeviceToken[]): PairDeviceResult {
  const value = tokenString.trim()
  if (!value) return { ok: false, reason: 'missing' }
  const token = tokens.find(item => item.tokenString === value)
  if (!token) return { ok: false, reason: 'not-found' }
  const status = displayStatus(token)
  if (status === 'revoked') return { ok: false, reason: 'revoked' }
  if (status === 'expired') return { ok: false, reason: 'expired' }
  return { ok: true, token }
}

export const useModeratorDeviceStore = defineStore('moderatorDevice', () => {
  const admin = useAdminTokensStore()
  const pairedToken = ref(readPaired())
  const checkedAt = ref(Date.now())

  const authorization = computed((): PairDeviceResult => {
    void checkedAt.value
    return classify(pairedToken.value, admin.tokens)
  })

  const isAuthorized = computed(() => authorization.value.ok)

  function publish(value: string | null) {
    if (typeof localStorage === 'undefined') return
    if (value) localStorage.setItem(STORAGE_KEY, value)
    else localStorage.removeItem(STORAGE_KEY)
  }

  function pairDevice(input: string): PairDeviceResult {
    const result = classify(extractToken(input), admin.tokens)
    if (!result.ok) return result
    pairedToken.value = result.token.tokenString
    publish(result.token.tokenString)
    return result
  }

  function unpairDevice() {
    pairedToken.value = ''
    publish(null)
  }

  function pairFirstActiveToken(): PairDeviceResult {
    const token = admin.tokens.find((item) => {
      const status = displayStatus(item)
      return status === 'active' || status === 'expiring'
    })
    if (!token) return { ok: false, reason: 'not-found' }
    return pairDevice(token.tokenString)
  }

  function refreshCheckedAt() {
    checkedAt.value = Date.now()
  }

  if (import.meta.client && !listening) {
    listening = true
    window.addEventListener('storage', (event) => {
      if (event.key !== null && event.key !== STORAGE_KEY) return
      pairedToken.value = event.key === null ? '' : (event.newValue?.trim() ?? '')
    })
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refreshCheckedAt()
    })
    clearCheckTimer()
    ;(globalThis as CheckHost).__primeModeratorDeviceCheck = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshCheckedAt()
    }, CHECK_INTERVAL_MS)
  }

  import.meta.hot?.dispose(() => {
    clearCheckTimer()
  })

  return {
    authorization,
    isAuthorized,
    pairDevice,
    unpairDevice,
    pairFirstActiveToken,
    refreshCheckedAt,
  }
})
