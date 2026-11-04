import type { EventMode } from '~/stores/session'

export const LEADERBOARD_LIMIT = 50

export type LeaderKind = 'player' | 'onsite' | 'virtual'

export interface LeaderEntry {
  id: string
  name: string
  score: number
  gain: number
  movement: number
  kind: LeaderKind
  members?: number
  badge?: string
}

export interface LeaderStanding extends LeaderEntry {
  rank: number
}

interface BoardSnapshot {
  questionNumber: number
  participantTotal: number
  entries: LeaderEntry[]
}

export interface LeaderboardSummary {
  questionNumber: number
  scored: number
  total: number
  unit: 'players' | 'teams'
}

const FEATURED_PLAYERS: Array<Omit<LeaderEntry, 'id' | 'kind'>> = [
  { name: 'CardioCatalyst', score: 3850, gain: 400, movement: 1 },
  { name: 'NeuroNinja', score: 3720, gain: 350, movement: -1 },
  { name: 'RxRanger', score: 3410, gain: 400, movement: 2 },
  { name: 'DrBetaBlocker', score: 3280, gain: 300, movement: 0 },
  { name: 'InsulinPro', score: 3150, gain: 0, movement: -2 },
  { name: 'StatScholar', score: 2990, gain: 400, movement: 3 },
  { name: 'VitalSigns', score: 2870, gain: 250, movement: 0 },
  { name: 'ClinicalPearl', score: 2760, gain: 400, movement: 1 },
  { name: 'MedStudent22', score: 2610, gain: 0, movement: -2 },
  { name: 'GuidelineGuru', score: 2540, gain: 300, movement: 1 },
]

const TEAM_SEED: Array<Omit<LeaderEntry, 'id'>> = [
  { name: 'Team Gorilla - Table 1', kind: 'onsite', members: 8, badge: '1', score: 2400, gain: 400, movement: 1 },
  { name: 'Virtual Team 3', kind: 'virtual', members: 7, badge: 'V3', score: 2100, gain: 350, movement: 2 },
  { name: 'Team Eagle - Table 3', kind: 'onsite', members: 9, badge: '3', score: 2050, gain: 300, movement: -1 },
  { name: 'Team Tiger - Table 2', kind: 'onsite', members: 8, badge: '2', score: 1900, gain: 400, movement: 1 },
  { name: 'Virtual Team 1', kind: 'virtual', members: 6, badge: 'V1', score: 1750, gain: 0, movement: -2 },
  { name: 'Team Bear - Table 6', kind: 'onsite', members: 9, badge: '6', score: 1700, gain: 250, movement: 0 },
  { name: 'Team Wolf - Table 4', kind: 'onsite', members: 7, badge: '4', score: 1450, gain: 300, movement: 1 },
  { name: 'Virtual Team 2', kind: 'virtual', members: 6, badge: 'V2', score: 1300, gain: 0, movement: -1 },
  { name: 'Team Lion - Table 5', kind: 'onsite', members: 8, badge: '5', score: 1100, gain: 200, movement: 0 },
]

function playerBoard(): BoardSnapshot {
  return {
    questionNumber: 3,
    participantTotal: 342,
    entries: [...FEATURED_PLAYERS.map((player, index) => ({
      ...player,
      id: `player-${index + 1}`,
      kind: 'player' as const,
    })), ...extraPlayers()],
  }
}

function teamBoard(): BoardSnapshot {
  return {
    questionNumber: 3,
    participantTotal: TEAM_SEED.length,
    entries: TEAM_SEED.map((team, index) => ({
      ...team,
      id: `team-${index + 1}`,
    })),
  }
}

function usesTeams(mode: EventMode | null) {
  return mode === 'teams' || mode === 'catteams'
}

function ranked(entries: LeaderEntry[]) {
  return entries
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, LEADERBOARD_LIMIT)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}

function cleared(board: BoardSnapshot): BoardSnapshot {
  return {
    ...board,
    questionNumber: 0,
    entries: board.entries.map(entry => ({ ...entry, score: 0, gain: 0, movement: 0 })),
  }
}

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const players = ref<BoardSnapshot>(playerBoard())
  const teams = ref<BoardSnapshot>(teamBoard())

  function snapshot(mode: EventMode | null) {
    return usesTeams(mode) ? teams.value : players.value
  }

  function standings(mode: EventMode | null) {
    return ranked(snapshot(mode).entries)
  }

  function summary(mode: EventMode | null): LeaderboardSummary {
    const board = snapshot(mode)
    return {
      questionNumber: board.questionNumber,
      scored: board.entries.filter(entry => entry.score > 0).length,
      total: board.participantTotal,
      unit: usesTeams(mode) ? 'teams' : 'players',
    }
  }

  function resetFromGame(mode: EventMode | null) {
    if (usesTeams(mode)) teams.value = cleared(teams.value)
    else players.value = cleared(players.value)
  }

  return {
    standings,
    summary,
    resetFromGame,
  }
})

function extraPlayers(): LeaderEntry[] {
  const stems = ['A1C', 'Beta', 'Cortex', 'Dose', 'Endo', 'Flow', 'Gluco', 'Heme', 'Immuno', 'Joint', 'Keto', 'Lipid', 'Macro', 'Onco', 'Pulse', 'Renal', 'Statin']
  const tails = ['Ace', 'Byte', 'Doc', 'Guide', 'Lab', 'Med', 'Note', 'Path', 'Rx', 'Sage', 'Ward', 'MD']
  const gains = [0, 50, 100, 150, 200, 250, 300, 400]
  const moves = [0, 1, -1, 2, -2, 0, 3, -3]
  const entries: LeaderEntry[] = []
  let score = 2480
  for (let index = 0; index < 204; index += 1) {
    entries.push({
      id: `player-${FEATURED_PLAYERS.length + index + 1}`,
      name: `${stems[index % stems.length]}${tails[Math.floor(index / stems.length) % tails.length]}`,
      score,
      gain: gains[index % gains.length] ?? 0,
      movement: moves[index % moves.length] ?? 0,
      kind: 'player',
    })
    score -= 10
  }
  return entries
}
