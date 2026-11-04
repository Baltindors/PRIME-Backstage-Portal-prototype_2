<script setup lang="ts">
import { PROFESSIONS, SPECIALTIES } from '~/stores/attendees'
import OutlinedField from '~/components/OutlinedField.vue'

useHead({ title: 'Check in · PRIME Education' })

const route = useRoute()
const attendees = useAttendeesStore()

const activity = computed(() => {
  const value = route.query.activity
  return typeof value === 'string' && value.trim() ? value : '123LV26'
})

const name = ref('')
const email = ref('')
const profession = ref('')
const specialty = ref('')
const error = ref('')
const errorField = ref<'name' | 'email' | ''>('')
const done = ref(false)
const sentName = ref('')
const sentEmail = ref('')

const firstName = computed(() => sentName.value.split(' ')[0] || sentName.value)

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
}

function clearFieldError() {
  error.value = ''
  errorField.value = ''
}
</script>

<template>
  <main class="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center gap-6 px-4 py-10">
    <header class="flex flex-col items-center gap-2 text-center">
      <span role="img" aria-label="PRIME Education" class="text-2xl font-bold tracking-[0.12em] text-primary">PRIME</span>
      <span class="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-[13px] text-muted">
        Activity
        <strong class="ml-1.5 tracking-[0.08em] text-on-surface">{{ activity }}</strong>
      </span>
    </header>

    <section v-if="!done" class="flex flex-col gap-5 rounded-[28px] bg-white px-6 py-8 shadow-card sm:px-8" aria-labelledby="walk-title">
      <div class="flex flex-col gap-1.5 text-center">
        <h1 id="walk-title" class="m-0 text-[28px] font-normal leading-9">Check in on your phone</h1>
        <p class="m-0 text-base leading-6 text-muted">Enter your details and we’ll email your session link.</p>
      </div>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
        <OutlinedField
          id="walk-name"
          v-model="name"
          label="Full name"
          placeholder="First and last name"
          autocomplete="name"
          :invalid="errorField === 'name'"
          @update:model-value="clearFieldError"
        />
        <OutlinedField
          id="walk-email"
          v-model="email"
          label="Email"
          type="email"
          placeholder="name@hospital.org"
          autocomplete="email"
          :invalid="errorField === 'email'"
          @update:model-value="clearFieldError"
        />
        <OutlinedField
          id="walk-prof"
          v-model="profession"
          label="Profession"
          :options="PROFESSIONS"
          empty-option="Select profession"
        />
        <OutlinedField
          id="walk-spec"
          v-model="specialty"
          label="Specialty"
          :options="SPECIALTIES"
          empty-option="Select specialty"
        />
        <p class="m-0 min-h-5 text-sm leading-5 text-error" role="alert">{{ error }}</p>
        <button type="submit" class="inline-flex h-14 items-center justify-center rounded-pill bg-primary text-base font-medium text-white hover:bg-primary-pressed">
          Check me in
        </button>
      </form>
    </section>

    <section v-else class="flex flex-col items-center gap-4 rounded-[28px] bg-white px-6 py-10 text-center shadow-card" role="status">
      <span class="flex h-20 w-20 items-center justify-center rounded-full bg-[#C4EED0] text-[#146C2E]">
        <svg aria-hidden="true" width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </span>
      <h1 class="m-0 text-[28px] font-normal leading-9">You’re checked in, {{ firstName }}!</h1>
      <p class="m-0 text-base leading-6 text-muted">
        We sent your session link to <strong class="text-on-surface">{{ sentEmail }}</strong>.
      </p>
    </section>
  </main>
</template>
