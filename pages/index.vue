<script setup lang="ts">
import type { EventMode } from '~/stores/session'

useHead({ title: 'Select Event Mode · PRIME Backstage Portal' })

const session = useSessionStore()

const modes: Array<{
  mode: EventMode
  title: string
  badge: string
  description: string
  features: string[]
  icon: 'person' | 'groups' | 'shapes'
  disabled: boolean
}> = [
  {
    mode: 'individual',
    title: 'ConnectED Individual',
    badge: 'Standard',
    description: 'Standard individual polling. Each attendee answers on their own device and scores on their own.',
    features: ['Individual polls & trivia', 'Player leaderboard', 'Audience Q&A'],
    icon: 'person',
    disabled: false,
  },
  {
    mode: 'teams',
    title: 'ConnectED Teams',
    badge: 'Hybrid',
    description: 'Hybrid team-based gamification. Attendees join teams, chat privately and answer together.',
    features: ['Team polls, trivia & team chat', 'Team leaderboard', 'Moderator Teams Monitor'],
    icon: 'groups',
    disabled: false,
  },
  {
    mode: 'categories',
    title: 'ConnectED Categories – Individuals',
    badge: 'Buzzer',
    description: 'Jeopardy-style individual gamification. Players pick categories and buzz in to answer.',
    features: ['Category board with point values', 'Buzz-in · wrong answers lose points', 'Individual leaderboard'],
    icon: 'shapes',
    disabled: false,
  },
  {
    mode: 'catteams',
    title: 'ConnectED Categories Teams',
    badge: 'Team vote',
    description: 'Team consensus board play. The controlling team votes on the category; every team answers together.',
    features: ['Team vote picks category & value', 'All teams answer · 50% correct rule', 'Team leaderboard & Teams Monitor'],
    icon: 'groups',
    disabled: false,
  },
]

function onContinue(mode: EventMode) {
  const selected = modes.find(item => item.mode === mode)
  if (!selected || selected.disabled) return
  session.setEventMode(mode)
  return navigateTo('/join')
}
</script>

<template>
  <main class="mx-auto flex min-h-screen w-full max-w-[1194px] flex-col justify-center gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:px-9">
    <header class="flex flex-col items-center gap-2 text-center">
      <p class="text-xs font-medium leading-4 tracking-[0.12em] text-muted">
        PRIME EDUCATION · BACKSTAGE PORTAL
      </p>
      <h1 class="text-2xl font-normal leading-8 sm:text-[28px] sm:leading-9">
        Select Event Mode
      </h1>
      <p class="text-base leading-6 tracking-[0.03em] text-muted">
        Choose the event type for this session. You’ll enter your activity code next.
      </p>
    </header>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <EventModeCard
        v-for="mode in modes"
        :key="mode.mode"
        v-bind="mode"
        @continue="onContinue"
      />
    </div>
  </main>
</template>
