<script setup lang="ts">
import type { EventMode } from '~/stores/session'

const props = withDefaults(defineProps<{
  mode: EventMode
  title: string
  badge: string
  description: string
  features: string[]
  icon: 'person' | 'groups' | 'shapes'
  disabled?: boolean
}>(), {
  disabled: false,
})

const emit = defineEmits<{
  continue: [mode: EventMode]
}>()

const tones: Record<EventMode, {
  wash: string
  icon: string
  badge: string
  check: string
  button: string
  card: string
}> = {
  individual: {
    wash: 'bg-primary',
    icon: 'bg-[#DAE2FF] text-[#001848]',
    badge: 'bg-menu text-muted',
    check: 'text-primary',
    button: 'bg-primary text-white',
    card: 'hover:border-primary',
  },
  teams: {
    wash: 'bg-[#006A63]',
    icon: 'bg-[#CCE8E5] text-[#00201E]',
    badge: 'bg-[#CCE8E5] text-[#00201E]',
    check: 'text-[#006A63]',
    button: 'bg-[#006A63] text-white',
    card: 'hover:border-[#006A63]',
  },
  categories: {
    wash: 'bg-[#6750A4]',
    icon: 'bg-[#EADDFF] text-[#21005D]',
    badge: 'bg-[#EADDFF] text-[#21005D]',
    check: 'text-[#6750A4]',
    button: 'bg-[#6750A4] text-white',
    card: 'hover:border-[#6750A4]',
  },
  catteams: {
    wash: 'bg-[#8B5000]',
    icon: 'bg-[#FFDCC2] text-[#2E1500]',
    badge: 'bg-[#FFDCC2] text-[#2E1500]',
    check: 'text-[#8B5000]',
    button: 'bg-[#8B5000] text-white',
    card: 'hover:border-[#8B5000]',
  },
}

const icons = {
  person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  groups: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  shapes: 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z',
} as const

const tone = computed(() => tones[props.mode])

function onContinue() {
  if (props.disabled) return
  emit('continue', props.mode)
}
</script>

<template>
  <article
    class="group relative flex min-h-0 flex-col gap-3.5 rounded-[24px] border border-border bg-surface p-5 text-on-surface transition duration-200 sm:min-h-[470px] sm:p-[22px]"
    :class="disabled
      ? 'cursor-not-allowed opacity-60'
      : [tone.card, 'hover:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_8px_3px_rgba(0,0,0,0.15)] active:scale-[0.99]']"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <span
      v-if="!disabled"
      class="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-150 group-hover:opacity-[0.04] group-active:opacity-10"
      :class="tone.wash"
    />

    <div class="relative flex items-start justify-between gap-3">
      <span
        class="flex h-14 w-14 items-center justify-center rounded-card"
        :class="tone.icon"
      >
        <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path :d="icons[icon]" />
        </svg>
      </span>
      <span class="flex flex-col items-end gap-1.5">
        <span
          v-if="disabled"
          class="inline-flex h-6 items-center rounded-full bg-menu px-2.5 text-[11px] font-medium tracking-[0.04em] text-muted"
        >
          Coming Soon
        </span>
        <span
          class="inline-flex h-7 items-center rounded-[14px] px-3 text-xs font-medium"
          :class="tone.badge"
        >
          {{ badge }}
        </span>
      </span>
    </div>

    <div class="relative flex flex-col gap-1.5">
      <h2 class="text-xl font-medium leading-[26px]">
        {{ title }}
      </h2>
      <p class="text-sm leading-5 text-muted">
        {{ description }}
      </p>
    </div>

    <ul class="relative flex flex-col gap-2.5">
      <li
        v-for="feature in features"
        :key="feature"
        class="flex items-start gap-2 text-sm leading-5"
      >
        <svg
          aria-hidden="true"
          class="mt-0.5 shrink-0"
          :class="tone.check"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
        <span>{{ feature }}</span>
      </li>
    </ul>

    <button
      type="button"
      class="relative mt-auto flex h-[52px] w-full items-center justify-center gap-2 rounded-pill text-[15px] font-medium focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-primary disabled:cursor-not-allowed"
      :class="disabled ? 'bg-[#E1E2EA] text-muted' : tone.button"
      :disabled="disabled"
      :aria-label="disabled ? `${title} is coming soon` : `Continue as ${title}`"
      @click.stop="onContinue"
    >
      Continue
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
      </svg>
    </button>
  </article>
</template>
