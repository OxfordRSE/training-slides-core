<script setup>
// Replaces the theme's `orientation` layout: the event timetable, one session
// per row, with the current session (`highlight`) outlined. Each row shows the
// weekday, date and start time together in one label; a session can set an
// optional `background` colour in the event YAML, e.g. to shade alternate days.
//
// @unocss-ignore: this file uses its own class names, not UnoCSS utilities
const props = defineProps({
  highlight: { type: String, default: '' },
  // Sessions to show instead of the event's, as in the theme's layout
  sessions: { type: Array, default: null },
})

// Injected by slidev-theme-oxrse from the event YAML
// eslint-disable-next-line no-undef
const schedule = typeof __EVENT_SCHEDULE__ === 'undefined' ? {} : __EVENT_SCHEDULE__
const sessions = props.sessions || schedule.sessions || []

// "29 Sep" + year -> "Mon 29 Sep"; anything unexpected is shown as written
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function day(s) {
  const [dd, month] = String(s.date ?? '').split(' ')
  const m = MONTHS.indexOf(month)
  if (m < 0 || !schedule.year)
    return String(s.date ?? '')
  const date = new Date(Date.UTC(schedule.year, m, Number(dd)))
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })
  return `${weekday} ${s.date}`
}
</script>

<template>
  <div class="slidev-layout orientation">
    <table v-if="sessions.length" class="schedule-table">
      <tbody>
        <tr
          v-for="(s, i) in sessions" :key="i"
          :class="{ highlighted: s.topic === props.highlight, shaded: s.background }"
          :style="{ background: s.background }"
        >
          <td class="session-when"><span class="when"><span class="day">{{ day(s) }}</span><span class="time">{{ s.slot }}</span></span></td>
          <td class="session-topic">{{ s.topic }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.orientation {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 4rem;
  padding-right: 4rem;
}

.schedule-table {
  width: 80%;
  margin: 0 auto;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.schedule-table tr {
  border-bottom: 1px solid #e0e0e0;
}

.schedule-table tr:first-child {
  border-top: 1px solid #e0e0e0;
}

.schedule-table td {
  padding: 0.45rem 1rem;
}

.session-when {
  width: 1%;
  white-space: nowrap;
  font-family: var(--slidev-code-font-family, monospace);
}

/* The weekday, date and time share one label, split by a thin rule */
.when {
  display: inline-flex;
  align-items: baseline;
  padding: 0.1rem 0.5rem;
  border-radius: 0.25rem;
  background: #edf4f8;
}

/* Keep the label visible against a shaded row */
.shaded .when {
  background: #fff;
}

.day,
.time {
  font-size: 0.75rem;
  font-weight: 600;
  color: #002147;
}

.time {
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 1px solid #c5d3df;
}

.session-topic {
  color: #222;
}

.highlighted {
  outline: 2.5px solid #e8a735;
  outline-offset: -1px;
}
</style>
