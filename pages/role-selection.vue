<script setup lang="ts">
import type { EventMode, RoleId } from '~/stores/session'

useHead({ title: 'Choose your role · PRIME Backstage Portal' })

const session = useSessionStore()

const modeLabels: Record<EventMode, string> = {
  individual: 'CONNECTED INDIVIDUAL',
  teams: 'CONNECTED TEAMS',
  categories: 'CONNECTED CATEGORIES – INDIVIDUALS',
  catteams: 'CONNECTED CATEGORIES TEAMS',
}

const staffRoleIds: RoleId[] = ['av-tech', 'program-manager']
const staffCodeValue = '4747'

const selectedId = ref<RoleId | null>(null)
const userName = ref('')
const staffCode = ref('')

const selectedRole = computed(() => ROLES.find(role => role.id === selectedId.value) ?? null)
const needsStaffCode = computed(() => selectedRole.value !== null && staffRoleIds.includes(selectedRole.value.id))
const nameOk = computed(() => userName.value.trim().length > 0)
const staffOk = computed(() => !needsStaffCode.value || staffCode.value === staffCodeValue)
const canContinue = computed(() => selectedRole.value !== null && nameOk.value && staffOk.value)

const eyebrow = computed(() => {
  const code = session.activityCode ?? '—'
  const mode = session.eventMode ? modeLabels[session.eventMode] : '—'
  return `ACTIVITY ${code} · ${mode}`
})

const logPreview = computed(() => {
  const role = selectedRole.value?.short ?? 'Role'
  const name = nameOk.value ? userName.value.trim() : 'Your name'
  return `${role} ${name}`
})

const staffSupport = computed(() => {
  if (staffCode.value.length === 4 && staffCode.value !== staffCodeValue) return 'Incorrect code'
  if (staffCode.value === staffCodeValue) return 'Code accepted'
  return 'Required for AV Tech and Program Manager'
})

const staffInvalid = computed(() => staffCode.value.length === 4 && staffCode.value !== staffCodeValue)

const continueLabel = computed(() => {
  if (!selectedRole.value) return 'Select a role to continue'
  if (!nameOk.value) return 'Enter your name to continue'
  if (!staffOk.value) return 'Enter staff code to continue'
  return `Continue as ${selectedRole.value.short}`
})

function selectRole(roleId: RoleId) {
  selectedId.value = roleId
}

function onStaffInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  staffCode.value = raw.replace(/\D/g, '').slice(0, 4)
}

function onContinue() {
  if (!selectedRole.value || !canContinue.value) return
  const accepted = session.setRoleAndUser(
    selectedRole.value.id,
    userName.value,
    needsStaffCode.value ? staffCode.value : '',
  )
  if (accepted) return navigateTo('/portal')
}
</script>

<template>
  <main class="mx-auto flex min-h-screen w-full flex-col items-center justify-center gap-6 px-4 py-8 sm:px-8 sm:py-12">
    <header class="flex w-full max-w-[880px] flex-col items-center gap-2 text-center">
      <p class="text-xs font-medium leading-4 tracking-[0.12em] text-muted">
        {{ eyebrow }}
      </p>
      <h1 class="text-2xl font-normal leading-8 sm:text-[28px] sm:leading-9">
        Choose your role for this session
      </h1>
      <p class="text-base leading-6 tracking-[0.03em] text-muted">
        Your Backstage Portal shows only the tools your role needs. You can switch at any time.
      </p>
    </header>

    <div role="radiogroup" aria-label="Session role" class="grid w-full max-w-[880px] grid-cols-1 gap-4 md:grid-cols-2">
      <RoleCard
        v-for="role in ROLES"
        :key="role.id"
        :role="role"
        :selected="selectedId === role.id"
        @select="selectRole"
      />
    </div>

    <div class="flex w-full flex-col items-center gap-2">
      <div class="flex w-full max-w-[920px] flex-col items-stretch justify-center gap-4 lg:flex-row lg:items-start">
        <div class="group relative w-full lg:w-[380px]">
          <label
            for="user-name"
            class="absolute -top-[9px] left-3 bg-background px-1 text-xs font-medium leading-4 text-muted group-focus-within:text-primary"
          >
            Your name (required)
          </label>
          <input
            id="user-name"
            v-model="userName"
            type="text"
            autocomplete="name"
            maxlength="40"
            placeholder="e.g. Mike or Dr. Smith"
            aria-describedby="user-name-sup"
            aria-required="true"
            class="h-14 w-full rounded-field border border-outline bg-surface px-4 font-sans text-base text-on-surface outline-none hover:border-on-surface focus:border-2 focus:border-primary focus:px-[15px]"
          >
          <p id="user-name-sup" class="mt-1 px-4 text-xs leading-4 text-muted">
            Shown in chat and activity logs as <strong class="font-medium text-on-surface">{{ logPreview }}</strong>
          </p>
        </div>

        <div v-if="needsStaffCode" class="group relative w-full lg:w-[200px]">
          <label
            for="staff-pin"
            class="absolute -top-[9px] left-3 bg-background px-1 text-xs font-medium leading-4"
            :class="staffInvalid ? 'text-error' : 'text-muted group-focus-within:text-primary'"
          >
            Staff code (required)
          </label>
          <input
            id="staff-pin"
            :value="staffCode"
            type="password"
            inputmode="numeric"
            autocomplete="off"
            maxlength="4"
            placeholder="••••"
            aria-describedby="staff-pin-sup"
            aria-required="true"
            :aria-invalid="staffInvalid ? 'true' : 'false'"
            class="h-14 w-full rounded-field bg-surface text-center font-sans text-xl tracking-[0.5em] text-on-surface outline-none"
            :class="staffInvalid
              ? 'border-2 border-error px-[15px]'
              : 'border border-outline px-4 hover:border-on-surface focus:border-2 focus:border-primary focus:px-[15px]'"
            @input="onStaffInput"
          >
          <p
            id="staff-pin-sup"
            class="mt-1 px-4 text-xs leading-4"
            :class="staffInvalid ? 'text-error' : 'text-muted'"
          >
            {{ staffSupport }}
          </p>
        </div>

        <button
          type="button"
          class="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-pill px-6 text-base font-medium tracking-[0.02em] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-primary lg:min-w-[320px] lg:w-auto lg:px-8"
          :class="canContinue
            ? 'bg-primary text-white hover:shadow-card active:bg-primary-pressed'
            : 'cursor-default bg-[rgba(26,28,30,0.12)] text-[rgba(26,28,30,0.38)]'"
          :disabled="!canContinue"
          @click="onContinue"
        >
          {{ continueLabel }}
        </button>
      </div>

      <span class="flex gap-2">
        <NuxtLink to="/" class="px-4 py-3 text-sm font-medium leading-5 text-primary no-underline hover:text-primary-hover">
          Change event mode
        </NuxtLink>
        <NuxtLink to="/join" class="px-4 py-3 text-sm font-medium leading-5 text-primary no-underline hover:text-primary-hover">
          Enter a different code
        </NuxtLink>
      </span>
    </div>
  </main>
</template>
