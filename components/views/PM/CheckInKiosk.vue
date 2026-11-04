<script setup lang="ts">
import { PROFESSIONS, SPECIALTIES } from '~/stores/attendees'
import OutlinedField from '~/components/OutlinedField.vue'
import QrCode from '~/components/QrCode.vue'
import StaffPinDialog from '~/components/views/PM/StaffPinDialog.vue'

const emit = defineEmits<{
  close: []
}>()

const session = useSessionStore()
const attendees = useAttendeesStore()

const name = ref('')
const email = ref('')
const profession = ref('')
const specialty = ref('')
const error = ref('')
const errorField = ref<'name' | 'email' | ''>('')
const done = ref(false)
const sentName = ref('')
const sentEmail = ref('')
const remaining = ref(0)
const pinOpen = ref(false)
let countdownTimer: ReturnType<typeof setInterval> | undefined

const checkInUrl = computed(() => {
  const code = session.activityCode ?? '123LV26'
  const base = useRuntimeConfig().app.baseURL || '/'
  const path = `${base.endsWith('/') ? base : `${base}/`}walk-in?activity=${encodeURIComponent(code)}`
  return new URL(path, window.location.origin).href
})

const firstName = computed(() => sentName.value.split(' ')[0] || sentName.value)

function resetForm() {
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = undefined
  name.value = ''
  email.value = ''
  profession.value = ''
  specialty.value = ''
  error.value = ''
  errorField.value = ''
  done.value = false
  remaining.value = 0
}

function onSubmit() {
  const result = attendees.checkIn({
    name: name.value,
    email: email.value,
    profession: profession.value,
    specialty: specialty.value,
  })
  if (!result.ok) {
    errorField.value = result.field
    error.value = result.field === 'name'
      ? 'Please enter your full name.'
      : 'Please enter a valid email address.'
    return
  }
  sentName.value = result.name
  sentEmail.value = result.email
  done.value = true
  error.value = ''
  errorField.value = ''
  remaining.value = 12
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    remaining.value -= 1
    if (remaining.value <= 0) resetForm()
  }, 1000)
}

