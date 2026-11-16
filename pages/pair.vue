<script setup lang="ts">
import type { DeviceAuthReason } from '~/stores/moderatorDevice'

useHead({ title: 'Pair device · PRIME Backstage Portal' })

const route = useRoute()
const device = useModeratorDeviceStore()

const raw = route.query.token
const token = Array.isArray(raw) ? raw[0] ?? '' : raw ?? ''
const attempted = token.trim() ? device.pairDevice(token) : null
const reason = ref<DeviceAuthReason | null>(null)

device.refreshCheckedAt()

if (device.isAuthorized) {
  onMounted(() => {
    // Let the authorizing card paint, then leave /pair.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void navigateTo('/join')
      })
    })
  })
}
else {
  const authorization = device.authorization
  if (!authorization.ok && authorization.reason !== 'missing') reason.value = authorization.reason
  else if (attempted && !attempted.ok) reason.value = attempted.reason
  else reason.value = 'missing'
}

const message = computed(() => {
  if (reason.value === 'revoked') return 'This device token has been revoked. Ask an admin for a new pairing link.'
  if (reason.value === 'expired') return 'This device token has expired. Ask an admin for a new pairing link.'
  if (reason.value === 'not-found') return 'This device token was not recognized. Check the link or scan a current code.'
  return 'This link does not include a device token. Open a pairing link or scan a code from the admin tools.'
})
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
          {{ reason ? 'Pairing failed' : 'Authorizing device...' }}
        </h1>
        <p
          v-if="reason"
          class="max-w-[400px] text-base leading-6 tracking-[0.03em] text-muted"
          role="alert"
        >
          {{ message }}
        </p>
        <p
          v-else
          class="max-w-[400px] text-base leading-6 tracking-[0.03em] text-muted"
          role="status"
        >
          Authorizing device...
        </p>
      </header>
      <NuxtLink
        v-if="reason"
        to="/join"
        class="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-pill bg-primary text-base font-medium tracking-[0.04em] text-white"
      >
        <span class="pointer-events-none absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-[0.08] group-active:opacity-[0.12]" />
        <span class="relative">Go to moderator entry</span>
      </NuxtLink>
    </main>
  </div>
</template>
