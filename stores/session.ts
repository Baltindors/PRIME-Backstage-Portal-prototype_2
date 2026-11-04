export type EventMode = 'individual' | 'teams' | 'categories' | 'catteams'

export type RoleId = 'av-tech' | 'moderator' | 'faculty' | 'program-manager'

export type TabId =
  | 'master-timers'
  | 'program-flow'
  | 'slide-deck'
  | 'game-board'
  | 'poll-triggers'
  | 'active-qa'
  | 'leaderboard'
  | 'trivia-polls'
  | 'backstage-chat'
  | 'live-question'
  | 'rationale'
  | 'speaker-timer'
  | 'audience-analytics'

export type TabLayout = 'single' | 'split' | 'aside'

export interface TabView {
  w: string[]
  layout: TabLayout
}

export interface TabConfig {
  label: string
  view: TabView
}

export interface Role {
  id: RoleId
  title: string
  short: string
  desc: string
  toolsLine: string
  toolCount: number
  tabs: TabId[]
  def: TabId
  over: Partial<Record<TabId, TabView>>
  tabLabels?: Partial<Record<TabId, string>>
  badges?: Partial<Record<TabId, number>>
}

const ACTIVITY_CODE = '123LV26'
const STAFF_CODE = '4747'
const STAFF_ROLE_IDS: RoleId[] = ['av-tech', 'program-manager']

export const TABS: Record<TabId, TabConfig> = {
  'program-flow': { label: 'Program Flow', view: { w: ['cue'], layout: 'single' } },
  'slide-deck': { label: 'Slide Deck', view: { w: ['slides'], layout: 'single' } },
  'game-board': { label: 'Game Board', view: { w: ['grid'], layout: 'single' } },
  'poll-triggers': { label: 'Poll Triggers', view: { w: ['polls'], layout: 'single' } },
  'active-qa': { label: 'Active Q&A', view: { w: ['queue', 'approved'], layout: 'aside' } },
  'leaderboard': { label: 'Leaderboard', view: { w: ['leaderboard'], layout: 'single' } },
  'trivia-polls': { label: 'Trivia Polls', view: { w: ['trivia'], layout: 'single' } },
  'backstage-chat': { label: 'Backstage Chat', view: { w: ['chat'], layout: 'single' } },
  'live-question': { label: 'Live Question', view: { w: ['question'], layout: 'single' } },
  'rationale': { label: 'Rationale & Citations', view: { w: ['rationale', 'citations'], layout: 'aside' } },
  'speaker-timer': { label: 'Speaker Timer', view: { w: ['speaker'], layout: 'single' } },
  'audience-analytics': { label: 'Audience Analytics', view: { w: ['analytics'], layout: 'single' } },
  'master-timers': { label: 'Master Stage Timers', view: { w: ['countdown'], layout: 'single' } },
}

const ALL_TABS = Object.keys(TABS) as TabId[]

export const ROLES: Role[] = [
  {
    id: 'av-tech',
    title: 'AV Tech / Stage Producer',
    short: 'AV Tech',
    desc: 'Control the master stage timers, run polls and the leaderboard, and drive slides.',
    toolsLine: 'Master Timers · Polling control · Q&A · Leaderboard · Slides · Flow · Chat',
    toolCount: 7,
    tabs: ['master-timers', 'poll-triggers', 'active-qa', 'leaderboard', 'slide-deck', 'program-flow', 'backstage-chat'],
    def: 'master-timers',
    over: {},
    tabLabels: {
      'poll-triggers': 'Polling & Gamification (Active Control)',
      'active-qa': 'Audience Q&A',
    },
    badges: {
      'backstage-chat': 3,
    },
  },
  {
    id: 'moderator',
    title: 'Session Moderator',
    short: 'Moderator',
    desc: 'Run live polls and trivia, triage audience Q&A and manage the leaderboard.',
    toolsLine: 'Audience Q&A · Polling control · Leaderboard · Slides · Flow · Chat',
    toolCount: 6,
    tabs: ['active-qa', 'trivia-polls', 'backstage-chat'],
    def: 'active-qa',
    over: {},
    tabLabels: {
      'trivia-polls': 'Polling & Gamification (Active Control)',
    },
  },
  {
    id: 'faculty',
    title: 'Medical Faculty / Speaker',
    short: 'Faculty',
    desc: 'Answer audience questions, review polls and follow the run of show.',
    toolsLine: 'Faculty Q&A · Polling (view) · Slides · Program Flow · Chat',
    toolCount: 5,
    tabs: ['live-question', 'rationale', 'speaker-timer'],
    def: 'live-question',
    over: { 'live-question': { w: ['question', 'rationale'], layout: 'split' } },
  },
  {
    id: 'program-manager',
    title: 'CME Program Manager',
    short: 'Program Manager',
    desc: 'Manage attendees, take event notes, send the end-of-program report and view every tool.',
    toolsLine: 'Attendees · Notes & Reporting · Q&A · Polls · Slides · Flow · Chat',
    toolCount: 7,
    tabs: [...ALL_TABS],
    def: 'program-flow',
    over: { 'program-flow': { w: ['cue', 'chat'], layout: 'split' } },
  },
]

const EVENT_MODES: EventMode[] = ['individual', 'teams', 'categories', 'catteams']
const ROLE_IDS: RoleId[] = ['av-tech', 'moderator', 'faculty', 'program-manager']
const SESSION_KEY = 'prime-portal-session'

