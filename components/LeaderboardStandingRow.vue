<script setup lang="ts">
import type { LeaderStanding } from '~/stores/leaderboard'

const props = defineProps<{
  standing: LeaderStanding
}>()

const label = computed(() => {
  const members = props.standing.members ? `, ${props.standing.members} members` : ''
  return `Rank ${props.standing.rank}, ${props.standing.name}${members}, ${formatLeaderScore(props.standing.score)} points, gained ${props.standing.gain}, ${leaderMoveLabel(props.standing.movement)}`
})
</script>

<template>
  <li class="flex min-h-14 items-center gap-3 rounded-xl bg-[#F8F9FA] px-3.5" :aria-label="label">
    <span class="w-7 shrink-0 text-base font-medium tabular-nums text-muted">
      {{ standing.rank }}
    </span>
    <span
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
      :class="leaderMarkClass(standing.kind)"
      aria-hidden="true"
    >
      {{ leaderMark(standing.name, standing.badge) }}
    </span>
    <span class="min-w-0 flex-1 truncate text-[15px] font-medium leading-5">
      {{ standing.name }}
    </span>
    <span v-if="standing.members" class="hidden shrink-0 text-xs text-muted xl:inline">
      {{ standing.members }} members
    </span>
    <span
      class="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[13px] tabular-nums"
      :class="standing.gain > 0 ? 'font-bold text-[#146C2E]' : 'font-medium text-[#74777F]'"
    >
      <svg v-if="standing.gain > 0" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 14l5-5 5 5z" />
      </svg>
      {{ formatLeaderGain(standing.gain) }}
    </span>
    <span class="w-16 shrink-0 text-right text-base font-medium tabular-nums">
      {{ formatLeaderScore(standing.score) }}
    </span>
    <span class="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-[#5D6066]">
      {{ formatLeaderMove(standing.movement) }}
    </span>
  </li>
</template>
