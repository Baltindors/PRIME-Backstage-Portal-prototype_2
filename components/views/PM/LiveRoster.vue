<script setup lang="ts">
import type { AttendeeStatus } from '~/stores/attendees'

const attendees = useAttendeesStore()

type RosterFilter = 'all' | AttendeeStatus

const query = ref('')
const filter = ref<RosterFilter>('all')

const STATUS: Record<AttendeeStatus, { label: string, chip: string }> = {
  invite: { label: 'Invite Sent', chip: 'bg-[#FFDDB3] text-[#2A1800]' },
  reg: { label: 'Registered', chip: 'bg-[#DAE2FF] text-[#001848]' },
  app: { label: 'App Connected', chip: 'bg-[#C4EED0] text-[#00210B]' },
}

const filters = computed(() => {
  const rows = attendees.attendees
  const options: Array<{ id: RosterFilter, label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'app', label: 'App Connected' },
    { id: 'reg', label: 'Registered' },
    { id: 'invite', label: 'Invite Sent' },
  ]
  return options.map(option => ({
    ...option,
    count: option.id === 'all' ? rows.length : rows.filter(row => row.status === option.id).length,
    pressed: filter.value === option.id,
  }))
})

const shown = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return attendees.attendees.filter((row) => {
    const statusOk = filter.value === 'all' || row.status === filter.value
    const text = `${row.name} ${row.email}`.toLowerCase()
    return statusOk && (!needle || text.includes(needle))
  })
})

function initial(name: string, fresh: boolean) {
  if (fresh && name === 'Pending registration') return '@'
  return name.charAt(0).toUpperCase()
}
</script>

<template>
  <section class="panel flex min-h-0 flex-col overflow-hidden" aria-labelledby="roster-title">
    <div class="flex flex-col gap-3 border-b border-divider px-5 pb-3 pt-[18px]">
      <div class="flex flex-wrap items-center gap-3">
        <h2 id="roster-title" class="m-0 text-lg font-medium leading-6">Live roster</h2>
        <span class="inline-flex items-center gap-1.5 text-xs leading-4 text-muted">
          <span class="h-1.5 w-1.5 rounded-full bg-[#1E8E3E]" aria-hidden="true" />
          Syncing live
        </span>
        <div class="relative ml-auto w-full max-w-[300px] min-w-[200px] flex-1">
          <svg class="pointer-events-none absolute left-3.5 top-[11px]" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="#44474E">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <label for="roster-search" class="sr-only">Search roster</label>
          <input
            id="roster-search"
            v-model="query"
            type="search"
            placeholder="Search name or email"
            class="h-11 w-full rounded-[22px] border-0 bg-menu pl-11 pr-4 text-[15px] text-on-surface outline-none focus:bg-white focus:shadow-[inset_0_0_0_2px_#0A56D0]"
          >
        </div>
      </div>
      <div role="group" aria-label="Filter by status" class="flex flex-wrap gap-2">
        <button
          v-for="option in filters"
          :key="option.id"
          type="button"
          class="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-[13px] font-medium"
          :class="option.pressed ? 'border-[#DCE2F9] bg-[#DCE2F9] text-[#141B2C]' : 'border-border bg-white text-muted hover:bg-hover-fill'"
          :aria-pressed="option.pressed"
          @click="filter = option.id"
        >
          {{ option.label }}
          <span class="font-bold tabular-nums">{{ option.count }}</span>
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-auto">
      <div class="min-w-[760px]" role="table" aria-label="Attendee roster">
        <div class="sticky top-0 z-[1] grid min-h-10 grid-cols-[minmax(0,2.3fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.25fr)_72px] items-center gap-3 bg-[#F8F9FA] px-5 text-xs font-medium tracking-[0.04em] text-muted" role="row">
          <span role="columnheader">ATTENDEE</span>
          <span role="columnheader">PROFESSION</span>
          <span role="columnheader">SPECIALTY</span>
          <span role="columnheader">STATUS</span>
          <span class="text-right" role="columnheader">UPDATED</span>
        </div>
        <div
          v-for="row in shown"
          :key="row.id"
          class="grid min-h-[60px] grid-cols-[minmax(0,2.3fr)_minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,1.25fr)_72px] items-center gap-3 border-b border-[#ECEEF2] px-5"
          :class="row.fresh ? 'bg-[#F3F6FF]' : ''"
          role="row"
        >
          <span class="flex min-w-0 items-center gap-3" role="cell">
            <span class="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-menu text-[13px] font-bold text-muted" aria-hidden="true">
              {{ initial(row.name, row.fresh) }}
            </span>
            <span class="flex min-w-0 flex-col">
              <span class="truncate text-[15px] font-medium leading-5">{{ row.name }}</span>
              <span class="truncate text-xs leading-4 text-subtle">{{ row.email }}</span>
            </span>
          </span>
          <span class="text-sm leading-5" role="cell">{{ row.profession }}</span>
          <span class="text-sm leading-5" role="cell">{{ row.specialty }}</span>
          <span role="cell">
            <span class="inline-flex h-[26px] items-center gap-1.5 whitespace-nowrap rounded-[13px] px-2.5 text-xs font-medium" :class="STATUS[row.status].chip">
              <span v-if="row.status === 'app'" class="h-[7px] w-[7px] rounded-full bg-[#1E8E3E]" aria-hidden="true" />
              {{ STATUS[row.status].label }}
            </span>
          </span>
          <span class="text-right text-[13px] tabular-nums text-subtle" role="cell">{{ row.updatedAt }}</span>
        </div>
        <p v-if="shown.length === 0" class="m-0 px-5 py-10 text-center text-[15px] text-muted">
          No attendees match this search.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #c4c6d0;
  border-radius: 16px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
