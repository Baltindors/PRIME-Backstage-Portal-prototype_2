<script setup lang="ts">
import type { LeaderStanding } from '~/stores/leaderboard'

const props = defineProps<{
  standing: LeaderStanding
  place: 1 | 2 | 3
}>()

const medals = {
  1: 'bg-[#F2C94C] text-[#3D2E00]',
  2: 'bg-[#C9CDD4] text-[#1A1C1E]',
  3: 'bg-[#D9A27A] text-[#3A1D07]',
} as const

const cardClass = computed(() => (
  props.place === 1
    ? 'border-[#0A56D0] bg-[#DAE2FF]'
    : 'border-[#E1E2EA] bg-[#F8F9FA]'
))

const label = computed(() => {
  const { standing } = props
  const members = standing.members ? `, ${standing.members} members` : ''
  return `Rank ${standing.rank}, ${standing.name}${members}, ${formatLeaderScore(standing.score)} points, gained ${standing.gain}, ${leaderMoveLabel(standing.movement)}`
})
</script>

<template>
  <article
    class="flex flex-col items-center gap-1.5 rounded-2xl border px-[18px] py-[18px] text-center"
    :class="cardClass"
    :aria-label="label"
  >
    <span
      class="flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold"
      :class="medals[place]"
      aria-hidden="true"
    >
      {{ place }}
    </span>
    <span class="text-lg font-medium leading-6">{{ standing.name }}</span>
    <span v-if="standing.members" class="text-xs leading-4 text-muted">
      {{ standing.members }} members
    </span>
    <span class="text-[30px] font-medium leading-9 tabular-nums">
      {{ formatLeaderScore(standing.score) }}
    </span>
    <span class="flex items-center gap-2.5">
      <span
        class="inline-flex items-center gap-0.5 whitespace-nowrap text-[13px] font-bold tabular-nums"
        :class="standing.gain > 0 ? 'text-[#146C2E]' : 'font-medium text-[#74777F]'"
      >
        <svg v-if="standing.gain > 0" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 14l5-5 5 5z" />
        </svg>
        {{ formatLeaderGain(standing.gain) }}
      </span>
      <span class="text-xs font-medium tabular-nums text-[#5D6066]">
        {{ formatLeaderMove(standing.movement) }}
      </span>
    </span>
  </article>
</template>
