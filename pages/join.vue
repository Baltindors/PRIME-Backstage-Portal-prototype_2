<script setup lang="ts">
useHead({ title: 'Live Session Moderator Access · PRIME Backstage Portal' })

const session = useSessionStore()
const code = ref('')
const error = ref('')

const supportText = computed(() => error.value || 'Enter the code exactly as you received it.')

function onCodeInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.toUpperCase()
  code.value = raw.replace(/[^A-Z0-9-]/g, '').slice(0, 16)
  error.value = ''
}

function onSubmit() {
  const value = code.value.trim().toUpperCase()
  const accepted = session.validateActivityCode(value)
  if (accepted) {
    return navigateTo('/role-selection')
  }
  error.value = value
    ? 'That code doesn’t match an active session. Check it and try again.'
    : 'Enter your activity code to continue.'
}
</script>

<template>
  <div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-8 text-on-surface sm:px-8 sm:py-12">
    <svg
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1194 834"
      preserveAspectRatio="xMidYMid slice"
    >
      <circle cx="70" cy="40" r="300" fill="#0A56D0" fill-opacity="0.045" />
      <circle cx="1150" cy="820" r="360" fill="#0A56D0" fill-opacity="0.04" />
      <circle cx="1150" cy="820" r="230" fill="#0A56D0" fill-opacity="0.035" />
    </svg>

    <main class="relative flex w-full max-w-[520px] flex-col gap-7 rounded-[28px] bg-surface px-5 pb-8 pt-8 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_2px_6px_2px_rgba(0,0,0,0.15)] sm:gap-9 sm:px-12 sm:pb-10 sm:pt-12">
      <header class="flex flex-col items-center gap-4 text-center">
        <div role="img" aria-label="PRIME Education" class="mb-2 flex flex-col items-center gap-0.5">
          <span class="text-[30px] font-bold leading-8 tracking-[0.14em] text-primary">PRIME</span>
          <span class="text-[11px] font-medium leading-[14px] tracking-[0.32em] text-muted">EDUCATION</span>
        </div>
        <h1 class="text-2xl font-normal leading-8 sm:text-[28px] sm:leading-9">
          Live Session Moderator Access
        </h1>
        <p class="max-w-[400px] text-base leading-6 tracking-[0.03em] text-muted">
          Enter the activity code for your live session to open the moderator interactive tools.
        </p>
      </header>

      <form class="flex flex-col gap-5" @submit.prevent="onSubmit">
        <div class="group relative">
          <label
            for="activity-code"
            class="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface px-1.5 text-[13px] font-medium leading-5 tracking-[0.03em]"
            :class="error ? 'text-error' : 'text-muted group-focus-within:text-primary'"
          >
            Activity code
          </label>
          <input
            id="activity-code"
            :value="code"
            type="text"
            inputmode="text"
            autocomplete="off"
            autocapitalize="characters"
            autocorrect="off"
            spellcheck="false"
            enterkeyhint="go"
            maxlength="16"
            placeholder="Enter code"
            aria-describedby="activity-code-help"
            :aria-invalid="error ? 'true' : 'false'"
            class="h-20 w-full min-w-0 rounded-field bg-surface text-center font-sans text-2xl font-medium uppercase leading-8 tracking-[0.12em] text-on-surface outline-none transition-colors placeholder:text-lg placeholder:font-normal placeholder:normal-case placeholder:tracking-[0.02em] placeholder:text-outline sm:text-4xl sm:leading-[44px] sm:tracking-[0.2em] sm:placeholder:text-[22px]"
            :class="error
              ? 'border-2 border-error px-[15px] caret-error'
              : 'border border-outline px-4 caret-primary hover:border-on-surface focus:border-2 focus:border-primary focus:px-[15px]'"
            @input="onCodeInput"
          >
          <p
            id="activity-code-help"
            class="mt-2 min-h-5 text-center text-sm leading-5 tracking-[0.01em]"
            :class="error ? 'text-error' : 'text-muted'"
            aria-live="polite"
          >
            {{ supportText }}
          </p>
        </div>

        <button
          type="submit"
          class="group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-pill bg-primary text-base font-medium tracking-[0.04em] text-white transition-shadow hover:shadow-card focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-primary"
        >
          <span class="pointer-events-none absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-[0.08] group-active:opacity-[0.12]" />
          <span class="relative inline-flex items-center gap-2.5">
            Open interactive tools
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </span>
        </button>
      </form>
    </main>

    <p class="m-0 mt-6 text-center text-sm leading-5 tracking-[0.02em] text-subtle sm:mt-8">
      Trouble with your code? Contact your PRIME session coordinator.
    </p>
  </div>
</template>
