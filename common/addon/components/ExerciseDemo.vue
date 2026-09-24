<script setup>
// Animated mock-up of checking a solution and marking an exercise complete on
// train.rse.ox.ac.uk, played by SiteDemo. Only the site's own labels and a
// generic "Exercise" title are real text; the rest of the exercise is grey bars,
// so it suits any course.
//
// @unocss-ignore: this file uses its own class names, not UnoCSS utilities
import { createTimeline } from '../utils/site-demo.js'

const steps = [
  'Expand <b>Solution</b> to check your answer',
  'Click the <b>checkbox</b> to mark the exercise complete',
  'Optionally add your solution, a difficulty rating and feedback, then <b>Save</b>',
  'The exercise turns <b>green</b> once complete',
]

const initial = {
  solution: false,
  tooltip: '',
  modal: false,
  difficulty: 5,
  complete: false,
}

const timeline = createTimeline(({ wait, move, click, set }) => {
  wait(1000)
  move('solution')
  click()
  set({ solution: true }, 1800)
  click()
  set({ solution: false }, 700)
  set({ step: 1 })
  move('complete')
  set({ tooltip: 'Mark as complete' }, 900)
  click()
  set({ tooltip: '', modal: true, step: 2 }, 900)
  move('difficulty', 800)
  click()
  set({ difficulty: 7 }, 700)
  move('save', 800)
  click()
  set({ modal: false, complete: true, step: 3 }, 700)
  move('complete', 700)
  set({ tooltip: 'Mark as incomplete' }, 1000)
  wait(2500)
})
</script>

<template>
  <SiteDemo :timeline="timeline" :initial="initial" :steps="steps">
    <template #default="{ state }">
      <SiteDemoBar />
      <SiteDemoMaterialPage mid-page>
        <div class="exercise">
          <div class="exercise-head" :class="{ complete: state.complete }">
            <span class="exercise-title">Exercise</span>
            <span class="exercise-icons">
              <span data-target="complete" class="exercise-icon">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <rect x="2" y="2" width="12" height="12" rx="2.5" />
                  <path v-if="state.complete" d="M4.8 8.2l2.2 2.2 4.2-4.6" class="tick-mark" />
                </svg>
              </span>
              <span class="exercise-icon">
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 11.5V13h1.5l7.4-7.4-1.5-1.5zM12.6 4.9l-1.5-1.5 1-1 1.5 1.5z" class="pencil" /></svg>
              </span>
              <span v-if="state.tooltip" class="tooltip">{{ state.tooltip }}</span>
            </span>
          </div>
          <div class="exercise-body">
            <span class="bar-text" style="width: 92%" />
            <span class="bar-text" style="width: 55%" />
            <div class="solution">
              <p data-target="solution" class="solution-head">
                Solution <span class="chevron">{{ state.solution ? '&#8963;' : '&#8964;' }}</span>
              </p>
              <div v-if="state.solution" class="solution-body">
                <span class="bar-text" style="width: 50%" />
                <div class="code">
                  <span class="bar-text" style="width: 70%" />
                  <span class="bar-text" style="width: 55%; margin-left: 8%" />
                  <span class="bar-text" style="width: 58%; margin-left: 8%" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SiteDemoMaterialPage>

      <!-- Edit Challenge dialog -->
      <div v-if="state.modal" class="overlay">
        <div class="dialog">
          <div class="dialog-head">
            <span>Edit Challenge</span>
            <span class="close">&times;</span>
          </div>
          <div class="dialog-body">
            <p class="checkbox-row"><span class="checkbox">&#10003;</span> Mark as complete</p>
            <p class="label">Your solution</p>
            <span class="textarea" />
            <p class="label">Difficulty (1-10) compared with surrounding challenges</p>
            <span data-target="difficulty" class="difficulty">
              <span class="difficulty-fill" :style="{ width: `${(state.difficulty - 1) / 9 * 100}%` }" />
              <span class="difficulty-thumb" :style="{ left: `${(state.difficulty - 1) / 9 * 100}%` }" />
            </span>
            <p class="label">Feedback for course instructors</p>
            <span class="textarea" />
            <span data-target="save" class="button">Save</span>
          </div>
        </div>
      </div>
    </template>
  </SiteDemo>
</template>

<style scoped>
/* Exercise (challenge) box */
.exercise {
  border: 1px solid var(--line);
  border-radius: 0.3rem;
  background: var(--card);
  overflow: visible;
}
.exercise-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0.5rem;
  border-radius: 0.3rem 0.3rem 0 0;
  background: #e2e8f0;
  transition: background 0.3s;
}
.exercise-head.complete { background: #34d399; }
.exercise-title { color: #0f172a; font-weight: 600; font-size: 0.7rem; }
.exercise-icons { position: relative; display: flex; gap: 0.25rem; }
.exercise-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 50%;
  background: #1e293b;
}
.exercise-icon svg { width: 0.62rem; height: 0.62rem; fill: none; stroke: #f1f5f9; stroke-width: 1.6; }
.exercise-icon .pencil { fill: #f1f5f9; stroke: none; }
.exercise-icon .tick-mark { stroke: #34d399; stroke-width: 2; }
.tooltip {
  position: absolute;
  top: 1.3rem;
  left: 50%;
  z-index: 2;
  padding: 0.2rem 0.45rem;
  border-radius: 0.25rem;
  background: #374151;
  color: #f1f5f9;
  font-size: 0.55rem;
  white-space: nowrap;
  transform: translateX(-25%);
}
.exercise-body { display: flex; flex-direction: column; gap: 0.35rem; padding: 0.45rem 0.5rem 0.5rem; }
.solution { margin-top: 0.2rem; border-radius: 0.25rem; background: #334155; }
.solution-head {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0.5rem;
  font-weight: 600;
  font-size: 0.6rem;
}
.chevron { color: var(--muted); }
.solution-body { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.2rem 0.5rem 0.5rem; background: var(--card); }
.code {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.45rem 0.5rem;
  border-radius: 0.25rem;
  background: #0b1220;
}

/* Edit Challenge dialog (not `.slider`: Slidev styles that class globally) */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 6, 23, 0.6);
}
.dialog { width: 52%; border-radius: 0.45rem; background: #374151; }
.dialog-head {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid #4b5563;
  font-weight: 700;
  font-size: 0.8rem;
}
.close { color: var(--muted); }
.dialog-body { display: flex; flex-direction: column; gap: 0.3rem; padding: 0.7rem 0.9rem 0.8rem; font-size: 0.55rem; }
.checkbox-row { display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.2rem; }
.checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 0.15rem;
  background: #3b82f6;
  color: #fff;
  font-size: 0.5rem;
}
.label { font-weight: 600; }
.textarea { display: block; height: 1.3rem; border: 1px solid #4b5563; border-radius: 0.25rem; background: var(--card); }
.difficulty { position: relative; display: block; height: 0.3rem; margin: 0.25rem 0; border-radius: 0.2rem; background: #4b5563; }
.difficulty-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 0.2rem; background: #3b82f6; }
.difficulty-thumb {
  position: absolute;
  top: 50%;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: #3b82f6;
  transform: translate(-50%, -50%);
  transition: left 0.3s;
}
.button { margin-top: 0.3rem; }
</style>
