<script setup>
// Animated mock-up of signing in to train.rse.ox.ac.uk, played by SiteDemo.
// A simplified sketch of the site, not a recording: grey bars stand in for text.
//
// @unocss-ignore: this file uses its own class names, not UnoCSS utilities
import { createTimeline } from '../utils/site-demo.js'

const steps = [
  'Click the <b>profile icon</b> at the top right',
  'Choose <b>Sign in</b>',
  'Click <b>Sign in with Oxford SSO</b> and use your Oxford account',
]

const initial = {
  page: 'home',
  menu: false,
}

const timeline = createTimeline(({ wait, move, click, set }) => {
  wait(1000)
  move('profile', 1000)
  click()
  set({ menu: true, step: 1 }, 700)
  move('signIn', 700)
  click()
  set({ page: 'signin', menu: false, step: 2 }, 900)
  move('sso', 1000)
  click()
  wait(3500)
})
</script>

<template>
  <SiteDemo :timeline="timeline" :initial="initial" :steps="steps">
    <template #default="{ state }">
      <!-- Home page, signed out -->
      <template v-if="state.page === 'home'">
        <SiteDemoBar :signed-in="false" />
        <div v-if="state.menu" class="menu">
          <p class="muted">Not signed in</p>
          <p data-target="signIn" class="menu-link">Sign in</p>
        </div>
        <div class="page">
          <p class="site-title"><span class="logo big">OxRSE</span> OxRSE Training</p>
          <div class="columns">
            <div class="stack">
              <div class="card">
                <div class="card-head">
                  <div>
                    <p class="card-title">Events</p>
                    <p class="muted small">Login to see your enrolled events.</p>
                  </div>
                  <span class="button small">+ Enrol on event</span>
                </div>
                <p class="inner muted small">Sign in to see the events you are enrolled on.</p>
                <span class="button">Browse all events</span>
              </div>
              <div class="card">
                <p class="card-title">Self-paced Courses</p>
                <span class="bar-text dim" style="width: 70%" />
                <div class="inner course">
                  <span class="bar-text strong" style="width: 38%" />
                  <p><span class="pill blue" /><span class="pill green" /></p>
                </div>
                <div class="inner course">
                  <span class="bar-text strong" style="width: 45%" />
                  <p><span class="pill blue" /><span class="pill green" /><span class="pill orange" /></p>
                </div>
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

      <!-- Sign-in page -->
      <div v-else class="signin-page">
        <div class="signin-card">
          <p class="signin-title">Sign in to Gutenberg</p>
          <span class="signin-button github">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0.8a7.2 7.2 0 0 0-2.3 14c0.4 0.1 0.5-0.2 0.5-0.4v-1.3c-2 0.4-2.4-0.9-2.4-0.9-0.3-0.8-0.8-1.1-0.8-1.1-0.7-0.5 0-0.5 0-0.5 0.7 0.1 1.1 0.8 1.1 0.8 0.7 1.1 1.7 0.8 2.1 0.6 0.1-0.5 0.3-0.8 0.5-1-1.6-0.2-3.3-0.8-3.3-3.6 0-0.8 0.3-1.4 0.7-1.9-0.1-0.2-0.3-0.9 0.1-1.9 0 0 0.6-0.2 2 0.7a6.8 6.8 0 0 1 3.6 0c1.4-0.9 2-0.7 2-0.7 0.4 1 0.2 1.7 0.1 1.9 0.5 0.5 0.7 1.1 0.7 1.9 0 2.8-1.7 3.4-3.3 3.6 0.3 0.2 0.5 0.7 0.5 1.4v2c0 0.2 0.1 0.5 0.5 0.4A7.2 7.2 0 0 0 8 0.8z" /></svg>
            Sign in with GitHub
          </span>
          <span data-target="sso" class="signin-button sso">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0.8 2 3v4.6c0 3.6 2.5 6.6 6 7.6 3.5-1 6-4 6-7.6V3z" /></svg>
            Sign in with Oxford SSO
          </span>
        </div>
      </div>
    </template>
  </SiteDemo>
</template>

<style scoped>
/* Profile menu, under the profile icon */
.menu {
  position: absolute;
  top: 2.3rem;
  right: 2.6rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--line);
  border-radius: 0.3rem;
  background: var(--card);
  font-size: 0.6rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}
.menu-link { color: var(--text); }

/* Self-paced courses list */
.inner.course { flex-direction: column; gap: 0.3rem; }
.pill { display: inline-block; width: 2.2rem; height: 0.45rem; margin-right: 0.25rem; border-radius: 0.3rem; }
.pill.blue { background: #0ea5e9; }
.pill.green { background: #22c55e; width: 1.4rem; }
.pill.orange { background: #f59e0b; width: 1.6rem; }

/* Sign-in page: light, unlike the rest of the site */
.signin-page {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}
.signin-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 30%;
  padding: 1rem 0.9rem;
  border-radius: 0.3rem;
  background: #fff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.12);
}
.signin-title { text-align: center; font-size: 0.85rem; font-weight: 700; color: #0f172a; margin-bottom: 0.2rem; }
.signin-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  border-radius: 0.25rem;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 600;
}
.signin-button svg { width: 0.7rem; height: 0.7rem; fill: #fff; }
.signin-button.github { background: #24292f; }
.signin-button.sso { background: #0b1e3f; }
</style>
