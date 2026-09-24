<script setup>
// Player for the animated train.rse.ox.ac.uk walkthroughs (EnrolDemo, LoginDemo, ...).
// A scene passes its timeline (see utils/site-demo.js), starting state and step
// captions, and draws its screens in the default slot from `state`. Elements the
// cursor visits are marked with data-target="…".
//
// @unocss-ignore: the scenes use their own class names (card, button, ...), so
// UnoCSS should not generate utilities from them (e.g. `outline` or `inline`)
import { onSlideEnter, onSlideLeave } from '@slidev/client'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { stateAt } from '../utils/site-demo.js'

const props = defineProps({
  timeline: { type: Object, required: true },
  initial: { type: Object, default: () => ({}) },
  // One caption per step, as HTML (escape any values that come from the YAML)
  steps: { type: Array, required: true },
})

const CLICK_MS = 800 // length of the yellow click highlight
const DURATION = props.timeline.duration
const stepStarts = props.timeline.stepStarts

// Playback
const t = ref(0)
const playing = ref(false)
const state = computed(() => stateAt(props.timeline, props.initial, t.value))

let frameId = null
let last = 0
function tick(now) {
  if (playing.value)
    t.value = (t.value + Math.min(now - last, 100)) % DURATION
  last = now
  frameId = requestAnimationFrame(tick)
}
function start() {
  t.value = 0
  playing.value = true
  last = performance.now()
  cancelAnimationFrame(frameId)
  frameId = requestAnimationFrame(tick)
}
function stop() {
  playing.value = false
  cancelAnimationFrame(frameId)
  t.value = 0
}
function scrub(event) {
  playing.value = false
  t.value = Number(event.target.value)
}
function jump(i) {
  t.value = stepStarts[i]
}
// Slidev ignores keys while a control has focus, which would stop the clicker
// advancing slides. Keyboard use (event.detail === 0) keeps focus as normal.
function releaseFocus(event) {
  if (event.detail !== 0 || event.type === 'pointerup')
    event.currentTarget.blur()
}

onSlideEnter(start)
onSlideLeave(stop)
onBeforeUnmount(stop)

// The cursor sits on the current target; its CSS transition animates the moves.
// Layout offsets (not screen positions) ignore Slidev's scaling and any
// slide-in transitions, so a scrub lands the cursor in the right place.
const frame = ref()
const START = { x: 60, y: 70 }
const cursor = ref(START)
// Set for a moment when the cursor returns to START (e.g. the loop restarting),
// so it jumps there instead of gliding across the frame
const instant = ref(false)
function offsetIn(el) {
  let x = el.offsetWidth / 2
  let y = el.offsetHeight / 2
  while (el && el !== frame.value) {
    x += el.offsetLeft
    y += el.offsetTop
    el = el.offsetParent
  }
  return { x: (x / frame.value.offsetWidth) * 100, y: (y / frame.value.offsetHeight) * 100 }
}
// `key` changes whenever the target or the scene changes, so re-measure then
watch(
  () => state.value.key,
  async () => {
    const name = state.value.target
    if (!name) {
      instant.value = true
      cursor.value = START
      // Re-enable the transition once the jump has been painted
      requestAnimationFrame(() => requestAnimationFrame(() => {
        instant.value = false
      }))
      return
    }
    await nextTick()
    const el = frame.value?.querySelector(`[data-target="${name}"]`)
    if (el)
      cursor.value = offsetIn(el)
  },
  { immediate: true },
)

// Click feedback, drawn from the time so it also shows when paused or scrubbed
const clickAge = computed(() => t.value - state.value.lastClick)
const clicking = computed(() => clickAge.value < 200)
const rippleStyle = computed(() => {
  const progress = clickAge.value / CLICK_MS
  if (!(progress < 1))
    return null
  return {
    left: `${cursor.value.x}%`,
    top: `${cursor.value.y}%`,
    transform: `translate(-50%, -50%) scale(${0.2 + 0.8 * progress})`,
    opacity: 1 - progress,
  }
})
</script>

