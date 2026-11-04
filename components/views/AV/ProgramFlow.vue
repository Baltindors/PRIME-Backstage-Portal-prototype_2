<script setup lang="ts">
const flow = useProgramFlowStore()
const scroller = ref<HTMLElement | null>(null)

const pageLabel = computed(() => `Page ${flow.page} of ${flow.pageCount}`)

function showPage(number: number) {
  flow.setPage(number)
  const root = scroller.value
  const target = root?.querySelector<HTMLElement>(`[data-page="${number}"]`)
  if (!root || !target) return
  const top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
  root.scrollTo({ top, behavior: 'smooth' })
}

function onScroll() {
  const root = scroller.value
  if (!root) return
  const edge = root.getBoundingClientRect().top + 48
  let current = 1
  for (const el of root.querySelectorAll<HTMLElement>('article[data-page]')) {
    if (el.getBoundingClientRect().top <= edge) current = Number(el.dataset.page)
  }
  flow.setPage(current)
}

function download() {
  const blob = new Blob([flow.sheetText()], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'Session agenda & cue sheet.txt'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section aria-labelledby="pdf-title" class="flex h-full min-h-0 flex-col overflow-hidden rounded-card border border-border bg-surface">
    <header class="flex min-h-16 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-divider px-4 py-2 sm:px-6">
      <svg aria-hidden="true" class="shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="#BA1A1A">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
      <h1 id="pdf-title" class="m-0 truncate text-base font-medium leading-6">
        {{ flow.fileName }}
      </h1>
      <p class="m-0 text-[13px] leading-4 text-muted">
        {{ flow.updatedLabel }}
      </p>
      <div class="ml-auto flex items-center gap-1">
        <span class="px-2 text-sm tabular-nums text-muted">{{ pageLabel }}</span>
        <span aria-hidden="true" class="mx-1 hidden h-7 w-px bg-divider sm:block" />
        <button type="button" class="icon-btn" aria-label="Zoom out" :disabled="flow.atMinZoom" @click="flow.zoomOut()">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z" />
          </svg>
        </button>
        <span class="w-[52px] text-center text-sm font-medium tabular-nums">{{ flow.zoom }}%</span>
        <button type="button" class="icon-btn" aria-label="Zoom in" :disabled="flow.atMaxZoom" @click="flow.zoomIn()">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
        <button type="button" class="icon-btn" aria-label="Download PDF" @click="download">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
        </button>
      </div>
    </header>

    <div class="flex min-h-0 flex-1">
      <div class="flex w-[112px] shrink-0 flex-col items-center gap-2 border-r border-divider bg-background px-3 py-4" role="list" aria-label="Pages">
        <button
          v-for="number in flow.pageCount"
          :key="number"
          type="button"
          class="pg-thumb"
          :class="{ 'is-current': flow.page === number }"
          :aria-label="`Page ${number}`"
          :aria-current="flow.page === number ? 'true' : undefined"
          @click="showPage(number)"
        >
          <span class="sheet" aria-hidden="true">
            <span class="line dark" />
            <span class="line" />
            <span class="line faint" />
            <span class="line faint" />
            <span class="line short" />
          </span>
          <span>{{ number }}</span>
        </button>
      </div>

      <div
        ref="scroller"
        class="flex min-w-0 flex-1 flex-col gap-6 overflow-auto bg-[#E6E8EC] p-4 sm:p-6"
        @scroll="onScroll"
      >
        <article data-page="1" class="page" :style="{ zoom: flow.zoom / 100 }" aria-label="Page 1">
          <div class="flex flex-col gap-4 px-6 py-8 sm:px-12 sm:pb-10 sm:pt-11">
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 flex-col gap-1">
                <span class="text-[10px] font-bold tracking-[0.14em] text-primary">PRIME EDUCATION · RUN OF SHOW</span>
                <span class="text-[22px] font-medium leading-7">[Activity title]</span>
                <span class="text-[11.5px] leading-4 text-muted">{{ flow.activityLine }}</span>
              </div>
              <span class="shrink-0 text-right text-[10px] leading-[14px] text-subtle">
                v[#] · Confidential<br>
                AV copy
              </span>
            </div>
            <div class="flex flex-wrap gap-x-4 gap-y-1 rounded-sm bg-[#F2F3F7] px-3 py-2.5 text-[11px] leading-4">
              <span v-for="person in flow.staff" :key="person.role">
                <strong>{{ person.role }}:</strong> {{ person.name }}
              </span>
            </div>
            <table class="agenda">
              <thead>
                <tr>
                  <th class="w-16">TIME</th>
                  <th>SEGMENT</th>
                  <th class="w-40">CUE</th>
                  <th class="w-[92px]">OWNER</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in flow.rows" :key="row.time" :class="{ me: row.highlight }">
                  <td>{{ row.time }}</td>
                  <td>
                    <strong v-if="row.emphasis">{{ row.segment }}</strong>
                    <template v-else>{{ row.segment }}</template>
                  </td>
                  <td>{{ row.cue }}</td>
                  <td>{{ row.owner }}</td>
                </tr>
              </tbody>
            </table>
            <p class="m-0 text-[10.5px] leading-[15px] text-muted">
              {{ flow.footnote }}
            </p>
          </div>
        </article>

        <article
          v-for="note in flow.notes"
          :key="note.number"
          :data-page="note.number"
          class="page"
          :style="{ zoom: flow.zoom / 100 }"
          :aria-label="`Page ${note.number}`"
        >
          <div class="flex min-h-[360px] flex-col gap-3 px-6 py-8 sm:px-12 sm:py-11">
            <span class="text-base font-medium leading-[22px]">{{ note.title }}</span>
            <span class="text-[11.5px] leading-[17px] text-muted">{{ note.body }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.icon-btn {
  display: flex;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: #44474e;
  cursor: pointer;
}

.icon-btn:hover:not(:disabled) {
  background: rgba(26, 28, 30, 0.08);
}

.icon-btn:disabled {
  background: transparent;
  color: #c4c6d0;
  cursor: default;
}

.icon-btn:focus-visible,
.pg-thumb:focus-visible {
  outline: 3px solid #0a56d0;
  outline-offset: 3px;
}

.pg-thumb {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #44474e;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.pg-thumb:hover {
  background: rgba(26, 28, 30, 0.06);
  color: #1a1c1e;
}

.sheet {
  display: flex;
  box-sizing: border-box;
  width: 72px;
  height: 93px;
  flex-direction: column;
  gap: 4px;
  border: 1px solid #c4c6d0;
  border-radius: 4px;
  background: #ffffff;
  padding: 8px 7px;
}

.pg-thumb.is-current {
  color: #0a56d0;
}

.pg-thumb.is-current .sheet {
  border: 3px solid #0a56d0;
  padding: 6px 5px;
}

.line {
  display: block;
  height: 3px;
  width: 100%;
  border-radius: 1px;
  background: #c4c6d0;
}

.line.dark {
  height: 5px;
  width: 70%;
  background: #1a1c1e;
}

.line.faint,
.line.short {
  background: #e1e2ea;
}

.line.short {
  width: 85%;
}

.page {
  width: 612px;
  margin: 0 auto;
  background: #ffffff;
  color: #1a1c1e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.08);
}

.agenda {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
  line-height: 16px;
}

.agenda th {
  padding: 6px 8px;
  border-bottom: 1.5px solid #1a1c1e;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #44474e;
}

.agenda td {
  padding: 8px;
  border-bottom: 1px solid #e1e2ea;
  vertical-align: top;
}

.agenda tr.me td {
  background: #eef2ff;
}

.agenda tr.me td:first-child {
  box-shadow: inset 3px 0 0 #0a56d0;
}
</style>
