<script setup lang="ts">
import AudienceQA from '~/components/views/AV/AudienceQA.vue'
import BackstageChat from '~/components/views/AV/BackstageChat.vue'
import Leaderboard from '~/components/views/AV/Leaderboard.vue'
import MasterTimers from '~/components/views/AV/MasterTimers.vue'
import PollingControl from '~/components/views/AV/PollingControl.vue'
import ProgramFlow from '~/components/views/AV/ProgramFlow.vue'
import SlideDeck from '~/components/views/AV/SlideDeck.vue'
import CategoriesGame from '~/components/views/CategoriesGame.vue'

definePageMeta({ layout: 'portal' })

const session = useSessionStore()
</script>

<template>
  <div class="h-full min-h-0">
    <MasterTimers v-if="session.activeTab === 'master-timers'" />
    <PollingControl v-else-if="session.activeTab === 'poll-triggers' || session.activeTab === 'trivia-polls'" />
    <AudienceQA v-else-if="session.activeTab === 'active-qa'" />
    <Leaderboard v-else-if="session.activeTab === 'leaderboard'" />
    <SlideDeck v-else-if="session.activeTab === 'slide-deck'" />
    <ProgramFlow v-else-if="session.activeTab === 'program-flow'" />
    <BackstageChat v-else-if="session.activeTab === 'backstage-chat'" />
    <CategoriesGame v-else-if="session.activeTab === 'game-board'" />
  </div>
</template>
