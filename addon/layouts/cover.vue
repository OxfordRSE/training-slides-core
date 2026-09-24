<script setup>
// The theme's cover, plus `date: first-session` in the headmatter: an event build
// shows the date of the event's first session (a generic build shows today's)
import { computed } from 'vue'
import ThemeCover from 'slidev-theme-oxrse/layouts/cover.vue'

// eslint-disable-next-line no-undef
const schedule = typeof __EVENT_SCHEDULE__ === 'undefined' ? {} : __EVENT_SCHEDULE__
const props = defineProps({
  date: { type: String, default: '' },
})

const date = computed(() => {
  if (props.date !== 'first-session')
    return props.date
  const first = Array.isArray(schedule.sessions) ? schedule.sessions[0] : undefined
  return first ? `${first.date} ${schedule.year}` : ''
})
</script>

<template>
  <ThemeCover v-bind="$attrs" :date="date">
    <slot />
  </ThemeCover>
</template>
