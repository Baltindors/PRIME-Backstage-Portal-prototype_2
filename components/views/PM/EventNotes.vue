<script setup lang="ts">
import ProgramReport from '~/components/views/PM/ProgramReport.vue'
import SessionNotes from '~/components/views/PM/SessionNotes.vue'
</script>

<template>
  <div class="grid h-full min-h-[720px] grid-cols-1 gap-4 xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-6">
    <SessionNotes />
    <ProgramReport />
  </div>
</template>
