<script setup lang="ts">
import { SELF_SERVICE_OWNER, displayStatus, formatTokenTimestamp } from '~/stores/adminTokens'

definePageMeta({ layout: 'admin' })

const tokens = useAdminTokensStore()
const label = ref('')
const durationMonths = ref(6)
const error = ref('')
const selectedId = ref<string | null>(null)

const durations = [
  { value: 1, label: '1 Month' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months (Default)' },
  { value: 12, label: '12 Months' },
] as const

const mine = computed(() => tokens.tokens.filter(token => token.owner === SELF_SERVICE_OWNER))
const selected = computed(() => mine.value.find(token => token.id === selectedId.value) ?? null)

watch(mine, (list) => {
  if (selectedId.value && list.some(token => token.id === selectedId.value)) return
  selectedId.value = list[0]?.id ?? null
}, { immediate: true })

function onSubmit() {
  const token = tokens.generateToken({
    label: label.value,
    owner: SELF_SERVICE_OWNER,
    durationMonths: durationMonths.value,
  })
  if (!token) {
    error.value = 'Enter a device label.'
    return
  }
  error.value = ''
  label.value = ''
  durationMonths.value = 6
  selectedId.value = token.id
}

function revokeSelected() {
  if (!selected.value) return
  tokens.revokeToken(selected.value.id)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-normal tracking-wide text-[#1a73c7]">Token Generator</h1>
    <p class="mt-2 text-sm text-[#495057]">
      Create and manage device tokens for {{ SELF_SERVICE_OWNER }}. Share the QR code, pairing URL, or token string to pair a device.
    </p>

    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section class="lg:col-span-5">
        <form class="rounded border border-[#dee2e6] p-4" @submit.prevent="onSubmit">
          <h2 class="text-sm font-semibold text-[#212529]">New personal token</h2>
          <label for="my-device-label" class="mt-3 block text-sm font-medium text-[#212529]">Device label</label>
          <input
            id="my-device-label"
            v-model="label"
            type="text"
            placeholder="iPad Pro - Main Stage"
            autocomplete="off"
            :aria-invalid="error ? 'true' : 'false'"
            :aria-describedby="error ? 'my-device-label-error' : undefined"
            class="mt-1 h-10 w-full rounded border px-3 text-sm outline-none placeholder:text-[#6c757d] focus:ring-2 focus:ring-[#0d6efd]/25"
            :class="error ? 'border-[#dc3545] focus:border-[#dc3545]' : 'border-[#ced4da] focus:border-[#86b7fe]'"
            @input="error = ''"
          >
          <p v-if="error" id="my-device-label-error" class="mt-1 text-sm text-[#dc3545]">{{ error }}</p>
          <label for="my-duration" class="mt-3 block text-sm font-medium text-[#212529]">Expiration</label>
          <select
            id="my-duration"
            v-model.number="durationMonths"
            class="mt-1 h-10 w-full rounded border border-[#ced4da] bg-white px-3 text-sm outline-none focus:border-[#86b7fe] focus:ring-2 focus:ring-[#0d6efd]/25"
          >
            <option v-for="option in durations" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <button
            type="submit"
            class="mt-4 inline-flex h-9 items-center rounded bg-[#0d6efd] px-3 text-sm font-semibold text-white hover:bg-[#0b5ed7]"
          >
            Generate token
          </button>
        </form>

        <h2 class="mt-6 text-sm font-semibold uppercase tracking-wide text-[#495057]">My tokens</h2>
        <p v-if="mine.length === 0" class="mt-3 text-sm text-[#495057]">No personal tokens yet.</p>
        <ul v-else class="mt-3 divide-y divide-[#dee2e6] rounded border border-[#dee2e6]">
          <li v-for="token in mine" :key="token.id">
            <button
              type="button"
              class="flex w-full items-start justify-between gap-3 px-3 py-3 text-left hover:bg-[#f8f9fa]"
              :class="token.id === selectedId ? 'bg-[#e7f1ff]' : ''"
              :aria-current="token.id === selectedId ? 'true' : undefined"
              @click="selectedId = token.id"
            >
              <span>
                <span class="block text-sm font-medium text-[#212529]">{{ token.label }}</span>
                <span class="mt-1 block text-xs text-[#495057]">Expires {{ formatTokenTimestamp(token.expiresAt) }}</span>
              </span>
              <AdminTokenStatusBadge :status="displayStatus(token)" />
            </button>
          </li>
        </ul>
      </section>

      <section class="rounded border border-[#dee2e6] p-5 lg:col-span-7">
        <div v-if="!selected" class="flex h-full min-h-48 items-center justify-center text-center">
          <p class="max-w-sm text-sm text-[#495057]">
            Create a personal token to see its QR code, pairing URL, and token string here.
          </p>
        </div>
        <div v-else>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-[#212529]">{{ selected.label }}</h2>
              <p class="mt-1 text-sm text-[#495057]">Created on {{ formatTokenTimestamp(selected.createdAt) }}</p>
              <p class="text-sm text-[#495057]">Issued by {{ selected.issuedBy }}</p>
            </div>
            <AdminTokenStatusBadge :status="displayStatus(selected)" />
          </div>
          <div class="mt-5">
            <AdminTokenCredentials :token="selected" show-extend />
          </div>
          <button
            v-if="selected.status !== 'revoked'"
            type="button"
            class="mt-6 rounded border border-[#dc3545] px-3 py-1.5 text-sm font-semibold text-[#dc3545] hover:bg-[#dc3545] hover:text-white"
            @click="revokeSelected"
          >
            Revoke Token
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
