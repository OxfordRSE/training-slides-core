<script setup>
// Animated mock-up of commenting on course material on train.rse.ox.ac.uk,
// played by SiteDemo. The paragraph is grey bars and the comment is a neutral
// example, so it suits any course.
//
// @unocss-ignore: this file uses its own class names, not UnoCSS utilities
import { createTimeline } from '../utils/site-demo.js'

const COMMENT = 'Could you explain this step?'
// The selection grows one "character" at a time while the cursor drags
const DRAG = '..........'
const SELECTION_WIDTH = 36 // % of the line, once fully selected

const steps = [
  'Select the text you want to comment on',
  'Click <b>Comment</b>',
  'Type your comment and <b>save</b> it',
  'A <b>comment icon</b> marks the paragraph; click it to see the comments',
]

const initial = {
  selection: '',
  popup: false,
  panel: false,
  comment: '',
  saved: false,
}

const timeline = createTimeline(({ wait, move, click, set, type }) => {
  wait(1000)
  move('selectionStart')
  move('selectionEnd', 0)
  type('selection', DRAG, 400)
  set({ popup: true, step: 1 }, 400)
  move('commentButton', 600)
  click()
  set({ popup: false, panel: true, step: 2 }, 700)
  move('commentBox', 700)
  click()
  type('comment', COMMENT)
  move('save', 700)
  click()
  set({ panel: false, selection: '', saved: true, step: 3 }, 700)
  move('commentIcon', 800)
  wait(3200)
})
</script>

<template>
  <SiteDemo :timeline="timeline" :initial="initial" :steps="steps">
    <template #default="{ state }">
      <SiteDemoBar />
      <SiteDemoMaterialPage mid-page>
        <div class="commented para">
          <span class="bar-text" style="width: 95%" />
          <span class="bar-text selectable" style="width: 90%">
            <span data-target="selectionStart" class="marker" style="left: 30%" />
            <span data-target="selectionEnd" class="marker" :style="{ left: `${30 + SELECTION_WIDTH}%` }" />
            <span
              v-if="state.selection" class="selection"
              :style="{ width: `${(state.selection.length / DRAG.length) * SELECTION_WIDTH}%` }"
            />
          </span>
          <span class="bar-text" style="width: 55%" />

          <span v-if="state.popup" data-target="commentButton" class="comment-button">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2.5h12v8.5H6l-3.5 3v-3H2z" /><path d="M8 4.5v4.5M5.75 6.75h4.5" class="plus" /></svg>
            Comment
          </span>

          <span v-if="state.saved" data-target="commentIcon" class="comment-icon">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2.5h12v8.5H6l-3.5 3v-3H2z" /></svg>
          </span>

          <div v-if="state.panel" class="panel">
            <div class="panel-head">
              <span class="avatar" />
              <span class="close">&times;</span>
            </div>
            <span data-target="commentBox" class="comment-box" :class="{ focus: state.comment }">{{ state.comment }}</span>
            <span data-target="save" class="save">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 2.5h9l2 2v9h-11z" /><path d="M5 2.5h5v3.5H5z" class="cut" /></svg>
            </span>
          </div>
        </div>
      </SiteDemoMaterialPage>
    </template>
  </SiteDemo>
</template>

<style scoped>
.commented { position: relative; }

/* Selecting text: a blue highlight grows across part of a line */
.bar-text.selectable { position: relative; }
.marker { position: absolute; top: 50%; width: 1px; height: 1px; }
.selection {
  position: absolute;
  left: 30%;
  top: -0.2rem;
  bottom: -0.2rem;
  border-radius: 0.1rem;
  background: rgba(37, 99, 235, 0.85);
}

.comment-button {
  position: absolute;
  top: -0.35rem;
  left: 38%;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.45rem;
  border-radius: 0.3rem;
  background: #0e7490;
  color: #fff;
  font-size: 0.55rem;
  font-weight: 600;
}
.comment-button svg { width: 0.7rem; height: 0.7rem; fill: none; stroke: #fff; stroke-width: 1.3; }

.comment-icon {
  position: absolute;
  top: -0.1rem;
  right: -1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
  background: #334155;
}
.comment-icon svg { width: 0.55rem; height: 0.55rem; fill: none; stroke: #cbd5e1; stroke-width: 1.4; }

/* Comment panel, beside the paragraph */
.panel {
  position: absolute;
  top: -0.4rem;
  left: 104%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 62%;
  padding: 0.4rem 0.5rem 0.45rem;
  border: 1px solid var(--line);
  border-radius: 0.3rem;
  background: var(--card);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}
.panel-head { display: flex; justify-content: space-between; align-items: center; }
.avatar { width: 0.8rem; height: 0.8rem; border-radius: 50%; background: #64748b; }
.close { color: var(--muted); }
.comment-box {
  display: block;
  min-height: 1.6rem;
  padding: 0.25rem 0.35rem;
  border: 2px solid #4b5563;
  border-radius: 0.3rem;
  background: #334155;
  font-size: 0.55rem;
}
.comment-box.focus { border-color: #22d3ee; }
.save { align-self: flex-end; display: inline-flex; }
.save svg { width: 0.7rem; height: 0.7rem; fill: #cbd5e1; }
.save .cut { fill: var(--card); }
</style>
