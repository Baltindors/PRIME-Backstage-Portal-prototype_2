<script setup lang="ts">
import type { BackstageMessage, CrewRole, ParticipantPreview } from '~/stores/backstageChat'
import type { RoleId } from '~/stores/session'

interface CrewStyle {
  label: string
  badge: string
}

interface YouStyle {
  crew: CrewRole
  label: string
  chip: string
  ink: string
  avatar: string
}

const CREW: Record<CrewRole, CrewStyle> = {
  av: { label: 'AV Tech', badge: 'bg-[#CCE8E5] text-[#00201E]' },
  pm: { label: 'Program Mgr', badge: 'bg-[#EADDFF] text-[#21005D]' },
  mod: { label: 'Moderator', badge: 'bg-[#FFDCC2] text-[#2E1500]' },
  fac: { label: 'Faculty', badge: 'bg-[#DAE2FF] text-[#001848]' },
}

const YOU: Record<RoleId, YouStyle> = {
  'av-tech': {
    crew: 'av',
    label: 'AV Tech',
    chip: 'bg-[#CCE8E5] text-[#00201E]',
    ink: 'text-[#00201E]',
    avatar: 'bg-[#006A63]',
  },
  moderator: {
    crew: 'mod',
    label: 'Moderator',
    chip: 'bg-[#FFDCC2] text-[#2E1500]',
    ink: 'text-[#2E1500]',
    avatar: 'bg-[#8B4A00]',
  },
  faculty: {
    crew: 'fac',
    label: 'Faculty',
    chip: 'bg-[#DAE2FF] text-[#001848]',
    ink: 'text-[#001848]',
    avatar: 'bg-[#0A56D0]',
  },
  'program-manager': {
    crew: 'pm',
    label: 'Program Mgr',
    chip: 'bg-[#EADDFF] text-[#21005D]',
    ink: 'text-[#21005D]',
    avatar: 'bg-[#6750A4]',
  },
}

const EXTRA_TONE = 'bg-[#ECEEF2] text-[#44474E]'

const session = useSessionStore()
const chat = useBackstageChatStore()
const draft = ref('')
const thread = ref<HTMLElement | null>(null)

const you = computed(() => {
  const role = session.selectedRole
  if (!role) return null
  return YOU[role.id]
})

