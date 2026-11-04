<script setup lang="ts">
import type { EventMode, RoleId, TabId } from '~/stores/session'

const session = useSessionStore()

const modeMeta: Record<EventMode, { label: string, chip: string, icon: string }> = {
  individual: {
    label: 'ConnectED Individual',
    chip: 'bg-[#DAE2FF] text-[#001848]',
    icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  },
  teams: {
    label: 'ConnectED Teams',
    chip: 'bg-[#CCE8E5] text-[#00201E]',
    icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  },
  categories: {
    label: 'ConnectED Categories – Individuals',
    chip: 'bg-[#EADDFF] text-[#21005D]',
    icon: 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z',
  },
  catteams: {
    label: 'ConnectED Categories Teams',
    chip: 'bg-[#FFDCC2] text-[#2E1500]',
    icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  },
}

const roleIcons: Record<RoleId, string> = {
  'av-tech': 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
  moderator: 'M9 13c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.76-9.64l-1.68 1.69c.84 1.18.84 2.71 0 3.89l1.68 1.69c2.02-2.02 2.02-5.07 0-7.27zM20.07 2l-1.63 1.63c2.77 3.02 2.77 7.56 0 10.74L20.07 16c3.9-3.89 3.91-9.95 0-14z',
  faculty: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z',
  'program-manager': 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
}

let timerId: ReturnType<typeof setInterval> | undefined

const mode = computed(() => session.eventMode ? modeMeta[session.eventMode] : null)
const roleTabs = computed(() => {
  const role = session.selectedRole
  if (!role) return []
  return role.tabs.map(id => ({
    id,
    label: role.tabLabels?.[id] ?? TABS[id].label,
    badge: role.badges?.[id],
  }))
})

const clock = computed(() => {
  const total = Math.max(0, session.sessionTimer)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const part = (value: number) => String(value).padStart(2, '0')
  return `${part(hours)}:${part(minutes)}:${part(seconds)}`
})

const timerLabel = computed(() => (
  session.sessionLive ? `Session Live • ${clock.value} Remaining` : `${clock.value} Remaining`
))

watch(
  () => session.selectedRole?.id,
  () => {
    session.activeTab = session.selectedRole?.def ?? null
  },
  { immediate: true },
)

function selectTab(id: TabId) {
  session.activeTab = id
}

function leaveSession() {
  session.logout()
  return navigateTo('/')
}

