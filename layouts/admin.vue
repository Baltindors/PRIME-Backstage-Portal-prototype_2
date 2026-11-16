<script setup lang="ts">
interface NavChild {
  label: string
  to?: string
}

interface NavSection {
  id: string
  label: string
  icon: string
  children: NavChild[]
}

const route = useRoute()

const sections: NavSection[] = [
  {
    id: 'program',
    label: 'Program Management',
    icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    children: [
      { label: 'Programs' },
      { label: 'Activities' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
    children: [
      { label: 'Campaigns' },
    ],
  },
  {
    id: 'outcomes',
    label: 'Outcomes',
    icon: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',
    children: [
      { label: 'Evaluations' },
    ],
  },
  {
    id: 'reporting',
    label: 'Reporting',
    icon: 'M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
    children: [
      { label: 'Reports' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
    children: [
      { label: 'Article Uploader' },
      { label: 'SynopsiMedEd Feeds' },
      { label: 'Token Dashboard', to: '/admin/tokens' },
      { label: 'Token Generator', to: '/admin/tokens/generate' },
    ],
  },
  {
    id: 'users',
    label: 'User Manager',
    icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    children: [
      { label: 'Users' },
      { label: 'Roles' },
    ],
  },
]

const expanded = ref<Record<string, boolean>>({ tools: true })
const collapsed = ref(false)
const mobileOpen = ref(false)
const logoFailed = ref(false)

function toggleSection(id: string) {
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] }
}

function isActive(to: string) {
  const path = route.path.replace(/\/$/, '') || '/'
  return path === to
}

function openSidebar() {
  collapsed.value = false
  mobileOpen.value = true
}

function closeSidebar() {
  collapsed.value = true
  mobileOpen.value = false
}

watch(() => route.path, () => {
  mobileOpen.value = false
})
</script>

<template>
  <div class="flex min-h-screen bg-white text-[#212529]">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-30 bg-black/40 md:hidden"
      @click="mobileOpen = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-40 w-60 flex-col bg-[#3d4248] text-white md:static md:z-auto md:shrink-0"
      :class="collapsed ? 'hidden' : mobileOpen ? 'flex' : 'hidden md:flex'"
    >
      <div class="flex items-center justify-between gap-2 px-3 py-3">
        <NuxtLink to="/admin" class="flex min-w-0 flex-1 items-center" aria-label="PRIME Admin" @click="mobileOpen = false">
          <img
            v-if="!logoFailed"
            src="https://admin.primeinc.org/admin3/assets/admin_logo-DN-oTFqE.svg"
            alt="PRIME Admin"
            class="h-12 w-auto max-w-full object-contain object-left"
            @error="logoFailed = true"
          >
          <span v-else class="text-2xl font-semibold tracking-wide text-white">
            PR<span class="text-[#7dcea0]">i</span>ME
            <span class="ml-1 text-[11px] font-medium tracking-[0.14em] text-white/80">ADMIN</span>
          </span>
        </NuxtLink>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded text-white/80 hover:bg-white/10"
          aria-label="Collapse navigation"
          @click="closeSidebar"
        >
          <svg aria-hidden="true" class="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto pb-6" aria-label="Admin">
        <div v-for="section in sections" :key="section.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/90 hover:bg-white/10"
            :aria-expanded="expanded[section.id] ? 'true' : 'false'"
            @click="toggleSection(section.id)"
          >
            <svg aria-hidden="true" class="h-5 w-5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path :d="section.icon" />
            </svg>
            <span class="min-w-0 flex-1 truncate">{{ section.label }}</span>
            <svg
              aria-hidden="true"
              class="h-4 w-4 shrink-0 fill-current transition-transform"
              :class="expanded[section.id] ? 'rotate-180' : ''"
              viewBox="0 0 24 24"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>
          <ul v-if="expanded[section.id]" class="pb-1">
            <li v-for="child in section.children" :key="child.label">
              <NuxtLink
                v-if="child.to"
                :to="child.to"
                class="block py-1.5 pl-12 pr-4 text-sm"
                :class="isActive(child.to) ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'"
                :aria-current="isActive(child.to) ? 'page' : undefined"
                @click="mobileOpen = false"
              >
                {{ child.label }}
              </NuxtLink>
              <span v-else class="block py-1.5 pl-12 pr-4 text-sm text-white/70">
                {{ child.label }}
              </span>
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex items-center gap-3 border-b border-[#dee2e6] bg-white px-4 py-2.5">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded text-[#3d4248] hover:bg-[#f8f9fa]"
          :class="collapsed ? '' : 'md:hidden'"
          aria-label="Open navigation"
          @click="openSidebar"
        >
          <svg aria-hidden="true" class="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>

        <form class="flex w-full min-w-0 max-w-xl" role="search" @submit.prevent>
          <input
            type="search"
            placeholder="Search for [Project]"
            aria-label="Search for project"
            class="h-[34px] w-full rounded-l border border-[#ced4da] px-3 text-sm outline-none placeholder:text-[#6c757d] focus:border-[#86b7fe] focus:ring-2 focus:ring-[#0d6efd]/25"
          >
          <button
            type="submit"
            class="flex h-[34px] w-10 shrink-0 items-center justify-center rounded-r border border-l-0 border-[#ced4da] bg-white text-[#6c757d] hover:bg-[#f8f9fa]"
            aria-label="Search"
          >
            <svg aria-hidden="true" class="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
        </form>

        <NuxtLink
          to="/admin/tokens/generate"
          class="inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded bg-[#0d6efd] px-3 text-[13px] font-semibold uppercase leading-none tracking-wide text-white hover:bg-[#0b5ed7]"
        >
          <span aria-hidden="true" class="text-lg font-normal leading-none">+</span>
          Create
        </NuxtLink>

        <div class="ml-auto flex shrink-0 items-center gap-4">
          <button
            type="button"
            class="relative flex h-8 w-8 items-center justify-center text-[#0d6efd]"
            aria-label="Notifications, 1 unread"
          >
            <svg aria-hidden="true" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span class="absolute -right-1.5 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#dc3545] px-1 text-[11px] font-bold leading-none text-white">1</span>
          </button>

          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#28a745] text-[13px] font-bold text-white" aria-label="Signed in as LS">
            LS
          </span>
        </div>
      </header>

      <main class="flex-1 px-6 py-5">
        <slot />
      </main>

      <footer class="px-6 py-6 text-center text-xs text-black">
        1997-2026 PRIME Education, LLC
      </footer>
    </div>
  </div>
</template>