<template>
  <div class="site-demo">
    <div ref="frame" class="demo">
      <slot :state="state" />

      <span v-if="rippleStyle" class="ripple" :style="rippleStyle" />

      <svg
        class="cursor" :class="{ clicking, instant }"
        :style="{ left: `${cursor.x}%`, top: `${cursor.y}%` }"
        viewBox="0 0 12 18" aria-hidden="true"
      >
        <path d="M1 1 L1 15 L4.5 11.5 L7 17 L9 16 L6.5 10.5 L11 10.5 Z" fill="#fff" stroke="#000" stroke-width="1" />
      </svg>
    </div>
    <div class="controls">
      <button class="play" :aria-label="playing ? 'Pause' : 'Play'" @click="playing = !playing; releaseFocus($event)">
        <svg v-if="playing" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" />
        </svg>
        <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.2v11.6l9.5-5.8z" /></svg>
      </button>
      <div class="track">
        <input type="range" min="0" :max="DURATION" step="10" :value="t" aria-label="Animation position" @input="scrub" @pointerup="releaseFocus">
        <button
          v-for="(at, i) in stepStarts" :key="i"
          class="tick" :class="{ reached: t >= at }"
          :style="{ left: `${(at / DURATION) * 100}%` }"
          :aria-label="`Go to step ${i + 1}`"
          @click="jump(i); releaseFocus($event)"
        >
          {{ i + 1 }}
        </button>
      </div>
    </div>
    <Transition name="caption" mode="out-in">
      <p :key="state.step" class="caption">
        <span class="step-number">Step {{ state.step + 1 }}</span>
        <!-- eslint-disable-next-line vue/no-v-html -- captions come from the scenes, with YAML values escaped -->
        <span v-html="steps[state.step]" />
      </p>
    </Transition>
  </div>
</template>

<!-- Player: frame, cursor, click highlight, controls and caption -->
<style scoped>
.site-demo {
  width: 100%;
}

