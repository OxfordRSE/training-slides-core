<script setup>
// Event overview panel of train.rse.ox.ac.uk (opened from the calendar icon),
// for SiteDemo scenes. Session dates and topics come from the event YAML; the
// material under each session is grey bars, so it suits any course.
// Cursor targets: data-target="overviewTitle", "material" (the first session's
// first item) and "collapse" (the ‹ that closes the panel).
//
// @unocss-ignore: this file uses its own class names, not UnoCSS utilities
import { eventName, sessions, siteDate } from '../utils/site-demo.js'

defineProps({
  open: { type: Boolean, default: false },
  // Highlight the first session's first material item, once it has been opened
  activeMaterial: { type: Boolean, default: false },
})

const shownSessions = sessions.slice(0, 3)
</script>

<template>
  <div class="sidebar" :class="{ open }">
    <div class="sidebar-head">
      <span class="change">&#8644; Change Event</span>
      <span class="sidebar-name">{{ eventName }}</span>
      <span data-target="collapse" class="collapse">&lsaquo;</span>
    </div>
    <p data-target="overviewTitle" class="sidebar-title">{{ eventName }}</p>
    <p class="description"><b>Description:</b> <span class="bar-text inline" style="width: 55%" /></p>
    <div v-for="(s, i) in shownSessions" :key="i" class="session">
      <span class="dot" />
      <p class="muted small">{{ siteDate(s) }}</p>
      <p class="session-title">{{ s.topic }}</p>
      <div class="session-body">
        <p><b>Location:</b> <span class="bar-text inline" style="width: 50%" /></p>
        <p><b>Material:</b></p>
        <div
          v-for="j in 2" :key="j" class="material"
          :data-target="i === 0 && j === 1 ? 'material' : undefined"
        >
          <span
            class="bar-text"
            :class="{ active: activeMaterial && i === 0 && j === 1 }"
            :style="{ width: `${j === 1 ? 40 : 52}%` }"
          />
          <span class="tag" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 3;
  width: 36%;
  padding: 0.55rem 0.8rem;
  overflow: hidden;
  background: var(--card);
  border-right: 1px solid var(--line);
  box-shadow: 6px 0 20px rgba(0, 0, 0, 0.4);
  transform: translateX(-105%);
  transition: transform 0.45s ease-out;
}
.sidebar.open { transform: none; }
.sidebar-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 0.4rem;
  margin-bottom: 0.4rem;
  border-bottom: 1px solid var(--line);
  font-size: 0.6rem;
  white-space: nowrap;
}
.change { color: #93c5fd; }
.sidebar-name { overflow: hidden; text-overflow: ellipsis; color: #cbd5e1; }
.collapse { margin-left: auto; padding: 0 0.2rem; color: var(--muted); font-size: 1rem; line-height: 1; }
.sidebar-title { font-size: 1rem; font-weight: 700; line-height: 1.2; margin-bottom: 0.3rem; }
.description { color: var(--muted); margin-bottom: 0.6rem; }
.description b, .session-body b { color: #cbd5e1; }
.session {
  position: relative;
  padding: 0 0 0.6rem 0.9rem;
  margin-left: 0.25rem;
  border-left: 1px solid var(--line);
}
.session-title { font-weight: 700; font-size: 0.75rem; margin: 0.1rem 0 0.2rem; }
.session-body { display: flex; flex-direction: column; gap: 0.25rem; padding-left: 0.5rem; color: var(--muted); }
.material { display: flex; align-items: center; gap: 0.35rem; padding-left: 0.6rem; }
/* The site shows the open item in green */
.bar-text.active { background: #34d399; }
</style>
