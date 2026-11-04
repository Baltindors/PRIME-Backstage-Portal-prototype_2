<script setup lang="ts">
const slides = useSlidesStore()

const atStart = computed(() => slides.current <= 1)
const atEnd = computed(() => slides.current >= slides.total)
const slideLabel = computed(() => `Slide ${slides.current} of ${slides.total}`)

const thumbs = computed(() => {
  const windowSize = 9
  const start = Math.min(Math.max(1, slides.current - 4), slides.total - (windowSize - 1))
  return Array.from({ length: windowSize }, (_, index) => start + index)
})
</script>

<template>
  <section aria-labelledby="deck-title" class="flex h-full min-h-0 flex-col overflow-hidden rounded-card border border-border bg-surface">
    <header class="flex min-h-16 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-divider px-4 py-2 sm:px-6">
      <svg aria-hidden="true" class="shrink-0" width="22" height="22" viewBox="0 0 24 24" fill="#0A56D0">
        <path d="M10 8v8l5-4-5-4zm9-5H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
      </svg>
      <h1 id="deck-title" class="m-0 truncate text-base font-medium leading-6">
        {{ slides.fileName }}
      </h1>
      <p class="m-0 text-[13px] leading-4 text-muted">
        Viewing locally · stage advances are run by AV
      </p>
      <span class="ml-auto inline-flex h-9 items-center rounded-full bg-selected px-3.5 text-[15px] font-medium tabular-nums text-on-selected" aria-live="polite">
        {{ slideLabel }}
      </span>
    </header>

    <div class="flex min-h-0 flex-1 p-3 sm:p-4">
      <div class="stage relative min-h-0 min-w-0 flex-1">
        <div class="absolute inset-0 flex items-center justify-center gap-2 sm:gap-4">
          <button
            type="button"
            class="nav prev fit"
            :disabled="atStart"
            aria-label="Previous slide"
            @click="slides.previous()"
          >
            <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            Previous
          </button>

          <figure class="slide flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_8px_3px_rgba(0,0,0,0.12)]" :aria-label="slideLabel">
            <div class="h-[2.4%] shrink-0 bg-primary" />
            <div class="flex min-h-0 flex-1 gap-[4.8%] overflow-hidden px-[6.4%] py-[4.8%]">
              <div class="flex min-w-0 flex-1 flex-col gap-[2.4cqw]">
                <span class="text-[clamp(11px,1.7cqw,20px)] font-medium leading-none tracking-[0.1em] text-primary">SECTION 2</span>
                <span class="text-[clamp(18px,4cqw,48px)] font-medium leading-[1.25]">[Slide {{ slides.current }} title]</span>
                <div class="mt-[0.4cqw] flex flex-col gap-[1.2cqw] text-[clamp(14px,2.2cqw,28px)] leading-snug text-muted">
                  <span>• [Key point one]</span>
                  <span>• [Key point two]</span>
                  <span>• [Key point three]</span>
                </div>
              </div>
              <div class="hidden w-[35%] shrink-0 items-center justify-center rounded-[10px] border border-dashed border-[#A9ACB4] bg-background text-[clamp(12px,1.8cqw,18px)] text-subtle md:flex">
                [Figure]
              </div>
            </div>
            <div class="flex h-[7.6%] shrink-0 items-center justify-between px-[6.4%] text-[clamp(11px,1.4cqw,16px)] text-outline">
              <span>PRIME Education</span>
              <span class="tabular-nums">{{ slides.current }}</span>
            </div>
          </figure>

          <button
            type="button"
            class="nav next fit"
            :disabled="atEnd"
            aria-label="Next slide"
            @click="slides.next()"
          >
            <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
            Next
          </button>
        </div>
      </div>
    </div>

    <ul class="m-0 flex shrink-0 list-none justify-center gap-3 overflow-x-auto border-t border-divider px-4 py-4 sm:px-6 sm:pb-5" aria-label="Slide thumbnails">
      <li v-for="thumb in thumbs" :key="thumb">
        <button
          type="button"
          class="thumb"
          :class="{ 'is-current': thumb === slides.current }"
          :aria-label="`Go to slide ${thumb}`"
          :aria-current="thumb === slides.current ? 'true' : 'false'"
          @click="slides.goTo(thumb)"
        >
          <span class="frame" aria-hidden="true">
            <span class="bar bar-title" />
            <span class="bar bar-wide" />
            <span class="bar bar-mid" />
            <span class="bar bar-short" />
          </span>
          <span class="tabular-nums">{{ thumb }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.stage {
  container-type: size;
}

.fit {
  height: min(100cqh, calc((100cqw - 128px) * 420 / 747));
}

.slide {
  container-type: inline-size;
  width: min(calc(100cqw - 128px), calc(100cqh * 747 / 420));
  height: min(100cqh, calc((100cqw - 128px) * 420 / 747));
}

@media (min-width: 640px) {
  .fit {
    height: min(100cqh, calc((100cqw - 240px) * 420 / 747));
  }

  .slide {
    width: min(calc(100cqw - 240px), calc(100cqh * 747 / 420));
    height: min(100cqh, calc((100cqw - 240px) * 420 / 747));
  }
}

.nav {
  display: flex;
  width: 56px;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 16px;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

@media (min-width: 640px) {
  .nav {
    width: 104px;
  }
}

.nav.prev {
  background: #eceef2;
  color: #1a1c1e;
}

.nav.prev:hover:not(:disabled) {
  background: #e1e3e8;
}

.nav.next {
  background: #0a56d0;
  color: #ffffff;
}

.nav.next:hover:not(:disabled) {
  background: #0849b3;
}

.nav:focus-visible,
.thumb:focus-visible {
  outline: 3px solid #0a56d0;
  outline-offset: 3px;
}

.nav:disabled {
  background: #f2f3f5;
  color: #a9acb4;
  cursor: default;
}

.thumb {
  display: flex;
  width: 88px;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #44474e;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

@media (min-width: 640px) {
  .thumb {
    width: 112px;
  }
}

.frame {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 52px;
  flex-direction: column;
  gap: 5px;
  overflow: hidden;
  border: 1px solid #c4c6d0;
  border-radius: 8px;
  background: #ffffff;
  padding: 8px;
}

@media (min-width: 640px) {
  .frame {
    height: 63px;
  }
}

.thumb:hover .frame {
  border-color: #74777f;
}

.thumb.is-current {
  color: #0a56d0;
}

.thumb.is-current .frame {
  border: 3px solid #0a56d0;
  padding: 6px;
}

.bar {
  display: block;
  border-radius: 2px;
}

.bar-title {
  height: 3px;
  width: 100%;
  background: #0a56d0;
}

.bar-wide {
  height: 6px;
  width: 70%;
  background: #c4c6d0;
}

.bar-mid,
.bar-short {
  height: 4px;
  background: #e1e2ea;
}

.bar-mid {
  width: 50%;
}

.bar-short {
  width: 56%;
}
</style>
