<script setup lang="ts">
import CheckInKiosk from '~/components/views/PM/CheckInKiosk.vue'
import LiveRoster from '~/components/views/PM/LiveRoster.vue'
import QuickRegistration from '~/components/views/PM/QuickRegistration.vue'

const kioskOpen = ref(false)
</script>

<template>
  <div class="h-full min-h-0" :inert="kioskOpen">
    <div class="grid h-full min-h-[720px] grid-cols-1 gap-4 xl:min-h-0 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-6">
      <QuickRegistration @open-kiosk="kioskOpen = true" />
      <LiveRoster />
    </div>
  </div>
  <CheckInKiosk v-if="kioskOpen" @close="kioskOpen = false" />
</template>
