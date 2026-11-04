<script setup lang="ts">
const session = useSessionStore()

const registrationOptions = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: 'custom', label: 'Custom' },
] as const

const adjustments = [
  { label: '+1 Min', seconds: 60, tone: 'plus', name: 'Add 1 minute' },
  { label: '+5 Min', seconds: 300, tone: 'plus', name: 'Add 5 minutes' },
  { label: '−1 Min', seconds: -60, tone: 'minus', name: 'Remove 1 minute' },
  { label: '−5 Min', seconds: -300, tone: 'minus', name: 'Remove 5 minutes' },
] as const

function toLocalInput(date: Date) {
  const part = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`
}

const startAt = ref(toLocalInput(new Date(Date.now() - 15 * 60 * 1000)))
const registrationWindow = ref('15')
const customWindow = ref(20)
const programLength = ref(60)

const clock = computed(() => {
  const total = Math.max(0, session.sessionTimer)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const part = (value: number) => String(value).padStart(2, '0')
  return `${part(hours)}:${part(minutes)}:${part(seconds)}`
})

const progress = computed(() => {
  const total = Math.max(1, Number(programLength.value) || 0) * 60
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, (session.sessionTimer / total) * 100))
})

const endsAt = computed(() => {
  const end = new Date(Date.now() + Math.max(0, session.sessionTimer) * 1000)
  return end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
})

const subLine = computed(() => {
  if (session.timerPaused) return 'Paused.'
  if (session.sessionTimer <= 0) return 'Session ended.'
  return `Session ends at ${endsAt.value}.`
})

function togglePause() {
  session.setTimerPaused(!session.timerPaused)
}

function restart() {
  const minutes = Number(programLength.value)
  const safe = Number.isFinite(minutes) ? Math.min(480, Math.max(5, Math.round(minutes))) : 60
  programLength.value = safe
  const start = new Date(startAt.value)
  const startMs = Number.isNaN(start.getTime()) ? Date.now() : start.getTime()
  const remaining = Math.round((startMs + safe * 60 * 1000 - Date.now()) / 1000)
  session.restartSessionTimer(Math.max(0, remaining))
}

function adjust(seconds: number) {
  session.adjustSessionTimer(seconds)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] xl:gap-6">
    <section aria-labelledby="master-title" class="flex min-h-[280px] flex-col gap-4 rounded-[20px] bg-[#1A1C1E] px-4 py-5 text-[#E3E2E6] sm:gap-[18px] sm:px-7 sm:py-6 xl:min-h-0">
      <h1 id="master-title" class="m-0 text-sm font-medium leading-5 tracking-[0.1em] text-[#C4C6D0]">
        MASTER CLOCK
      </h1>

      <div class="flex min-h-0 flex-1 flex-col justify-center gap-2.5">
        <span class="inline-flex items-center gap-2.5 text-[15px] font-bold leading-5 tracking-[0.12em] text-[#FF8A80]">
          <span v-if="session.sessionLive && !session.timerPaused" class="pulse" aria-hidden="true" />
          LIVE SESSION • REMAINING
        </span>
        <span role="timer" class="max-w-full font-mono text-[clamp(40px,14vw,116px)] font-medium leading-none tracking-[-0.01em] text-white tabular-nums">
          {{ clock }}
        </span>
        <span class="text-[15px] leading-[22px] text-[#A9ACB4]">{{ subLine }}</span>
        <div aria-hidden="true" class="mt-1.5 h-2 overflow-hidden rounded bg-[#3A3D42]">
          <div class="h-2 rounded bg-[#BA1A1A]" :style="{ width: `${progress}%` }" />
        </div>
      </div>

      <div class="flex flex-col gap-2.5 border-t border-white/10 pt-3.5">
        <button type="button" class="text-btn" :aria-pressed="session.timerPaused" @click="togglePause">
          <svg v-if="!session.timerPaused" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          <svg v-else aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          {{ session.timerPaused ? 'Resume timer' : 'Pause timer' }}
        </button>
      </div>
    </section>

    <section aria-labelledby="ctrl-title" class="panel flex min-h-0 flex-col gap-4 overflow-visible px-4 py-5 sm:px-[22px] xl:overflow-auto">
      <div class="flex flex-col gap-0.5">
        <h2 id="ctrl-title" class="m-0 text-lg font-medium leading-6">
          Timer configuration
        </h2>
        <span class="text-[13px] leading-[18px] text-muted">Pre-filled from the program record. One start — the clock works out the phase from this device’s time.</span>
      </div>

      <div class="mt-1.5 grid grid-cols-1 gap-x-3 gap-y-[18px] sm:grid-cols-2">
        <div class="field sm:col-span-2">
          <label for="start-at" class="field-label">Program Start Date/Time</label>
          <input id="start-at" v-model="startAt" class="field-input has-icon" type="datetime-local">
          <svg class="caret" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="#44474E">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
          </svg>
        </div>
        <div class="field">
          <label for="reg-window" class="field-label">Registration Window</label>
          <select id="reg-window" v-model="registrationWindow" class="field-input">
            <option v-for="option in registrationOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <svg class="caret" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="#44474E">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
        <div class="field">
          <label for="length" class="field-label">Total Program Length</label>
          <input id="length" v-model.number="programLength" class="field-input has-suffix" type="number" inputmode="numeric" min="5" max="480">
          <span class="suffix">minutes</span>
        </div>
        <div v-if="registrationWindow === 'custom'" class="field sm:col-span-2">
          <label for="reg-custom" class="field-label">Custom registration window</label>
          <input id="reg-custom" v-model.number="customWindow" class="field-input has-suffix" type="number" inputmode="numeric" min="1" max="180">
          <span class="suffix">minutes</span>
        </div>
      </div>

      <button type="button" class="big-btn" @click="restart">
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        Restart Timer from Schedule
      </button>

      <div class="flex flex-col gap-2.5 border-t border-divider pt-3.5">
        <span class="text-sm font-medium leading-5">Live adjustments</span>
        <div role="group" aria-label="Adjust the running timer" class="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <button
            v-for="item in adjustments"
            :key="item.label"
            type="button"
            class="adj"
            :class="item.tone"
            :aria-label="item.name"
            @click="adjust(item.seconds)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #c4c6d0;
  border-radius: 16px;
}

.field {
  position: relative;
}

.field-input {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 56px;
  box-sizing: border-box;
  padding: 0 16px;
  border: 1px solid #74777f;
  border-radius: 8px;
  background: #ffffff;
  font: inherit;
  font-size: 16px;
  color: #1a1c1e;
  outline: none;
  appearance: none;
}

.field-input:hover {
  border-color: #1a1c1e;
}

.field-input:focus {
  border: 2px solid #0a56d0;
  padding: 0 15px;
}

select.field-input:focus {
  padding-right: 43px;
}

.field-input.has-suffix:focus {
  padding-right: 83px;
}

.field-input.has-icon:focus {
  padding-right: 43px;
}

select.field-input {
  padding-right: 44px;
  cursor: pointer;
}

.field-input.has-suffix {
  padding-right: 84px;
}

.field-input.has-icon {
  padding-right: 44px;
}

.field-input[type='datetime-local']::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  right: 8px;
  width: 36px;
  height: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: pointer;
}

.field:focus-within .field-label {
  color: #0a56d0;
}

.field-label {
  position: absolute;
  top: -9px;
  left: 12px;
  padding: 0 4px;
  background: #ffffff;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: #44474e;
}

.caret {
  position: absolute;
  top: 16px;
  right: 12px;
  pointer-events: none;
}

.suffix {
  position: absolute;
  top: 18px;
  right: 16px;
  font-size: 15px;
  color: #44474e;
  pointer-events: none;
}

.big-btn {
  height: 64px;
  border: 0;
  border-radius: 16px;
  background: #0a56d0;
  color: #ffffff;
  font: inherit;
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  padding: 0 16px;
}

.big-btn:hover {
  background: #0849b3;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.big-btn:focus-visible {
  outline: 3px solid #0a56d0;
  outline-offset: 3px;
}

.adj {
  height: 64px;
  border-radius: 16px;
  border: 1px solid #74777f;
  background: #ffffff;
  font: inherit;
  font-size: 20px;
  line-height: 24px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.adj.plus {
  color: #0a56d0;
}

.adj.minus {
  color: #ba1a1a;
}

.adj:hover {
  background: #f2f3f7;
}

.adj:active {
  background: #dae2ff;
}

.adj:focus-visible {
  outline: 3px solid #0a56d0;
  outline-offset: 3px;
}

.text-btn {
  height: 40px;
  width: fit-content;
  padding: 0 12px;
  border: 0;
  border-radius: 100px;
  background: #3a3d42;
  color: #e3e2e6;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.text-btn:hover {
  background: #4a4d52;
}

.pulse {
  position: relative;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: #ba1a1a;
}

.pulse::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: #ba1a1a;
  animation: timer-pulse 1.6s ease-out infinite;
}

@keyframes timer-pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}
</style>
