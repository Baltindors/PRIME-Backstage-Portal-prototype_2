<script setup lang="ts">
import type { TokenDisplayStatus } from '~/stores/adminTokens'
import { KNOWN_ADMINS, displayStatus, formatTokenTimestamp } from '~/stores/adminTokens'

definePageMeta({ layout: 'admin' })

const tokens = useAdminTokensStore()
const query = ref('')
const ownerFilter = ref('all')
const statusFilter = ref<'all' | TokenDisplayStatus>('all')
const issueOpen = ref(false)
const shareId = ref<string | null>(null)

watch(
  () => shareId.value !== null && tokens.tokens.some(token => token.id === shareId.value),
  (stillPresent) => {
    if (shareId.value !== null && !stillPresent) shareId.value = null
  },
)

const counts = computed(() => {
  let active = 0
  let expiring = 0
  let revokedOrExpired = 0
  for (const token of tokens.tokens) {
    const status = displayStatus(token)
    if (status === 'active') active += 1
    else if (status === 'expiring') expiring += 1
    else revokedOrExpired += 1
  }
  return {
    active,
    expiring,
    revokedOrExpired,
    total: tokens.tokens.length,
  }
})

const ownerOptions = computed(() => {
  const known: readonly string[] = KNOWN_ADMINS
  const extras = new Set<string>()
  for (const token of tokens.tokens) {
    if (!known.includes(token.owner)) extras.add(token.owner)
  }
  return [...known, ...[...extras].sort((left, right) => left.localeCompare(right))]
})

const visible = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return tokens.tokens.filter((token) => {
    if (ownerFilter.value !== 'all' && token.owner !== ownerFilter.value) return false
    const status = displayStatus(token)
    if (statusFilter.value !== 'all' && status !== statusFilter.value) return false
    if (!needle) return true
    return token.label.toLowerCase().includes(needle)
      || token.owner.toLowerCase().includes(needle)
      || token.tokenString.toLowerCase().includes(needle)
  })
})

const cards = computed(() => [
  { label: 'Active Tokens', value: counts.value.active },
  { label: 'Expiring Soon', value: counts.value.expiring },
  { label: 'Revoked / Expired', value: counts.value.revokedOrExpired },
  { label: 'Total Tokens', value: counts.value.total },
])

function revoke(id: string) {
  tokens.revokeToken(id)
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-normal tracking-wide text-[#1a73c7]">Token Dashboard</h1>
      <button
        type="button"
        class="inline-flex h-9 items-center rounded bg-[#0d6efd] px-3 text-sm font-semibold text-white hover:bg-[#0b5ed7]"
        @click="issueOpen = true"
      >
        Issue Token for User
      </button>
    </div>

    <div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <article
        v-for="card in cards"
        :key="card.label"
        class="rounded border border-[#dee2e6] bg-white px-4 py-3"
      >
        <p class="text-xs font-semibold uppercase tracking-wide text-[#495057]">{{ card.label }}</p>
        <p class="mt-1 text-2xl font-semibold text-[#212529]">{{ card.value }}</p>
      </article>
    </div>

    <div class="mt-6 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <label for="token-search" class="block text-xs font-semibold uppercase tracking-wide text-[#495057]">Search</label>
        <input
          id="token-search"
          v-model="query"
          type="search"
          placeholder="Label, user, or token"
          class="mt-1 h-10 w-full rounded border border-[#ced4da] px-3 text-sm outline-none placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:ring-2 focus:ring-[#0d6efd]/25"
        >
      </div>
      <div>
        <label for="owner-filter" class="block text-xs font-semibold uppercase tracking-wide text-[#495057]">Admin user</label>
        <select
          id="owner-filter"
          v-model="ownerFilter"
          class="mt-1 h-10 w-full rounded border border-[#ced4da] bg-white px-3 text-sm outline-none focus:border-[#86b7fe] focus:ring-2 focus:ring-[#0d6efd]/25"
        >
          <option value="all">All</option>
          <option v-for="name in ownerOptions" :key="name" :value="name">{{ name }}</option>
        </select>
      </div>
      <div>
        <label for="status-filter" class="block text-xs font-semibold uppercase tracking-wide text-[#495057]">Status</label>
        <select
          id="status-filter"
          v-model="statusFilter"
          class="mt-1 h-10 w-full rounded border border-[#ced4da] bg-white px-3 text-sm outline-none focus:border-[#86b7fe] focus:ring-2 focus:ring-[#0d6efd]/25"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>
    </div>

    <p v-if="visible.length === 0" class="mt-8 text-sm text-[#495057]">
      No device tokens match these filters.
    </p>

    <div v-else class="mt-6 overflow-x-auto rounded border border-[#dee2e6]">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-[#f8f9fa] text-xs uppercase tracking-wide text-[#495057]">
          <tr>
            <th scope="col" class="px-4 py-3 font-semibold">Device Label</th>
            <th scope="col" class="px-4 py-3 font-semibold">Assigned User</th>
            <th scope="col" class="px-4 py-3 font-semibold">Issued By</th>
            <th scope="col" class="px-4 py-3 font-semibold">Status</th>
            <th scope="col" class="px-4 py-3 font-semibold">Created</th>
            <th scope="col" class="px-4 py-3 font-semibold">Expires</th>
            <th scope="col" class="px-4 py-3 font-semibold">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="token in visible" :key="token.id" class="border-t border-[#dee2e6]">
            <td class="px-4 py-3 font-medium text-[#212529]">{{ token.label }}</td>
            <td class="px-4 py-3 text-[#495057]">{{ token.owner }}</td>
            <td class="px-4 py-3 text-[#495057]">{{ token.issuedBy }}</td>
            <td class="px-4 py-3">
              <AdminTokenStatusBadge :status="displayStatus(token)" />
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-[#495057]">{{ formatTokenTimestamp(token.createdAt) }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-[#495057]">{{ formatTokenTimestamp(token.expiresAt) }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
              <button
                type="button"
                class="rounded border border-[#0d6efd] px-3 py-1 text-xs font-semibold text-[#0d6efd] hover:bg-[#0d6efd] hover:text-white"
                @click="shareId = token.id"
              >
                View / Share
              </button>
              <button
                v-if="token.status !== 'revoked'"
                type="button"
                class="ml-2 rounded border border-[#dc3545] px-3 py-1 text-xs font-semibold text-[#dc3545] hover:bg-[#dc3545] hover:text-white"
                @click="revoke(token.id)"
              >
                Revoke
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminIssueTokenDialog :open="issueOpen" @close="issueOpen = false" />
    <AdminTokenDetailDialog :open="shareId !== null" :token-id="shareId" @close="shareId = null" />
  </div>
</template>
