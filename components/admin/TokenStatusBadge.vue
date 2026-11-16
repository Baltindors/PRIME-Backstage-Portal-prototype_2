<script setup lang="ts">
import type { TokenDisplayStatus } from '~/stores/adminTokens'

defineProps<{
  status: TokenDisplayStatus
}>()

const label: Record<TokenDisplayStatus, string> = {
  active: 'Active',
  expiring: 'Expiring Soon',
  expired: 'Expired',
  revoked: 'Revoked',
}

const tone: Record<TokenDisplayStatus, string> = {
  active: 'bg-[#d1e7dd] text-[#0f5132]',
  expiring: 'bg-[#fff3cd] text-[#664d03]',
  expired: 'bg-[#e9ecef] text-[#495057]',
  revoked: 'bg-[#e9ecef] text-[#495057]',
}
</script>

<template>
  <span
    class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
    :class="tone[status]"
  >
    {{ label[status] }}
  </span>
</template>
