<script setup lang="ts">
import { PROFESSIONS, SPECIALTIES } from '~/stores/attendees'
import OutlinedField from '~/components/OutlinedField.vue'

const attendees = useAttendeesStore()

const emit = defineEmits<{
  openKiosk: []
}>()

const email = ref('')
const profession = ref('')
const specialty = ref('')
const emailError = ref('')
const toastEmail = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const emailSupport = computed(() => emailError.value || 'Registration link is sent here')

function onSubmit() {
  const result = attendees.sendInvite({
    email: email.value,
    profession: profession.value,
    specialty: specialty.value,
  })
  if (!result.ok) {
    emailError.value = result.reason === 'required' ? 'Email is required' : 'Enter a valid email address'
    return
  }
  emailError.value = ''
  email.value = ''
  profession.value = ''
  specialty.value = ''
  toastEmail.value = result.email
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastEmail.value = ''
  }, 5000)
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<template>
  <section class="panel flex flex-col gap-[18px] overflow-auto p-5" aria-labelledby="reg-title">
    <div class="flex items-center gap-3">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DAE2FF] text-[#001848]">
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </span>
      <div class="flex flex-col">
        <h1 id="reg-title" class="m-0 text-lg font-medium leading-6">Quick on-site registration</h1>
        <span class="text-[13px] leading-[18px] text-muted">Send a walk-in attendee their link</span>
      </div>
    </div>

    <button
      type="button"
      class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-pill border border-primary bg-white text-sm font-medium text-primary hover:bg-[#F3F6FF] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-primary"
      @click="emit('openKiosk')"
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
      </svg>
      Full-screen self check-in
    </button>

    <form class="flex flex-col gap-3.5" novalidate @submit.prevent="onSubmit">
      <OutlinedField
        id="reg-email"
        v-model="email"
        label="Email"
        type="email"
        placeholder="name@hospital.org"
        autocomplete="off"
        :invalid="emailError !== ''"
        :support="emailSupport"
        @update:model-value="emailError = ''"
      />
      <OutlinedField
        id="reg-prof"
        v-model="profession"
        label="Profession"
        :options="PROFESSIONS"
        empty-option="Select profession"
      />
      <OutlinedField
        id="reg-spec"
        v-model="specialty"
        label="Specialty"
        :options="SPECIALTIES"
        empty-option="Select specialty"
      />
      <button
        type="submit"
        class="mt-2 inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-pill bg-primary text-base font-medium tracking-[0.01em] text-white hover:bg-primary-pressed focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-primary"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
        </svg>
        Send Registration Link
      </button>
    </form>

    <div v-if="toastEmail" role="status" class="flex items-center gap-2.5 rounded-xl bg-[#2F3033] px-3.5 py-3 text-sm leading-5 text-[#F1F0F4]">
      <svg aria-hidden="true" class="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="#9CD67D">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      <span>Link sent to <strong>{{ toastEmail }}</strong>. They appear in the roster as Invite Sent.</span>
    </div>

    <p class="m-0 mt-auto text-xs leading-[18px] text-subtle">
      The attendee completes their profile on their own device; status updates to Registered, then App Connected once they join.
    </p>
  </section>
</template>

<style scoped>
.panel {
  background: #ffffff;
  border: 1px solid #c4c6d0;
  border-radius: 16px;
  min-height: 0;
}
</style>
