<script setup lang="ts">
import { displayStatus } from '~/stores/adminTokens'

const props = defineProps<{
  open: boolean
  tokenId: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

const tokens = useAdminTokensStore()
const token = computed(() => tokens.tokens.find(item => item.id === props.tokenId) ?? null)
const status = computed(() => token.value ? displayStatus(token.value) : 'active')

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div
    v-if="open && token"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    @click.self="emit('close')"
  >
    <div
      class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded border border-[#dee2e6] bg-white p-5 shadow-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-detail-title"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 id="token-detail-title" class="text-lg font-semibold text-[#212529]">{{ token.label }}</h2>
          <p class="mt-1 text-sm text-[#495057]">Assigned to {{ token.owner }}</p>
        </div>
        <button
          type="button"
          class="rounded px-2 py-1 text-sm text-[#495057] hover:bg-[#f8f9fa]"
          @click="emit('close')"
        >
          Close
        </button>
      </div>
      <div class="mt-3">
        <AdminTokenStatusBadge :status="status" />
      </div>
      <div class="mt-4">
        <AdminTokenCredentials :token="token" show-extend compact-extend />
      </div>
    </div>
  </div>
</template>