.caption {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin: 0.8rem 0 0;
  font-size: 1rem;
  color: var(--oxrse-bg-colour, #002147);
}

.caption :deep(code) {
  padding: 0.05rem 0.35rem;
  border-radius: 0.25rem;
  background: #edf4f8;
  font-family: var(--slidev-code-font-family, monospace);
  font-size: 0.9em;
}

.step-number {
  padding: 0.1rem 0.5rem;
  border-radius: 0.3rem;
  background: var(--oxrse-bg-colour, #002147);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
}

.caption-enter-active,
.caption-leave-active {
  transition: opacity 0.25s;
}

.caption-enter-from,
.caption-leave-to {
  opacity: 0;
}

.demo {
  --page: #0f172a;
  --card: #1e293b;
  --inner: #111827;
  --line: #334155;
  --bar: #475569;
  --text: #f1f5f9;
  --muted: #94a3b8;
  --accent: #1b91b0;
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 16 / 8.2;
  border-radius: 0.6rem;
  background: var(--page);
  color: var(--text);
  font-size: 0.7rem;
  line-height: 1.35;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.cursor {
  position: absolute;
  width: 0.9rem;
  transform-origin: 0 0;
  transition: left 0.8s ease-in-out, top 0.8s ease-in-out, transform 0.15s;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
  pointer-events: none;
  z-index: 5;
}
.cursor.clicking { transform: scale(0.8); }
.cursor.instant { transition: none; }

.ripple {
  position: absolute;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: rgba(250, 204, 21, 0.45);
  border: 2px solid #facc15;
  pointer-events: none;
  z-index: 4;
}

/* Playback controls */
.controls {
  display: flex;
  align-items: center;
  /* Room for the step 1 marker, which is centred on the start of the track */
  gap: 1.3rem;
  margin-top: 0.6rem;
}
.play {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border: none;
  border-radius: 50%;
  background: var(--oxrse-bg-colour, #002147);
  cursor: pointer;
}
.play svg { width: 0.8rem; height: 0.8rem; fill: #fff; }
/* Numbered step markers sit above the slider line */
.track { position: relative; flex: 1; height: 2.4rem; }
.track input {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 1.1rem;
  margin: 0;
  accent-color: var(--oxrse-bg-colour, #002147);
  cursor: pointer;
}
.tick {
  position: absolute;
  top: 0;
  width: 1.1rem;
  height: 1.1rem;
  padding: 0;
  border: 1px solid var(--oxrse-bg-colour, #002147);
  border-radius: 50%;
  background: #fff;
  color: var(--oxrse-bg-colour, #002147);
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 1;
  transform: translateX(-50%);
  cursor: pointer;
}
.tick.reached { background: var(--oxrse-bg-colour, #002147); color: #fff; }
</style>

<!--
  The site itself, shared by every scene. Not scoped, because slot content is
  compiled in the scene's scope; every rule is prefixed with .site-demo instead.
-->
<style>
.site-demo p { margin: 0; }
.site-demo .muted { color: var(--muted); }
.site-demo .small { font-size: 0.6rem; }

/* Top bar (SiteDemoBar) */
.site-demo .bar {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  height: 2rem;
  margin: 0.4rem 0.6rem 0;
  padding: 0 0.6rem;
  border: 1px solid var(--line);
  border-radius: 0.35rem;
  background: var(--card);
}
.site-demo .icon { width: 1rem; height: 1rem; fill: var(--muted); }
.site-demo .icon .cut { fill: var(--card); stroke: var(--card); }
.site-demo .calendar { fill: #cbd5e1; }
.site-demo .icon-wrap { display: inline-flex; }
.site-demo .divider { width: 1px; height: 1.2rem; background: var(--line); }
.site-demo .logo {
  padding: 0 0.15rem;
  border: 1px solid #93c5fd;
  font-family: Georgia, serif;
  font-size: 0.45rem;
  color: #bfdbfe;
  background: #0b2a55;
}
.site-demo .logo.big { font-size: 0.6rem; padding: 0.1rem 0.25rem; margin-right: 0.3rem; vertical-align: middle; }
.site-demo .crumb { color: var(--muted); font-size: 0.6rem; }
.site-demo .spacer { flex: 1; }
.site-demo .at { color: var(--muted); font-weight: 700; font-size: 1rem; line-height: 1; }

/* Page scaffolding */
.site-demo .page { padding: 0.7rem 3.2rem; }
.site-demo .site-title { text-align: center; font-size: 1rem; font-weight: 700; margin-bottom: 0.6rem; }
.site-demo .page-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
.site-demo .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; align-items: start; }
.site-demo .stack { display: flex; flex-direction: column; gap: 0.6rem; }

.site-demo .card {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--line);
  border-radius: 0.35rem;
  background: var(--card);
}
.site-demo .card-head { display: flex; justify-content: space-between; align-items: flex-start; }
.site-demo .card-title { font-weight: 700; font-size: 0.85rem; }
.site-demo .inner {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 0.3rem;
  background: var(--inner);
}
.site-demo .inner-copy { display: flex; flex: 1; flex-direction: column; gap: 0.3rem; }
.site-demo .para { display: flex; flex-direction: column; gap: 0.28rem; }

/* Grey bars standing in for text */
.site-demo .bar-text { display: block; height: 0.4rem; border-radius: 0.2rem; background: var(--bar); }
.site-demo .bar-text.strong { height: 0.5rem; background: #64748b; }
.site-demo .bar-text.dim { background: var(--line); }
.site-demo .bar-text.inline { display: inline-block; vertical-align: middle; }

.site-demo .button {
  align-self: flex-start;
  padding: 0.3rem 0.6rem;
  border-radius: 0.3rem;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
}
.site-demo .button.small { padding: 0.2rem 0.45rem; font-size: 0.55rem; }
.site-demo .button.wide { align-self: stretch; text-align: center; }
.site-demo .btn-outline {
  align-self: flex-start;
  padding: 0.2rem 0.55rem;
  border: 1px solid #475569;
  border-radius: 0.3rem;
  font-size: 0.6rem;
  color: #cbd5e1;
  white-space: nowrap;
}
.site-demo .btn-outline.active { border-color: #60a5fa; box-shadow: 0 0 0 1px #60a5fa; }

/* Timelines (events list, event overview) */
.site-demo .dot {
  position: absolute;
  left: -0.27rem;
  top: 0.15rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--line);
}
/* Tag pill (the site shows e.g. a language); left blank so it suits any course */
.site-demo .tag {
  display: inline-block;
  align-self: flex-start;
  width: 1.6rem;
  height: 0.55rem;
  border: 1px solid #64748b;
  border-radius: 0.6rem;
}
</style>
