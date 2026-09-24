<script setup>
// A page of course material on train.rse.ox.ac.uk, for SiteDemo scenes. Only
// the title is real text; everything else is grey bars and an abstract figure,
// so it suits any course. Extra content goes in the slot: after the figure at
// the top of the page, or (with `midPage`) between paragraphs further down,
// which is where exercises and comments sit.
//
// @unocss-ignore: this file uses its own class names, not UnoCSS utilities
defineProps({
  title: { type: String, default: '' },
  // Show the page scrolled past its top: paragraphs around the slot content
  midPage: { type: Boolean, default: false },
})
</script>

<template>
  <div class="material-page">
    <div v-if="midPage" class="main">
      <div class="para">
        <span class="bar-text" style="width: 92%" /><span class="bar-text" style="width: 84%" /><span class="bar-text" style="width: 45%" />
      </div>
      <slot />
      <span class="bar-text strong heading-bar" />
      <div class="para">
        <span class="bar-text" style="width: 96%" /><span class="bar-text" style="width: 90%" /><span class="bar-text" style="width: 94%" /><span class="bar-text" style="width: 58%" />
      </div>
      <div class="para">
        <span class="bar-text" style="width: 93%" /><span class="bar-text" style="width: 97%" /><span class="bar-text" style="width: 70%" />
      </div>
    </div>
    <div v-else class="main">
      <p data-target="pageHeading" class="page-heading">{{ title }}</p>
      <div class="outcomes">
        <p class="outcomes-title"><span class="check">&#10003;</span> Learning outcomes</p>
        <p v-for="w in [62, 78]" :key="w" class="outcome">
          <span class="hourglass">&#8987;</span><span class="bar-text" :style="{ width: `${w}%` }" />
        </p>
      </div>
      <div class="para">
        <span class="bar-text" style="width: 94%" /><span class="bar-text" style="width: 60%" />
      </div>
      <svg class="figure" viewBox="0 0 300 150" aria-hidden="true">
        <!-- Abstract diagram: three stores, with arrows between them -->
        <g stroke="#94a3b8" stroke-width="2">
          <line x1="50" y1="36" x2="50" y2="150" />
          <line x1="150" y1="36" x2="150" y2="150" />
          <line x1="250" y1="36" x2="250" y2="150" />
        </g>
        <rect x="20" y="6" width="60" height="30" rx="8" fill="#5b9bd5" />
        <rect x="120" y="6" width="60" height="30" rx="8" fill="#ed7d31" />
        <rect x="220" y="6" width="60" height="30" rx="8" fill="#70ad47" />
        <path d="M52 54h86v-7l12 12-12 12v-7H52z" fill="#5b9bd5" />
        <path d="M152 76h86v-7l12 12-12 12v-7h-86z" fill="#ed7d31" />
        <path d="M52 106h186v-7l12 12-12 12v-7H52z" fill="#5b9bd5" />
        <path d="M248 136H64v7l-12-12 12-12v7h184z" fill="#70ad47" />
      </svg>
      <slot />
    </div>

    <div class="toc">
      <p class="toc-title"><span class="toc-icon">&#8801;</span><span class="bar-text strong" style="width: 60%" /></p>
      <div class="toc-list">
        <span v-for="w in [85, 70, 78, 92, 60]" :key="w" class="bar-text" :style="{ width: `${w}%` }" />
      </div>
    </div>

    <div class="next-card">
      <span class="bar-text strong" style="width: 70%" />
      <span class="bar-text" style="width: 55%" />
      <span class="tag" />
      <span class="next-arrow">&rsaquo;</span>
    </div>
  </div>
</template>

<style scoped>
.material-page {
  position: absolute;
  top: 2.8rem;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}
.main {
  position: absolute;
  top: 0.4rem;
  left: 22%;
  width: 46%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.page-heading { text-align: center; font-size: 1rem; font-weight: 700; }
.outcomes {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid var(--line);
  border-radius: 0.35rem;
  background: var(--inner);
}
.outcomes-title { font-size: 0.6rem; font-weight: 600; }
.check { color: #4ade80; }
.outcome { display: flex; align-items: center; gap: 0.5rem; padding-left: 0.6rem; }
.hourglass { font-size: 0.55rem; color: #4ade80; }
.figure { width: 70%; align-self: center; }
.bar-text.strong.heading-bar { width: 35%; height: 0.75rem; margin-top: 0.4rem; }

.toc {
  position: absolute;
  top: 1.6rem;
  right: 3%;
  width: 20%;
}
.toc-title { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.5rem; }
.toc-icon { color: var(--text); font-size: 0.8rem; line-height: 1; }
.toc-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding-left: 0.5rem;
  border-left: 2px solid var(--line);
}

.next-card {
  position: absolute;
  right: 3%;
  bottom: 0.8rem;
  width: 18%;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.45rem 0.55rem;
  border: 1px solid #60a5fa;
  border-radius: 0.3rem;
  background: var(--page);
}
.next-arrow { position: absolute; right: 0.45rem; top: 0.35rem; color: var(--muted); }
</style>
