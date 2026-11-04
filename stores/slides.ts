export const SLIDE_TOTAL = 45

const FILE_NAME = '[Presentation title].pptx'

export const useSlidesStore = defineStore('slides', () => {
  const current = ref(12)
  const total = SLIDE_TOTAL
  const fileName = FILE_NAME

  function goTo(index: number) {
    current.value = Math.min(total, Math.max(1, index))
  }

  function previous() {
    goTo(current.value - 1)
  }

  function next() {
    goTo(current.value + 1)
  }

  return {
    current,
    total,
    fileName,
    goTo,
    previous,
    next,
  }
})
