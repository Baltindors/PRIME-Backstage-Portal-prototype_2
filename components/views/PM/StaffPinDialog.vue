<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  cancel: []
  unlocked: []
}>()

const session = useSessionStore()
const pin = ref('')
const error = ref('')
const shaking = ref(false)

const dots = computed(() => [0, 1, 2, 3].map(index => pin.value.length > index))
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'] as const

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('cancel')
}

watch(() => props.open, (open) => {
  if (!open) return
  pin.value = ''
  error.value = ''
  shaking.value = false
})

function press(key: typeof keys[number]) {
  if (key === 'clear') {
    pin.value = ''
    error.value = ''
    return
  }
  if (key === 'back') {
    pin.value = pin.value.slice(0, -1)
    error.value = ''
    return
  }
  const next = pin.value.length >= 4 ? key : `${pin.value}${key}`
  if (next.length < 4) {
    pin.value = next
    error.value = ''
    return
  }
  if (session.matchesStaffCode(next)) {
    pin.value = ''
    error.value = ''
    emit('unlocked')
    return
  }
  pin.value = ''
  error.value = 'Incorrect code. Try again.'
  shaking.value = true
  window.setTimeout(() => {
    shaking.value = false
  }, 350)
}

function labelFor(key: typeof keys[number]) {
  if (key === 'clear') return 'Clear code'
  if (key === 'back') return 'Delete last digit'
  return key
}
</script>

<template>
  <div v-if="open" class="absolute inset-0 z-[60] flex items-center justify-center bg-[rgba(17,19,24,0.55)]" role="presentation">
    <div
      class="pin-card flex w-[360px] max-w-[calc(100%-2rem)] flex-col items-center gap-4 rounded-[28px] bg-white px-6 py-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
      :class="error ? 'is-error' : ''"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-title"
    >
      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="#0A56D0">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
      </svg>
      <div class="flex flex-col items-center gap-1 text-center">
        <h2 id="pin-title" class="m-0 text-xl font-medium leading-7">Staff code required</h2>
        <span class="text-sm leading-5 text-muted">Enter the 4-digit staff code to leave self check-in.</span>
      </div>
      <div
        class="pin-dots flex h-5 gap-3.5"
        :class="shaking ? 'is-shaking' : ''"
        :aria-label="`${pin.length} of 4 digits entered`"
      >
        <span
          v-for="(filled, index) in dots"
          :key="index"
          class="box-border h-4 w-4 rounded-full border-2"
          :class="filled ? 'border-primary bg-primary' : 'border-outline'"
        />
      </div>
      <span class="min-h-[18px] text-[13px] leading-[18px] text-error" role="alert">{{ error }}</span>
      <div class="grid grid-cols-3 gap-2.5">
        <button
          v-for="key in keys"
          :key="key"
          type="button"
          class="flex h-[60px] w-[72px] items-center justify-center rounded-[30px] font-medium focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary"
          :class="key === 'clear' || key === 'back' ? 'bg-transparent text-sm text-muted' : 'bg-menu text-[22px] text-on-surface hover:bg-[#DCE2F9]'"
          :aria-label="labelFor(key)"
          @click="press(key)"
        >
          <span v-if="key === 'back'" aria-hidden="true">⌫</span>
          <span v-else>{{ key === 'clear' ? 'Clear' : key }}</span>
        </button>
      </div>
      <button type="button" class="h-10 rounded-[20px] px-4 text-sm font-medium text-primary hover:bg-[rgba(10,86,208,0.08)]" @click="emit('cancel')">
        Cancel · stay in check-in
      </button>
    </div>
  </div>
</template>

<style scoped>
.pin-card.is-error .pin-dots span {
  border-color: #ba1a1a;
}

.pin-dots.is-shaking {
  animation: pinshake 0.35s;
}

@keyframes pinshake {
  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-8px);
  }

  75% {
    transform: translateX(8px);
  }
}
</style>
