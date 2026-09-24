// Shared helpers for the animated train.rse.ox.ac.uk walkthroughs in the
// epilogue (SiteDemo.vue plays them; *Demo.vue components describe each scene).

// Injected by slidev-theme-oxrse from the event YAML; tolerate it being absent
// eslint-disable-next-line no-undef
export const schedule = typeof __EVENT_SCHEDULE__ === 'undefined' ? {} : __EVENT_SCHEDULE__

// String() so that e.g. `enrolment_key: 2026` in the YAML still works
export const eventName = String(schedule.name || 'Your event')
export const enrolmentKey = String(schedule.enrolment_key || 'enrolment-key')
export const sessions = Array.isArray(schedule.sessions) ? schedule.sessions : []

export const escapeHtml = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

// "02 Nov" + "14:00" -> "Nov 2, 2026, 2:00 PM", as the site shows dates;
// anything unexpected falls back to the date as written
export function siteDate(session) {
  const [day, month] = String(session.date ?? '').split(' ')
  const slot = String(session.slot ?? '')
  if (!month || !/^\d{1,2}:\d{2}$/.test(slot))
    return String(session.date ?? '')
  const [h, m] = slot.split(':').map(Number)
  const time = `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  return `${month} ${Number(day)}, ${schedule.year}, ${time}`
}

// A scene is a timeline of timed actions, so its state at any time can be
// worked out directly, which is what lets students pause and scrub:
//   wait                      do nothing
//   move   { target }         cursor heads for the element with data-target="…"
//   click                     click at the cursor (with a yellow highlight)
//   set    { ...state }       change scene state; `step` advances the caption
//   type   { field, text }    type `text` into state[field], one character at a time
export const TYPE_MS = 70

export function createTimeline(build) {
  const events = []
  let clock = 0
  const add = (type, props = {}, duration = 0) => {
    events.push({ type, at: clock, ...props })
    clock += duration
  }
  build({
    wait: ms => add('wait', {}, ms),
    move: (target, ms = 900) => add('move', { target }, ms),
    click: () => add('click', {}, 350),
    set: (props, ms = 0) => add('set', props, ms),
    type: (field, text, ms = 300) => add('type', { field, text }, text.length * TYPE_MS + ms),
  })
  return {
    events,
    duration: clock,
    stepStarts: [0, ...events.filter(e => 'step' in e).map(e => e.at)],
  }
}

export function stateAt(timeline, initial, time) {
  const scene = { step: 0, target: null, lastClick: -Infinity, key: 0, ...initial }
  for (const { type, at, ...props } of timeline.events) {
    if (at > time)
      break
    if (type === 'set') {
      Object.assign(scene, props)
      scene.key++
    }
    else if (type === 'move') {
      scene.target = props.target
      scene.key++
    }
    else if (type === 'click') {
      scene.lastClick = at
    }
    else if (type === 'type') {
      scene[props.field] = props.text.slice(0, Math.floor((time - at) / TYPE_MS) + 1)
    }
  }
  return scene
}
