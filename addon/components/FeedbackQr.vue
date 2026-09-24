<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import QRCode from 'qrcode'

// Injected by slidev-theme-oxrse from events/$TRAINING_EVENT.yaml
declare const __EVENT_SCHEDULE__: { feedback_form?: string }

// Used when the training event does not set `feedback_form`
const DEFAULT_FEEDBACK_FORM = 'aMrPrz2HLg'

// `feedback_form` is a Microsoft Forms ID, or a full URL for any other form
const form = __EVENT_SCHEDULE__.feedback_form || DEFAULT_FEEDBACK_FORM
const url = /^https?:\/\//i.test(form) ? form : `https://forms.cloud.microsoft/e/${form}`

const border = 4
const { size, data } = QRCode.create(url, { errorCorrectionLevel: 'M' }).modules
const viewBox = `0 0 ${size + 2 * border} ${size + 2 * border}`

// QR code and link together take this fraction of the height below the header
const HEIGHT_FRACTION = 0.7

const { $slidev } = useSlideContext()
const slideHeight = $slidev.configs.canvasWidth / $slidev.configs.aspectRatio
const height = `calc(${HEIGHT_FRACTION} * (${slideHeight}px - var(--oxrse-header-height)))`

let path = ''
for (let r = 0; r < size; r++) {
  for (let c = 0; c < size; c++) {
    if (data[r * size + c])
      path += `M${c + border} ${r + border}h1v1h-1z`
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-2" :style="{ height }">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="viewBox"
      shape-rendering="crispEdges"
      class="flex-1 min-h-0 aspect-square"
      role="img"
      aria-label="Feedback form QR code"
    >
      <rect width="100%" height="100%" fill="#fff" />
      <path fill="#000" :d="path" />
    </svg>
    <a :href="url" target="_blank" class="text-sm">{{ url }}</a>
  </div>
</template>
