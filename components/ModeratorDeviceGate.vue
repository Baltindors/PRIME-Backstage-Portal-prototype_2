<script setup lang="ts">
import type { DeviceAuthReason, PairDeviceResult } from '~/stores/moderatorDevice'

const device = useModeratorDeviceStore()
const scanning = ref(false)
const manual = ref('')
const error = ref('')

const banner = computed(() => {
  const result = device.authorization
  if (result.ok) return ''
  if (result.reason === 'revoked') return 'The paired device token was revoked. Pair this device again to continue.'
  if (result.reason === 'expired') return 'The paired device token has expired. Pair this device again to continue.'
  if (result.reason === 'not-found') return 'The paired device token is no longer recognized. Pair this device again to continue.'
  return ''
})

function failureMessage(reason: DeviceAuthReason): string {
  if (reason === 'missing') return 'Enter a token or pairing link.'
  if (reason === 'not-found') return 'That token was not recognized.'
  if (reason === 'revoked') return 'That token has been revoked.'
  return 'That token has expired.'
}

function applyResult(result: PairDeviceResult) {
  if (result.ok) {
    error.value = ''
    scanning.value = false
    manual.value = ''
    return
  }
  error.value = failureMessage(result.reason)
}

function onDetected(value: string) {
  scanning.value = false
  applyResult(device.pairDevice(value))
}

function onSimulate() {
  applyResult(device.pairFirstActiveToken())
}

function onManual() {
  applyResult(device.pairDevice(manual.value))
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <p
      v-if="banner"
      class="rounded-2xl bg-[#ffdad6] px-4 py-3 text-center text-sm leading-5 text-error"
      role="status"
    >
      {{ banner }}
    </p>

    <section class="flex flex-col gap-3">
      <h2 class="text-sm font-medium tracking-[0.04em] text-on-surface">Scan QR Code</h2>
      <QrTokenScanner v-if="scanning" @detected="onDetected" @simulate="onSimulate" />
      <button
        v-else
        type="button"
        class="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-pill border border-primary text-base font-medium tracking-[0.04em] text-primary"
        @click="scanning = true"
      >
        <span class="pointer-events-none absolute inset-0 bg-primary opacity-0 transition-opacity group-hover:opacity-[0.08] group-active:opacity-[0.12]" />
        <span class="relative">Scan QR Code</span>
      </button>
      <button
        v-if="scanning"
        type="button"
        class="text-sm font-medium text-primary"
        @click="scanning = false"
      >
        Close scanner
      </button>
    </section>

    <form class="flex flex-col gap-3" @submit.prevent="onManual">
      <label for="device-token" class="text-sm font-medium tracking-[0.04em] text-on-surface">
        Enter Token Manually
      </label>
      <input
        id="device-token"
        v-model="manual"
        type="text"
        autocomplete="off"
        spellcheck="false"
        placeholder="Paste a token or pairing link"
        class="h-14 w-full rounded-field border border-outline bg-surface px-4 text-base text-on-surface outline-none placeholder:text-outline focus:border-2 focus:border-primary"
        @input="error = ''"
      >
      <p v-if="error" class="text-center text-sm leading-5 text-error" role="alert">
        {{ error }}
      </p>
      <button
        type="submit"
        class="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-pill bg-primary text-base font-medium tracking-[0.04em] text-white"
      >
        <span class="pointer-events-none absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-[0.08] group-active:opacity-[0.12]" />
        <span class="relative">Authorize Device</span>
      </button>
    </form>
  </div>
</template>
