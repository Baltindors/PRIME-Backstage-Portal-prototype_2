<script setup lang="ts">
import type { AddEntriesResult, WhitelistEntry, WhitelistType } from '~/stores/ipWhitelist'

const session = useSessionStore()
const whitelist = useIpWhitelistStore()

const draft = ref('')
const note = ref('')
const summary = ref<AddEntriesResult | null>(null)
const now = ref(Date.now())

const TYPE_LABEL: Record<WhitelistType, string> = {
  single: 'Single IP',
  cidr: 'CIDR',
  range: 'Range',
}

const TYPE_CHIP: Record<WhitelistType, string> = {
  single: 'bg-[#DAE2FF] text-[#001848]',
  cidr: 'bg-[#EADDFF] text-[#21005D]',
  range: 'bg-[#FFDCC2] text-[#2E1500]',
}

let clockId: ReturnType<typeof setInterval> | undefined

const rows = computed(() => whitelist.activeFor(session.activityCode, Math.max(now.value, Date.now())))
const canSubmit = computed(() => draft.value.trim().length > 0)

const addedMessage = computed(() => {
  const count = summary.value?.addedCount ?? 0
  if (count <= 0) return ''
  const noun = count === 1 ? 'entry' : 'entries'
  return `Whitelisted ${count} ${noun} for 48 hours.`
})

const duplicateMessage = computed(() => {
  const count = summary.value?.duplicateCount ?? 0
  if (count <= 0) return ''
  const noun = count === 1 ? 'duplicate already' : 'duplicates already'
  return `Skipped ${count} ${noun} on this event.`
})

onMounted(() => {
  clockId = setInterval(() => {
    now.value = Date.now()
  }, 1_000)
})

onBeforeUnmount(() => {
  if (clockId !== undefined) clearInterval(clockId)
})

