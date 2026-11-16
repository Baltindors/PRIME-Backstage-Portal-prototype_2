<script setup lang="ts">
import { KNOWN_ADMINS } from '~/stores/adminTokens'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const tokens = useAdminTokensStore()
const ownerChoice = ref<string>(KNOWN_ADMINS[0])
const customOwner = ref('')
const label = ref('')
const durationMonths = ref(6)
const error = ref('')
const createdId = ref<string | null>(null)

const created = computed(() => tokens.tokens.find(token => token.id === createdId.value) ?? null)
const customSelected = computed(() => ownerChoice.value === '__custom__')

const durations = [
  { value: 1, label: '1 Month' },
  { value: 3, label: '3 Months' },
  { value: 6, label: '6 Months (Default)' },
  { value: 12, label: '12 Months' },
] as const

function reset() {
  ownerChoice.value = KNOWN_ADMINS[0]
  customOwner.value = ''
  label.value = ''
  durationMonths.value = 6
  error.value = ''
  createdId.value = null
}

watch(() => props.open, (open) => {
  if (open) reset()
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

function submit() {
  const owner = customSelected.value ? customOwner.value : ownerChoice.value
  const token = tokens.generateToken({
    label: label.value,
    owner,
    durationMonths: durationMonths.value,
  })
  if (!token) {
    error.value = 'Enter a device label and an admin user.'
    return
  }
  error.value = ''
  createdId.value = token.id
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    @click.self="emit('close')"
  >
    <div
      class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded border border-[#dee2e6] bg-white p-5 shadow-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-token-title"
    >
      <div class="flex items-start justify-between gap-3">
        <h2 id="issue-token-title" class="text-lg font-semibold text-[#212529]">
          {{ created ? 'Token Ready to Share' : 'Issue Token for User' }}
        </h2>
        <button
          type="button"
          class="rounded px-2 py-1 text-sm text-[#495057] hover:bg-[#f8f9fa]"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <form v-if="!created" class="mt-4" @submit.prevent="submit">
        <label for="token-owner" class="block text-sm font-medium text-[#212529]">Admin user</label>
        <select
          id="token-owner"
          v-model="ownerChoice"
          class="mt-1 h-10 w-full rounded border border-[#ced4da] bg-white px-3 text-sm outline-none focus:border-[#86b7fe] focus:ring-2 focus:ring-[#0d6efd]/25"
        >
          <option v-for="name in KNOWN_ADMINS" :key="name" :value="name">{{ name }}</option>
          <option value="__custom__">Other...</option>
        </select>
        <input
          v-if="customSelected"
          v-model="customOwner"
          type="text"
          placeholder="Admin user name"
          autocomplete="off"
          aria-label="Custom admin user"
          class="mt-2 h-10 w-full rounded border border-[#ced4da] px-3 text-sm outline-none placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:ring-2 focus:ring-[#0d6efd]/25"
          @input="error = ''"
        >

        <label for="issue-device-label" class="mt-4 block text-sm font-medium text-[#212529]">Device label</label>
        <input
          id="issue-device-label"
          v-model="label"
          type="text"
          placeholder="iPad Pro - Main Stage"
          autocomplete="off"
          :aria-invalid="error ? 'true' : 'false'"
          :aria-describedby="error ? 'issue-token-error' : undefined"
          class="mt-1 h-10 w-full rounded border px-3 text-sm outline-none placeholder:text-[#6c757d] focus:ring-2 focus:ring-[#0d6efd]/25"
          :class="error ? 'border-[#dc3545] focus:border-[#dc3545]' : 'border-[#ced4da] focus:border-[#86b7fe]'"
          @input="error = ''"
        >

        <label for="issue-duration" class="mt-4 block text-sm font-medium text-[#212529]">Expiration</label>
        <select
          id="issue-duration"
          v-model.number="durationMonths"
          class="mt-1 h-10 w-full rounded border border-[#ced4da] bg-white px-3 text-sm outline-none focus:border-[#86b7fe] focus:ring-2 focus:ring-[#0d6efd]/25"
        >
          <option v-for="option in durations" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>

        <p v-if="error" id="issue-token-error" class="mt-2 text-sm text-[#dc3545]">{{ error }}</p>

        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="inline-flex h-9 items-center rounded border border-[#ced4da] px-3 text-sm font-semibold text-[#212529] hover:bg-[#f8f9fa]"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex h-9 items-center rounded bg-[#0d6efd] px-3 text-sm font-semibold text-white hover:bg-[#0b5ed7]"
          >
            Issue token
          </button>
        </div>
      </form>

      <div v-else class="mt-4" aria-live="polite">
        <p class="text-sm text-[#495057]">
          {{ created.label }} is assigned to {{ created.owner }}. Share one of these credentials so they can pair their device.
        </p>
        <div class="mt-4">
          <AdminTokenCredentials :token="created" />
        </div>
        <div class="mt-5 flex justify-end">
          <button
            type="button"
            class="inline-flex h-9 items-center rounded bg-[#0d6efd] px-3 text-sm font-semibold text-white hover:bg-[#0b5ed7]"
            @click="emit('close')"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
