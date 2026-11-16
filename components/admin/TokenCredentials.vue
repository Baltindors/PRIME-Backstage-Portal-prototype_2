<script setup lang="ts">
import type { DeviceToken } from '~/stores/adminTokens'
import { formatTokenTimestamp } from '~/stores/adminTokens'

const props = withDefaults(defineProps<{
  token: DeviceToken
  showExtend?: boolean
  compactExtend?: boolean
}>(), {
  showExtend: false,
  compactExtend: false,
})

const extendChoices = computed(() => (
  props.compactExtend
    ? [{ months: 1, label: '+1 Mo' }, { months: 3, label: '+3 Mo' }, { months: 6, label: '+6 Mo' }]
    : [{ months: 1, label: '+1 Month' }, { months: 3, label: '+3 Months' }, { months: 6, label: '+6 Months' }]
))

const tokens = useAdminTokensStore()
const fallbackCopy = ref<HTMLTextAreaElement | null>(null)
const copied = ref<'url' | 'token' | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | undefined

const pairingUrl = computed(() => tokens.getPairingUrl(props.token.tokenString))
const revoked = computed(() => props.token.status === 'revoked')

function copyWithFallback(value: string): boolean {
  const area = fallbackCopy.value
  if (!area) return false
  area.value = value
  area.focus()
  area.select()
  try {
    return document.execCommand('copy')
  }
  catch {
    return false
  }
}

async function copyValue(kind: 'url' | 'token', value: string) {
  let copiedOk = false
  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(value)
      copiedOk = true
    }
    catch {
      copiedOk = false
    }
  }
  if (!copiedOk) copiedOk = copyWithFallback(value)
  if (!copiedOk) return
  copied.value = kind
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = null
  }, 2000)
}

function extend(months: number) {
  tokens.extendToken(props.token.id, months)
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<template>
  <div>
    <textarea
      ref="fallbackCopy"
      readonly
      tabindex="-1"
      aria-hidden="true"
      class="pointer-events-none fixed left-[-9999px] top-0 h-px w-px opacity-0"
    />

    <div class="relative inline-block">
      <div :class="revoked ? 'opacity-40' : ''">
        <QrCode
          :value="pairingUrl"
          :label="revoked ? 'Revoked device pairing code' : 'Device pairing code'"
        />
      </div>
      <span
        v-if="revoked"
        class="absolute inset-0 flex items-center justify-center"
      >
        <span class="rounded-full bg-[#e9ecef] px-2.5 py-1 text-xs font-semibold text-[#495057]">Revoked</span>
      </span>
    </div>

    <div class="mt-5">
      <label :for="`pairing-url-${token.id}`" class="text-xs font-semibold uppercase tracking-wide text-[#495057]">Shareable pairing URL</label>
      <div class="mt-1 flex flex-col gap-2 sm:flex-row">
        <input
          :id="`pairing-url-${token.id}`"
          :value="pairingUrl"
          type="text"
          readonly
          class="h-10 min-w-0 flex-1 rounded border border-[#ced4da] bg-[#f8f9fa] px-3 text-sm text-[#212529]"
        >
        <button
          type="button"
          class="inline-flex h-10 shrink-0 items-center justify-center rounded border border-[#0d6efd] px-3 text-sm font-semibold text-[#0d6efd] hover:bg-[#0d6efd] hover:text-white"
          @click="copyValue('url', pairingUrl)"
        >
          {{ copied === 'url' ? 'Copied!' : 'Copy URL' }}
        </button>
      </div>
    </div>

    <div class="mt-4">
      <label :for="`token-string-${token.id}`" class="text-xs font-semibold uppercase tracking-wide text-[#495057]">Raw token string</label>
      <div class="mt-1 flex flex-col gap-2 sm:flex-row">
        <input
          :id="`token-string-${token.id}`"
          :value="token.tokenString"
          type="text"
          readonly
          class="h-10 min-w-0 flex-1 rounded border border-[#ced4da] bg-[#f8f9fa] px-3 font-mono text-sm text-[#212529]"
        >
        <button
          type="button"
          class="inline-flex h-10 shrink-0 items-center justify-center rounded border border-[#0d6efd] px-3 text-sm font-semibold text-[#0d6efd] hover:bg-[#0d6efd] hover:text-white"
          @click="copyValue('token', token.tokenString)"
        >
          {{ copied === 'token' ? 'Copied!' : 'Copy Token' }}
        </button>
      </div>
    </div>

    <div v-if="showExtend" class="mt-5">
      <p class="text-xs font-semibold uppercase tracking-wide text-[#495057]">Expires on</p>
      <p class="mt-1 text-sm text-[#212529]">{{ formatTokenTimestamp(token.expiresAt) }}</p>
      <div v-if="!revoked" class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="choice in extendChoices"
          :key="choice.months"
          type="button"
          class="rounded border border-[#ced4da] px-3 py-1.5 text-xs font-semibold text-[#212529] hover:bg-[#f8f9fa]"
          @click="extend(choice.months)"
        >
          {{ choice.label }}
        </button>
      </div>
    </div>
  </div>
</template>
