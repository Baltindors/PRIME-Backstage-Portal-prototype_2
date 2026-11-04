<script setup lang="ts">
import { toString as renderQr } from 'qrcode'

const props = defineProps<{
  value: string
  label: string
}>()

const markup = ref('')

watch(() => props.value, async (value) => {
  if (!value) {
    markup.value = ''
    return
  }
  const svg = await renderQr(value, {
    type: 'svg',
    margin: 1,
    width: 232,
    color: { dark: '#1A1C1EFF', light: '#FFFFFFFF' },
    errorCorrectionLevel: 'M',
  })
  markup.value = svg.replace(/<\?xml[^>]*>/, '')
}, { immediate: true })
</script>

<template>
  <div class="qr-frame" role="img" :aria-label="label" v-html="markup" />
</template>

<style scoped>
.qr-frame :deep(svg) {
  display: block;
  width: 220px;
  height: 220px;
}
</style>
