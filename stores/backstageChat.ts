export type CrewRole = 'av' | 'pm' | 'mod' | 'fac'

export interface BackstageMessage {
  id: number
  crew: CrewRole
  author: string
  time: string
  text: string
  self: boolean
  alert: boolean
  dividerBefore: boolean
}

export interface QuickReply {
  emoji: string
  label: string
}

export interface ParticipantPreview {
  label: string
  tone: CrewRole | 'extra'
}

const SEED: BackstageMessage[] = [
  {
    id: 1,
    crew: 'pm',
    author: 'Sarah',
    time: '1:42 PM',
    text: 'Run-of-show v3 is posted in Program Flow. Poll timing unchanged.',
    self: false,
    alert: false,
    dividerBefore: false,
  },
  {
    id: 2,
    crew: 'av',
    author: 'Mike',
    time: '1:44 PM',
    text: 'Audience app is up — 342 devices connected. Poll screen is ready on my side.',
    self: true,
    alert: false,
    dividerBefore: false,
  },
  {
    id: 3,
    crew: 'fac',
    author: 'Dr. Smith',
    time: '1:45 PM',
    text: 'Thanks, I’ll be at the lectern in five.',
    self: false,
    alert: false,
    dividerBefore: false,
  },
  {
    id: 4,
    crew: 'mod',
    author: 'Dr. Adams',
    time: '1:51 PM',
    text: 'Q&A queue is open. I’ll forward the top-voted questions to Dr. Smith.',
    self: true,
    alert: false,
    dividerBefore: false,
  },
  {
    id: 5,
    crew: 'av',
    author: 'Mike',
    time: '1:58 PM',
    text: '2 minutes to live',
    self: true,
    alert: true,
    dividerBefore: false,
  },
  {
    id: 6,
    crew: 'pm',
    author: 'Sarah',
    time: '2:00 PM',
    text: 'Q&A starting now',
    self: false,
    alert: false,
    dividerBefore: true,
  },
]

const QUICK_REPLIES: QuickReply[] = [
  { emoji: '👍', label: 'Thumbs up' },
  { emoji: '👏', label: 'Applause' },
  { emoji: '✅', label: 'Done' },
  { emoji: '⏱️', label: 'Need more time' },
  { emoji: '🎤', label: 'Mic check' },
  { emoji: '🙏', label: 'Thanks' },
]

const PARTICIPANTS: ParticipantPreview[] = [
  { label: 'S', tone: 'pm' },
  { label: 'A', tone: 'mod' },
  { label: 'D', tone: 'fac' },
  { label: '+5', tone: 'extra' },
]

function formatTime(date: Date) {
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const hour = (hours % 12) || 12
  const suffix = hours < 12 ? 'AM' : 'PM'
  return `${hour}:${minutes} ${suffix}`
}

let nextId = SEED.length + 1

export const useBackstageChatStore = defineStore('backstage-chat', () => {
  const messages = ref<BackstageMessage[]>(SEED.map(message => ({ ...message })))

  function post(text: string, crew: CrewRole, author: string) {
    const trimmed = text.trim()
    if (!trimmed) return false
    messages.value.push({
      id: nextId,
      crew,
      author,
      time: formatTime(new Date()),
      text: trimmed,
      self: true,
      alert: false,
      dividerBefore: false,
    })
    nextId += 1
    return true
  }

  return {
    messages,
    quickReplies: QUICK_REPLIES,
    participants: PARTICIPANTS,
    participantCount: 8,
    post,
  }
})