function formatWhen(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function remainingLabel(entry: WhitelistEntry) {
  const expires = new Date(entry.expiresAt).getTime()
  const remaining = expires - Math.max(now.value, Date.now())
  const ms = Number.isFinite(remaining) ? Math.max(0, remaining) : 0
  if (ms <= 0) return 'Expired'
  const totalMinutes = Math.floor(ms / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  if (minutes > 0) return `${minutes}m remaining`
  return 'under 1m remaining'
}

function onSubmit() {
  const result = whitelist.addEntries(draft.value, note.value)
  summary.value = result
  if (result.invalidEntries.length === 0) {
    draft.value = ''
    note.value = ''
    return
  }
  draft.value = result.invalidEntries
    .map(entry => entry.value)
    .filter(value => value.length > 0)
    .join('\n')
}

function remove(entry: WhitelistEntry) {
  whitelist.removeEntry(entry.id)
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4 overflow-auto">
    <section class="rounded-2xl border border-border bg-white px-5 py-5 sm:px-6" aria-labelledby="whitelist-title">
      <div class="flex flex-wrap items-center gap-3">
        <h1 id="whitelist-title" class="m-0 text-lg font-medium leading-6">Venue IP Whitelist</h1>
        <span class="inline-flex h-7 items-center rounded-pill bg-[#DAE2FF] px-3 text-xs font-medium tracking-[0.04em] text-[#001848]">
          {{ session.activityCode || 'No activity' }}
        </span>
      </div>
      <p class="m-0 mt-3 max-w-3xl text-sm leading-5 text-muted">
        Venue networks are temporary. Every whitelisted IP, CIDR block, and range expires and is removed automatically 48 hours after it is submitted.
      </p>
    </section>

    <section class="rounded-2xl border border-border bg-white px-5 py-5 sm:px-6" aria-labelledby="whitelist-form-title">
      <h2 id="whitelist-form-title" class="m-0 text-base font-medium leading-6">Add IPs / ranges</h2>
      <form class="mt-4 flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
        <div class="flex flex-col gap-2">
          <label for="whitelist-input" class="text-sm font-medium text-on-surface">IP addresses, CIDR blocks, or ranges</label>
          <textarea
            id="whitelist-input"
            v-model="draft"
            rows="5"
            placeholder="e.g., 198.51.100.25, 203.0.113.0/24, 192.0.2.10-192.0.2.50"
            class="w-full resize-y rounded-field border-2 border-outline bg-white px-4 py-3 font-mono text-sm leading-6 text-on-surface outline-none placeholder:font-sans placeholder:text-outline hover:border-on-surface focus:border-primary"
          />
          <p class="m-0 text-xs leading-[18px] text-subtle">Separate entries with new lines, commas, or semicolons.</p>
        </div>

        <OutlinedField
          id="whitelist-note"
          v-model="note"
          label="Location / Network Note"
          placeholder="Venue Guest Wi-Fi"
          autocomplete="off"
          support="Optional. Applied to every new entry in this submission."
        />

        <button
          type="submit"
          class="inline-flex h-12 items-center justify-center self-start rounded-pill bg-primary px-6 text-sm font-medium text-white hover:bg-primary-pressed focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!canSubmit"
        >
          Whitelist IPs (48h)
        </button>
      </form>

      <div v-if="addedMessage || duplicateMessage" class="mt-4 flex flex-col gap-2" role="status">
        <p v-if="addedMessage" class="m-0 rounded-xl bg-[#C4EED0] px-3.5 py-3 text-sm leading-5 text-[#00210B]">
          {{ addedMessage }}
        </p>
        <p v-if="duplicateMessage" class="m-0 rounded-xl bg-[#DAE2FF] px-3.5 py-3 text-sm leading-5 text-[#001848]">
          {{ duplicateMessage }}
        </p>
      </div>

      <div v-if="summary && summary.invalidEntries.length > 0" class="mt-4 rounded-xl bg-[#ffdad6] px-3.5 py-3" role="alert">
        <p class="m-0 text-sm font-medium leading-5 text-error">
          {{ summary.addedCount > 0 ? 'Fix these entries and submit again. Valid entries were saved.' : 'Fix these entries and submit again.' }}
        </p>
        <ul class="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
          <li v-for="(entry, index) in summary.invalidEntries" :key="`${entry.value}-${index}`" class="text-sm leading-5 text-error">
            <span v-if="entry.value" class="font-mono">{{ entry.value }}</span>
            <span v-if="entry.value"> — </span>
            {{ entry.message }}
          </li>
        </ul>
      </div>
    </section>

    <section class="rounded-2xl border border-border bg-white" aria-labelledby="whitelist-active-title">
      <div class="border-b border-divider px-5 py-4 sm:px-6">
        <h2 id="whitelist-active-title" class="m-0 text-base font-medium leading-6">Active whitelist</h2>
        <p class="m-0 mt-1 text-xs leading-[18px] text-subtle">Showing entries for this activity code that have not reached their 48-hour expiration.</p>
      </div>

      <div v-if="rows.length === 0" class="px-5 py-10 text-center sm:px-6">
        <p class="m-0 text-sm font-medium leading-5">No IPs are whitelisted for this event.</p>
        <p class="m-0 mt-1 text-sm leading-5 text-muted">Add a venue address, CIDR block, or range above. Each one drops off 48 hours after submission.</p>
      </div>

      <div v-else class="overflow-auto">
        <table class="w-full min-w-[880px] border-collapse text-left">
          <thead>
            <tr class="bg-[#F8F9FA] text-xs font-medium tracking-[0.04em] text-muted">
              <th scope="col" class="px-5 py-3 font-medium sm:px-6">IP / Range</th>
              <th scope="col" class="px-3 py-3 font-medium">Note / Label</th>
              <th scope="col" class="px-3 py-3 font-medium">Added By</th>
              <th scope="col" class="px-3 py-3 font-medium">Submitted</th>
              <th scope="col" class="px-3 py-3 font-medium">Expires In</th>
              <th scope="col" class="px-5 py-3 text-right font-medium sm:px-6">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in rows" :key="entry.id" class="border-t border-[#ECEEF2]">
              <td class="px-5 py-3 align-top sm:px-6">
                <div class="font-mono text-sm leading-5">{{ entry.value }}</div>
                <span class="mt-1.5 inline-flex h-6 items-center rounded-md px-2 text-[11px] font-medium tracking-[0.03em]" :class="TYPE_CHIP[entry.type]">
                  {{ TYPE_LABEL[entry.type] }}
                </span>
              </td>
              <td class="px-3 py-3 align-top text-sm leading-5 text-on-surface">{{ entry.label || '—' }}</td>
              <td class="px-3 py-3 align-top text-sm leading-5">{{ entry.addedBy }}</td>
              <td class="px-3 py-3 align-top text-sm leading-5 text-muted">{{ formatWhen(entry.createdAt) }}</td>
              <td class="px-3 py-3 align-top">
                <div class="text-sm font-medium leading-5">{{ remainingLabel(entry) }}</div>
                <div class="mt-0.5 text-xs leading-4 text-muted">{{ formatWhen(entry.expiresAt) }}</div>
              </td>
              <td class="px-5 py-3 text-right align-top sm:px-6">
                <button
                  type="button"
                  class="inline-flex h-9 items-center rounded-pill border border-border px-3 text-sm font-medium text-error hover:bg-[#ffdad6] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-primary"
                  :aria-label="`Remove ${entry.value}`"
                  @click="remove(entry)"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
