<script setup lang="ts">
const emit = defineEmits<{
  detected: [value: string]
  simulate: []
}>()

interface DetectedBarcode {
  rawValue: string
}

interface QrDetector {
  detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>
}

const videoRef = ref<HTMLVideoElement | null>(null)
const message = ref('')
let stream: MediaStream | null = null
let frame = 0
let stopped = false

function createDetector(): QrDetector | null {
  const BarcodeDetectorCtor = (window as Window & {
    BarcodeDetector?: new (options?: { formats?: string[] }) => QrDetector
  }).BarcodeDetector
  if (!BarcodeDetectorCtor) return null
  return new BarcodeDetectorCtor({ formats: ['qr_code'] })
}

function stopTracks() {
  stopped = true
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  stream?.getTracks().forEach(track => track.stop())
  stream = null
  if (videoRef.value) videoRef.value.srcObject = null
}

async function openCamera(): Promise<MediaStream> {
  const devices = navigator.mediaDevices
  try {
    return await devices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
  }
  catch (error) {
    if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
      throw error
    }
    return devices.getUserMedia({ video: true, audio: false })
  }
}

async function scanLoop(detector: QrDetector) {
  if (stopped) return
  const video = videoRef.value
  if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    try {
      const codes = await detector.detect(video)
      if (stopped) return
      const value = codes.find(code => code.rawValue.trim())?.rawValue.trim()
      if (value) {
        stopTracks()
        emit('detected', value)
        return
      }
    }
    catch {
      if (stopped) return
    }
  }
  if (stopped) return
  frame = requestAnimationFrame(() => {
    void scanLoop(detector)
  })
}

onMounted(() => {
  void start()
})

async function start() {
  if (!navigator.mediaDevices?.getUserMedia) {
    message.value = 'This browser cannot access a camera. Enter the token manually.'
    return
  }
  const detector = createDetector()
  if (!detector) {
    message.value = 'This browser cannot scan QR codes. Enter the token manually.'
    return
  }
  try {
    stream = await openCamera()
  }
  catch (error) {
    const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')
    message.value = denied
      ? 'Camera permission was denied. Allow camera access or enter the token manually.'
      : 'No camera was found. Enter the token manually.'
    return
  }
  if (stopped) {
    stopTracks()
    return
  }
  const video = videoRef.value
  if (!video) {
    stopTracks()
    return
  }
  video.srcObject = stream
  try {
    await video.play()
  }
  catch {
    if (!stopped) message.value = 'The camera could not start. Enter the token manually.'
    stopTracks()
    return
  }
  void scanLoop(detector)
}

onBeforeUnmount(() => {
  stopTracks()
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-if="!message" class="overflow-hidden rounded-2xl bg-[#101114]">
      <video
        ref="videoRef"
        class="aspect-video w-full object-cover"
        autoplay
        muted
        playsinline
      />
    </div>
    <p v-if="message" class="text-center text-sm leading-5 text-error" role="status">
      {{ message }}
    </p>
    <button
      type="button"
      class="h-10 w-full rounded-pill border border-outline text-sm font-medium tracking-[0.02em] text-on-surface hover:bg-hover-fill"
      @click="emit('simulate')"
    >
      Simulate Scan (Active Token)
    </button>
    <p class="text-center text-xs leading-4 tracking-[0.02em] text-subtle">
      Prototype only. Uses the first active token on this browser.
    </p>
  </div>
</template>