onMounted(() => {
  if (session.selectedRole && session.sessionTimer > 0) {
    session.sessionLive = true
  }
  timerId = setInterval(() => {
    if (session.sessionLive && !session.timerPaused && session.sessionTimer > 0) {
      session.sessionTimer -= 1
    }
    if (session.sessionTimer <= 0) session.sessionLive = false
  }, 1000)
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
})
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background font-sans text-on-surface">
    <header class="flex min-h-16 shrink-0 flex-wrap items-center gap-x-2 gap-y-2 border-b border-divider bg-surface px-3 py-2 sm:gap-x-3 sm:px-6 xl:grid xl:h-16 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:flex-nowrap xl:items-center xl:gap-3 xl:py-0">
      <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 xl:flex-none">
        <span role="img" aria-label="PRIME Education" class="shrink-0 text-lg font-bold leading-6 tracking-[0.12em] text-primary sm:text-xl">PRIME</span>
        <span aria-hidden="true" class="h-6 w-px shrink-0 bg-border sm:h-7" />
        <span class="truncate text-sm font-medium leading-6 sm:text-base">Backstage Portal</span>
      </div>

      <div class="order-last flex w-full min-w-0 flex-wrap items-center gap-2 xl:order-none xl:w-auto xl:flex-nowrap xl:justify-center xl:gap-3">
        <span
          class="inline-flex h-8 max-w-full items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium"
          :class="mode ? mode.chip : 'bg-menu text-muted'"
        >
          <svg v-if="mode" aria-hidden="true" class="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path :d="mode.icon" />
          </svg>
          <span class="truncate">{{ mode?.label ?? '—' }}</span>
        </span>
        <span class="inline-flex h-8 max-w-full items-center gap-1.5 rounded-lg border border-border px-2.5 text-[13px] leading-4 text-muted">
          Activity
          <strong class="truncate font-medium tracking-[0.08em] text-on-surface">{{ session.activityCode ?? '—' }}</strong>
        </span>
        <details class="role-menu relative">
          <summary class="flex h-10 cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-lg border border-outline bg-surface py-0 pl-2.5 pr-1.5 text-sm font-medium text-on-surface hover:bg-hover-fill">
            <svg v-if="session.selectedRole" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="#0A56D0">
              <path :d="roleIcons[session.selectedRole.id]" />
            </svg>
            <span>Role: <strong>{{ session.selectedRole?.short ?? '—' }}</strong></span>
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="#44474E">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </summary>
          <div class="role-panel absolute left-0 top-12 z-20 w-[min(300px,calc(100vw-1.5rem))] rounded-xl bg-menu py-2 shadow-menu xl:left-auto xl:right-0">
            <p class="px-4 py-2 text-xs leading-4 text-muted">
              {{ session.selectedRole ? `Signed in as ${session.selectedRole.title}` : 'Not signed in' }}
            </p>
            <NuxtLink to="/role-selection" class="flex min-h-14 items-center gap-3.5 px-4 text-[15px] leading-5 text-on-surface no-underline hover:bg-[rgba(26,28,30,0.08)]">
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="#44474E">
                <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
              </svg>
              Switch role
            </NuxtLink>
            <div class="my-2 h-px bg-border" />
            <button type="button" class="flex min-h-14 w-full items-center gap-3.5 px-4 text-left text-[15px] leading-5 text-on-surface hover:bg-[rgba(26,28,30,0.08)]" @click="leaveSession">
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="#44474E">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              Leave session
            </button>
          </div>
        </details>
      </div>

      <div class="ml-auto flex shrink-0 xl:ml-0 xl:justify-self-end">
        <span
          role="timer"
          :aria-label="timerLabel"
          class="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-[20px] bg-[#FFDAD6] pl-3 pr-3 text-xs font-medium leading-5 text-[#410002] tabular-nums sm:h-10 sm:gap-2.5 sm:pl-3.5 sm:pr-4 sm:text-sm"
        >
          <span v-if="session.sessionLive" class="pulse" aria-hidden="true" />
          <span class="sm:hidden">{{ session.sessionLive ? 'Live' : 'Hold' }} {{ clock }}</span>
          <span class="hidden sm:inline">{{ timerLabel }}</span>
        </span>
      </div>
    </header>

    <nav aria-label="Role tools" class="portal-tabs flex h-14 shrink-0 overflow-x-auto border-b border-border bg-surface px-2">
      <button
        v-for="tab in roleTabs"
        :key="tab.id"
        type="button"
        class="relative inline-flex h-14 shrink-0 items-center whitespace-nowrap px-3 text-sm font-medium leading-5 tracking-[0.01em]"
        :class="session.activeTab === tab.id ? 'text-primary' : 'text-muted hover:bg-[rgba(26,28,30,0.06)] hover:text-on-surface'"
        :aria-current="session.activeTab === tab.id ? 'page' : undefined"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
        <span
          v-if="tab.badge"
          class="ml-2 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error px-1 text-[11px] font-medium leading-none text-white"
        >
          {{ tab.badge }}
        </span>
        <span v-if="session.activeTab === tab.id" class="absolute inset-x-2 bottom-0 h-[3px] rounded-t-[3px] bg-primary" />
      </button>
    </nav>

    <div class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background p-3 sm:p-4 xl:overflow-hidden xl:p-6">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.role-menu summary::-webkit-details-marker {
  display: none;
}

.role-menu[open] summary {
  background: #dae2ff;
  border-color: #0a56d0;
}

@media (max-width: 1279px) {
  .role-menu[open] .role-panel {
    position: fixed;
    top: auto;
    right: 12px;
    bottom: 12px;
    left: 12px;
    width: auto;
  }
}

.portal-tabs {
  scrollbar-width: none;
}

.portal-tabs::-webkit-scrollbar {
  display: none;
}

.pulse {
  position: relative;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: #ba1a1a;
}

.pulse::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: #ba1a1a;
  animation: portal-pulse 1.6s ease-out infinite;
}

@keyframes portal-pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}
</style>
