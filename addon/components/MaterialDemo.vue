<script setup>
// Animated mock-up of opening course material from the event overview on
// train.rse.ox.ac.uk, played by SiteDemo. Session topics come from the event
// YAML; the material itself is grey bars, so it suits any course.
//
// @unocss-ignore: this file uses its own class names, not UnoCSS utilities
import { createTimeline, sessions } from '../utils/site-demo.js'

// The material page is titled after the first session, as a stand-in
const topic = String(sessions[0]?.topic ?? '')

const steps = [
  'Click the <b>calendar icon</b> to open the event overview',
  'Under a session, click an item of <b>Material</b>',
  'Click <b>&lsaquo;</b> to close the overview and work through the material',
]

const initial = {
  page: 'home',
  sidebar: false,
  opened: false,
}

const timeline = createTimeline(({ wait, move, click, set }) => {
  wait(1000)
  move('calendar')
  click()
  set({ sidebar: true, step: 1 }, 800)
  move('material')
  click()
  set({ page: 'material', opened: true }, 1400)
  set({ step: 2 })
  move('collapse', 800)
  click()
  set({ sidebar: false }, 800)
  move('pageHeading')
  wait(3500)
})
</script>

<template>
  <SiteDemo :timeline="timeline" :initial="initial" :steps="steps">
    <template #default="{ state }">
      <SiteDemoBar :crumb="state.page === 'material' ? topic : ''" />
      <SiteDemoHome v-if="state.page === 'home'" />
      <SiteDemoMaterialPage v-else :title="topic" />
      <SiteDemoOverview :open="state.sidebar" :active-material="state.opened" />
    </template>
  </SiteDemo>
</template>