function clearFieldError() {
  error.value = ''
  errorField.value = ''
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col bg-[#F8F9FA]" role="dialog" aria-modal="true" aria-labelledby="kiosk-title">
    <header class="flex h-[72px] shrink-0 items-center gap-3.5 border-b border-divider bg-white px-5 sm:px-7">
      <span role="img" aria-label="PRIME Education" class="text-[22px] font-bold tracking-[0.12em] text-primary">PRIME</span>
      <span aria-hidden="true" class="h-7 w-px bg-border" />
      <span class="text-[17px] font-medium">Live session check-in</span>
      <span class="inline-flex h-[30px] items-center rounded-lg border border-border px-2.5 text-[13px] text-muted">
        Activity
        <strong class="ml-1.5 tracking-[0.08em] text-on-surface">{{ session.activityCode ?? '—' }}</strong>
      </span>
      <span class="flex-1" />
      <button
        type="button"
        class="inline-flex h-11 items-center gap-1.5 rounded-pill border border-border bg-white pl-3 pr-4 text-[13px] font-medium text-muted hover:bg-hover-fill"
        @click="pinOpen = true"
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
        </svg>
        Staff exit
      </button>
    </header>

    <div class="relative min-h-0 flex-1 overflow-auto bg-[linear-gradient(180deg,#EEF2FF_0%,#F8F9FA_45%)]">
      <div class="relative mx-auto grid min-h-full max-w-[1180px] items-center gap-6 px-4 py-6 lg:grid-cols-2 lg:gap-x-20 lg:px-8">
        <span class="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-9 -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-border bg-white px-3 text-xs font-medium tracking-[0.08em] text-muted lg:inline-flex">OR</span>
        <section class="kiosk-card flex w-full flex-col gap-5">
          <form v-if="!done" class="flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
            <div class="flex flex-col gap-1.5 text-center">
              <h1 id="kiosk-title" class="m-0 text-[32px] font-normal leading-10">Welcome! Let’s get you checked in</h1>
              <p class="m-0 text-[17px] leading-[26px] text-muted">We’ll email your link to join the live session.</p>
            </div>
            <OutlinedField
              id="k-name"
              v-model="name"
              label="Full name"
              size="lg"
              placeholder="First and last name"
              autocomplete="name"
              :invalid="errorField === 'name'"
              @update:model-value="clearFieldError"
            />
            <OutlinedField
              id="k-email"
              v-model="email"
              label="Email"
              type="email"
              size="lg"
              placeholder="name@hospital.org"
              autocomplete="email"
              :invalid="errorField === 'email'"
              @update:model-value="clearFieldError"
            />
            <div class="grid gap-3.5 sm:grid-cols-2">
              <OutlinedField
                id="k-prof"
                v-model="profession"
                label="Profession"
                size="lg"
                :options="PROFESSIONS"
                empty-option="Select"
              />
              <OutlinedField
                id="k-spec"
                v-model="specialty"
                label="Specialty"
                size="lg"
                :options="SPECIALTIES"
                empty-option="Select"
              />
            </div>
            <p class="m-0 min-h-5 text-sm leading-5 text-error" role="alert">{{ error }}</p>
            <button type="submit" class="inline-flex h-[72px] items-center justify-center gap-2.5 rounded-pill bg-primary text-xl font-medium text-white hover:bg-primary-pressed">
              Check me in
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </button>
            <p class="m-0 text-center text-[13px] leading-[18px] text-subtle">
              Your details are used only for this CME activity and your credit record.
            </p>
          </form>

          <div v-else class="flex flex-col items-center gap-[18px] py-4 text-center" role="status">
            <span class="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#C4EED0] text-[#146C2E]">
              <svg aria-hidden="true" width="52" height="52" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </span>
            <h1 class="m-0 text-[32px] font-normal leading-10">You’re checked in, {{ firstName }}!</h1>
            <p class="m-0 text-[17px] leading-[26px] text-muted">
              We sent your session link to <strong class="text-on-surface">{{ sentEmail }}</strong>.
            </p>
            <button type="button" class="h-16 rounded-pill bg-primary px-8 text-lg font-medium text-white hover:bg-primary-pressed" @click="resetForm">
              Next attendee
            </button>
            <span class="text-[13px] text-subtle">This screen resets in {{ remaining }}s · please hand the tablet to the next attendee</span>
          </div>
        </section>

        <section class="kiosk-card flex w-full flex-col items-center gap-4 text-center" aria-labelledby="qr-title">
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DAE2FF] text-[#001848]">
            <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z" />
            </svg>
          </span>
          <div class="flex flex-col gap-1.5">
            <h2 id="qr-title" class="m-0 text-[28px] font-normal leading-9">Scan with your phone</h2>
            <p class="m-0 text-base leading-6 text-muted">
              Point your camera at this code. On your phone, enter your email, profession, and specialty to get the session link.
            </p>
          </div>
          <div class="rounded-[20px] border border-border bg-white p-3">
            <QrCode :value="checkInUrl" label="QR code to open phone check-in" />
          </div>
          <span class="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-[13px] text-muted">
            Activity
            <strong class="ml-1.5 tracking-[0.08em] text-on-surface">{{ session.activityCode ?? '—' }}</strong>
          </span>
          <a :href="checkInUrl" target="_blank" rel="noopener" class="text-sm font-medium text-primary no-underline hover:text-primary-hover">
            Open the check-in page
          </a>
        </section>
      </div>
    </div>

    <StaffPinDialog :open="pinOpen" @cancel="pinOpen = false" @unlocked="emit('close')" />
  </div>
</template>

<style scoped>
.kiosk-card {
  box-sizing: border-box;
  padding: 28px 32px;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.12);
}
</style>
