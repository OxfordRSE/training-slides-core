<script setup>
// Signed-in home page of train.rse.ox.ac.uk, for SiteDemo scenes. Styled by
// SiteDemo.vue. Cursor target: data-target="enrolOnEvent".
//
// @unocss-ignore: this file uses its own class names, not UnoCSS utilities
</script>

<template>
  <div class="page">
    <p class="site-title"><span class="logo big">OxRSE</span> OxRSE Training</p>
    <div class="columns">
      <div class="stack">
        <div class="card">
          <div class="card-head">
            <div>
              <p class="card-title">Your Events</p>
              <p class="muted small">Your enrolled events.</p>
            </div>
            <span data-target="enrolOnEvent" class="button small">+ Enrol on event</span>
          </div>
          <div class="inner">
            <div class="inner-copy">
              <span class="bar-text dim" style="width: 55%" />
              <span class="bar-text strong" style="width: 85%" />
              <span class="bar-text" style="width: 75%" />
            </div>
            <span class="btn-outline">Enrol &rarr;</span>
          </div>
          <span class="button">Browse all events</span>
        </div>
        <div class="card">
          <p class="card-title">Courses</p>
          <span class="bar-text" style="width: 70%" />
        </div>
      </div>
      <div class="card">
        <p class="card-title">Course Material</p>
        <div class="para">
          <span class="bar-text" style="width: 96%" /><span class="bar-text" style="width: 92%" /><span class="bar-text" style="width: 40%" />
        </div>
        <div class="para">
          <span class="bar-text" style="width: 94%" /><span class="bar-text" style="width: 97%" /><span class="bar-text" style="width: 90%" /><span class="bar-text" style="width: 55%" />
        </div>
        <div class="para">
          <span class="bar-text" style="width: 95%" /><span class="bar-text" style="width: 93%" /><span class="bar-text" style="width: 70%" />
        </div>
        <span class="button wide">View the teaching materials &rarr;</span>
      </div>
    </div>
  </div>
</template>