const initials = computed(() => {
  return session.userName
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(part => part.length > 0)
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

function toneClass(person: ParticipantPreview) {
  if (person.tone === 'extra') return EXTRA_TONE
  return CREW[person.tone].badge
}

function initial(name: string) {
  return name.replace('Dr. ', '').charAt(0)
}

function bubbleClass(message: BackstageMessage) {
  const corner = message.self ? 'rounded-[18px_4px_18px_18px]' : 'rounded-[4px_18px_18px_18px]'
  if (message.alert) return `${corner} bg-[#FFDAD6] font-medium text-[#410002]`
  if (message.self) return `${corner} bg-primary text-white`
  return `${corner} bg-[#ECEEF2] text-on-surface`
}

function scrollToLatest() {
  nextTick(() => {
    const el = thread.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function speak(text: string) {
  const speaker = you.value
  if (!speaker) return false
  return chat.post(text, speaker.crew, session.userName)
}

function submit() {
  if (speak(draft.value)) draft.value = ''
}

onMounted(scrollToLatest)
watch(() => chat.messages.length, scrollToLatest)
</script>

<template>
  <section aria-labelledby="chat-title" class="flex h-full min-h-[640px] flex-col overflow-hidden rounded-card border border-border bg-surface xl:min-h-0">
    <header class="flex min-h-[72px] shrink-0 flex-wrap items-center gap-x-3.5 gap-y-3 border-b border-divider px-4 py-3 sm:px-6">
      <div class="flex min-w-0 flex-col">
        <h1 id="chat-title" class="m-0 text-lg font-medium leading-6">
          Backstage Chat
        </h1>
        <p class="m-0 text-xs leading-4 text-muted">
          Event-wide · visible to all crew roles, never to attendees
        </p>
      </div>

      <div class="flex items-center gap-2 sm:ml-3">
        <div class="flex" aria-hidden="true">
          <span
            v-for="(person, index) in chat.participants"
            :key="person.label"
            class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold"
            :class="[toneClass(person), index > 0 ? '-ml-2' : '']"
          >
            {{ person.label }}
          </span>
        </div>
        <span class="text-sm leading-5 text-muted">
          <strong class="font-bold text-on-surface">{{ chat.participantCount }}</strong> participants
        </span>
      </div>

      <span
        v-if="you"
        class="ml-auto inline-flex h-10 min-w-0 max-w-full items-center gap-2 rounded-full py-0 pl-1 pr-3.5 text-sm font-medium"
        :class="you.chip"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          :class="you.avatar"
          aria-hidden="true"
        >
          {{ initials }}
        </span>
        <span class="min-w-0 truncate">You: {{ session.userName }}</span>
        <span class="inline-flex h-5 shrink-0 items-center rounded-md bg-white px-2 text-[11px] font-bold tracking-[0.02em]" :class="you.ink">
          {{ you.label }}
        </span>
      </span>
    </header>

    <div ref="thread" class="min-h-0 flex-1 overflow-auto px-4 py-4 sm:px-6">
      <div class="flex flex-col gap-3.5" role="log" aria-live="polite" aria-relevant="additions" aria-label="Messages">
        <template v-for="message in chat.messages" :key="message.id">
          <div
            v-if="message.dividerBefore"
            class="flex items-center gap-3 text-xs font-medium tracking-[0.04em] text-error"
          >
            <span class="h-px flex-1 bg-[#FFB4AB]" />
            New messages
            <span class="h-px flex-1 bg-[#FFB4AB]" />
          </div>

          <div
            class="flex max-w-[90%] items-end gap-2.5 sm:max-w-[72%]"
            :class="message.self ? 'flex-row-reverse self-end' : 'self-start'"
          >
            <span
              v-if="!message.self"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
              :class="CREW[message.crew].badge"
              aria-hidden="true"
            >
              {{ initial(message.author) }}
            </span>
            <div class="flex min-w-0 flex-col gap-1">
              <div class="flex items-center gap-2" :class="message.self ? 'justify-end' : ''">
                <span class="inline-flex h-5 items-center rounded-md px-2 text-[11px] font-bold tracking-[0.02em]" :class="CREW[message.crew].badge">
                  {{ CREW[message.crew].label }}
                </span>
                <span class="text-[13px] font-medium">{{ message.self ? 'You' : message.author }}</span>
                <span class="text-xs text-subtle">{{ message.time }}</span>
              </div>
              <p
                class="m-0 px-3.5 py-2.5 text-base leading-[23px]"
                :class="bubbleClass(message)"
              >
                {{ message.text }}
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <form class="flex shrink-0 flex-col gap-3 border-t border-divider px-4 py-3 sm:px-6 sm:pb-5" @submit.prevent="submit">
      <div role="group" aria-label="Quick reactions" class="flex flex-wrap items-center gap-2">
        <span class="mr-1 text-xs leading-4 text-muted">Quick reply</span>
        <button
          v-for="reply in chat.quickReplies"
          :key="reply.label"
          type="button"
          class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-[22px] leading-none hover:border-outline hover:bg-hover-fill focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary"
          :aria-label="`Send ${reply.label}`"
          @click="speak(reply.emoji)"
        >
          {{ reply.emoji }}
        </button>
      </div>
      <div class="flex items-center gap-3">
        <label class="sr-only" for="crew-message">Message the crew</label>
        <input
          id="crew-message"
          v-model="draft"
          type="text"
          placeholder="Message the crew…"
          autocomplete="off"
          class="h-14 min-w-0 flex-1 rounded-full border border-outline bg-surface px-4 text-base text-on-surface outline-none focus:border-2 focus:border-primary focus:px-[15px]"
        >
        <button
          type="submit"
          class="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-pressed focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Send message"
        >
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </form>
  </section>
</template>
