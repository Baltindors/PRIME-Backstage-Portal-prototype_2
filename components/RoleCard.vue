<script setup lang="ts">
import type { Role, RoleId } from '~/stores/session'

const props = defineProps<{
  role: Role
  selected: boolean
}>()

const emit = defineEmits<{
  select: [roleId: RoleId]
}>()

const icons: Record<RoleId, string> = {
  'av-tech': 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
  moderator: 'M9 13c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.76-9.64l-1.68 1.69c.84 1.18.84 2.71 0 3.89l1.68 1.69c2.02-2.02 2.02-5.07 0-7.27zM20.07 2l-1.63 1.63c2.77 3.02 2.77 7.56 0 10.74L20.07 16c3.9-3.89 3.91-9.95 0-14z',
  faculty: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z',
  'program-manager': 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
}

function onSelect() {
  emit('select', props.role.id)
}
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="selected"
    class="group relative flex min-h-[136px] items-start gap-5 overflow-hidden rounded-card text-left text-on-surface transition duration-200 hover:shadow-card focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-primary"
    :class="selected ? 'border-2 border-primary bg-selected p-[23px]' : 'border border-border bg-surface p-6'"
    @click="onSelect"
  >
    <span class="pointer-events-none absolute inset-0 bg-primary opacity-0 transition-opacity group-hover:opacity-[0.04] group-active:opacity-10" />
    <span
      class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-card"
      :class="selected ? 'bg-primary text-white' : 'bg-icon-container text-[#141B2C]'"
    >
      <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path :d="icons[role.id]" />
      </svg>
    </span>
    <span class="relative flex flex-col gap-1.5 pr-7">
      <span class="text-[22px] font-normal leading-7">{{ role.title }}</span>
      <span class="text-sm leading-5 tracking-[0.02em] text-muted">{{ role.desc }}</span>
      <span class="mt-1 text-xs leading-4 tracking-[0.04em] text-subtle">{{ role.toolsLine }}</span>
    </span>
    <svg
      aria-hidden="true"
      class="absolute right-5 top-5 text-primary transition-opacity"
      :class="selected ? 'opacity-100' : 'opacity-0'"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  </button>
</template>
