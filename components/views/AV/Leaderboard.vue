<script setup lang="ts">
import type { LeaderStanding } from '~/stores/leaderboard'

const session = useSessionStore()
const leaderboard = useLeaderboardStore()

const teamBoard = computed(() => session.eventMode === 'teams' || session.eventMode === 'catteams')
const summary = computed(() => leaderboard.summary(session.eventMode))
const ranked = computed(() => leaderboard.standings(session.eventMode))

const podium = computed(() => {
  const [first, second, third] = ranked.value
  const cards: Array<{ standing: LeaderStanding, place: 1 | 2 | 3 }> = []
  if (second) cards.push({ standing: second, place: 2 })
  if (first) cards.push({ standing: first, place: 1 })
  if (third) cards.push({ standing: third, place: 3 })
  return cards
})

const rest = computed(() => ranked.value.slice(3))
const restRows = computed(() => Math.max(1, Math.ceil(rest.value.length / 2)))

const title = computed(() => (teamBoard.value ? 'Top teams' : 'Top players'))
const unit = computed(() => (teamBoard.value ? 'teams' : 'players'))

const subtitle = computed(() => {
  const { questionNumber, scored, total } = summary.value
  const count = `${scored} of ${total} ${unit.value} scored`
  if (questionNumber <= 0) return `No questions scored yet · ${count}`
  return `Updated after Question ${questionNumber} · ${count}`
})

function placeOrder(place: 1 | 2 | 3) {
  if (place === 1) return 'order-1 md:order-2'
  if (place === 2) return 'order-2 md:order-1'
  return 'order-3'
}
</script>

<template>
  <section aria-labelledby="board-title" class="flex h-full min-h-0 flex-col overflow-hidden rounded-card border border-border bg-surface">
    <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 py-5 sm:px-6 sm:pb-6">
      <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 id="board-title" class="m-0 text-xl font-medium leading-7">
          {{ title }}
        </h1>
        <p class="m-0 text-[13px] leading-4 text-muted">
          {{ subtitle }}
        </p>
      </div>

      <p v-if="ranked.length === 0" class="m-0 text-sm leading-5 text-muted">
        No {{ unit }} have scored yet.
      </p>

      <div
        v-else
        class="grid grid-cols-1 items-end gap-3 md:grid-cols-3"
        role="list"
        aria-label="Top three"
      >
        <LeaderboardPodiumCard
          v-for="card in podium"
          :key="card.standing.id"
          :standing="card.standing"
          :place="card.place"
          :class="placeOrder(card.place)"
          role="listitem"
        />
      </div>

      <ol
        v-if="rest.length"
        class="rest-list"
        :style="{ '--lb-rows': restRows }"
        :aria-label="`Ranks 4 through ${ranked.length}`"
      >
        <LeaderboardStandingRow
          v-for="standing in rest"
          :key="standing.id"
          :standing="standing"
        />
      </ol>
    </div>
  </section>
</template>

<style scoped>
.rest-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 1024px) {
  .rest-list {
    grid-auto-flow: column;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: repeat(var(--lb-rows), auto);
    column-gap: 16px;
  }
}
</style>
