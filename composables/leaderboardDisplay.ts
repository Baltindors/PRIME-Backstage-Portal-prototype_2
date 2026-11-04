import type { LeaderKind } from '~/stores/leaderboard'

export function formatLeaderScore(value: number) {
  return value.toLocaleString('en-US')
}

export function formatLeaderGain(value: number) {
  return `+${value.toLocaleString('en-US')} pts`
}

export function formatLeaderMove(movement: number) {
  if (movement > 0) return `▲ ${movement}`
  if (movement < 0) return `▼ ${Math.abs(movement)}`
  return '—'
}

export function leaderMoveLabel(movement: number) {
  if (movement > 0) return `up ${movement}`
  if (movement < 0) return `down ${Math.abs(movement)}`
  return 'no change'
}

export function leaderMark(name: string, badge?: string) {
  return badge || name.charAt(0)
}

export function leaderMarkClass(kind: LeaderKind) {
  if (kind === 'onsite') return 'bg-[#F2E3C6] text-[#3A2A00]'
  if (kind === 'virtual') return 'bg-[#CCE8E5] text-[#00201E]'
  return 'bg-[#DCE2F9] text-[#141B2C]'
}