interface PersistedSession {
  eventMode: EventMode | null
  activityCode: string | null
  roleId: RoleId | null
  userName: string
  staffCode: string
  sessionLive: boolean
  sessionTimer: number
  timerPaused: boolean
  activeTab: TabId | null
}

function findRole(roleId: string) {
  return ROLES.find(role => role.id === roleId) ?? null
}

function isEventMode(value: unknown): value is EventMode {
  return typeof value === 'string' && EVENT_MODES.includes(value as EventMode)
}

function isRoleId(value: unknown): value is RoleId {
  return typeof value === 'string' && ROLE_IDS.includes(value as RoleId)
}

function isTabId(value: unknown): value is TabId {
  return typeof value === 'string' && value in TABS
}

function readPersistedSession(): PersistedSession | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedSession>
    const role = isRoleId(parsed.roleId) ? findRole(parsed.roleId) : null
    const activeTab = isTabId(parsed.activeTab) && role?.tabs.includes(parsed.activeTab)
      ? parsed.activeTab
      : role?.def ?? null
    return {
      eventMode: isEventMode(parsed.eventMode) ? parsed.eventMode : null,
      activityCode: parsed.activityCode === ACTIVITY_CODE ? ACTIVITY_CODE : null,
      roleId: role?.id ?? null,
      userName: typeof parsed.userName === 'string' ? parsed.userName : '',
      staffCode: typeof parsed.staffCode === 'string' ? parsed.staffCode : '',
      sessionLive: parsed.sessionLive === true,
      sessionTimer: typeof parsed.sessionTimer === 'number' && parsed.sessionTimer >= 0 ? parsed.sessionTimer : 0,
      timerPaused: parsed.timerPaused === true,
      activeTab,
    }
  }
  catch {
    return null
  }
}

function timerFor(roleId: RoleId) {
  if (roleId === 'faculty') return 1200
  if (roleId === 'av-tech') return 44 * 60 + 39
  return 300
}

export const useSessionStore = defineStore('session', () => {
  const saved = readPersistedSession()
  const eventMode = ref<EventMode | null>(saved?.eventMode ?? null)
  const activityCode = ref<string | null>(saved?.activityCode ?? null)
  const selectedRole = ref<Role | null>(saved?.roleId ? findRole(saved.roleId) : null)
  const userName = ref(saved?.userName ?? '')
  const staffCode = ref(saved?.staffCode ?? '')
  const sessionLive = ref(saved?.sessionLive ?? false)
  const sessionTimer = ref(saved?.sessionTimer ?? 0)
  const timerPaused = ref(saved?.timerPaused ?? false)
  const activeTab = ref<TabId | null>(saved?.activeTab ?? null)

  function setEventMode(mode: EventMode) {
    eventMode.value = mode
  }

  function validateActivityCode(code: string) {
    const accepted = code === ACTIVITY_CODE
    activityCode.value = accepted ? code : null
    return accepted
  }

  function setRoleAndUser(roleId: string, name: string, code: string) {
    const role = findRole(roleId)
    const trimmedName = name.trim()
    const needsStaffCode = role !== null && STAFF_ROLE_IDS.includes(role.id)
    if (!role || !trimmedName || (needsStaffCode && code !== STAFF_CODE)) {
      return false
    }

    selectedRole.value = role
    userName.value = trimmedName
    staffCode.value = code
    sessionLive.value = false
    sessionTimer.value = timerFor(role.id)
    timerPaused.value = false
    activeTab.value = role.def
    return true
  }

  function adjustSessionTimer(seconds: number) {
    sessionTimer.value = Math.max(0, sessionTimer.value + seconds)
    if (sessionTimer.value > 0) sessionLive.value = true
  }

  function setTimerPaused(paused: boolean) {
    timerPaused.value = paused
  }

  function restartSessionTimer(seconds: number) {
    sessionTimer.value = Math.max(0, seconds)
    timerPaused.value = false
    sessionLive.value = true
  }

  function logout() {
    eventMode.value = null
    activityCode.value = null
    selectedRole.value = null
    userName.value = ''
    staffCode.value = ''
    sessionLive.value = false
    sessionTimer.value = 0
    timerPaused.value = false
    activeTab.value = null
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(SESSION_KEY)
  }

  watch(
    () => ({
      eventMode: eventMode.value,
      activityCode: activityCode.value,
      roleId: selectedRole.value?.id ?? null,
      userName: userName.value,
      staffCode: staffCode.value,
      sessionLive: sessionLive.value,
      sessionTimer: sessionTimer.value,
      timerPaused: timerPaused.value,
      activeTab: activeTab.value,
    }),
    (state) => {
      if (typeof sessionStorage === 'undefined') return
      if (!state.eventMode && !state.activityCode && !state.roleId) {
        sessionStorage.removeItem(SESSION_KEY)
        return
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state))
    },
  )

  return {
    eventMode,
    activityCode,
    selectedRole,
    userName,
    staffCode,
    sessionLive,
    sessionTimer,
    timerPaused,
    activeTab,
    setEventMode,
    validateActivityCode,
    setRoleAndUser,
    adjustSessionTimer,
    setTimerPaused,
    restartSessionTimer,
    logout,
  }
})
