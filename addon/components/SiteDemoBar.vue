<script setup>
// Top bar of train.rse.ox.ac.uk, for SiteDemo scenes. Styled by SiteDemo.vue.
// Cursor targets: data-target="calendar" (signed in only) and "profile".
defineProps({
  // The calendar (event overview) icon only appears once signed in
  signedIn: { type: Boolean, default: true },
  // Breadcrumb after the logo, e.g. "Events"
  crumb: { type: String, default: '' },
})
</script>

<template>
  <div class="bar">
    <template v-if="signedIn">
      <span data-target="calendar" class="icon-wrap"><svg class="icon calendar" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.5" y="3" width="13" height="11.5" rx="2" />
        <rect x="4" y="1" width="1.6" height="4" rx="0.8" />
        <rect x="10.4" y="1" width="1.6" height="4" rx="0.8" />
        <rect x="3.5" y="7" width="9" height="1.4" class="cut" />
      </svg></span>
      <span class="divider" />
    </template>
    <span class="logo">OxRSE</span>
    <span v-if="crumb" class="crumb">&rsaquo;&nbsp;&nbsp;{{ crumb }}</span>
    <span class="spacer" />
    <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" />
      <circle cx="8.8" cy="7.2" r="3" class="cut" />
      <rect x="3.2" y="10" width="4" height="1.6" rx="0.8" transform="rotate(-45 5.2 10.8)" class="cut" />
    </svg>
    <span data-target="profile" class="icon-wrap"><svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" />
      <circle cx="8" cy="6" r="2.4" class="cut" />
      <path d="M3.8 12.4c0.9-2 2.4-2.9 4.2-2.9s3.3 0.9 4.2 2.9" class="cut" />
    </svg></span>
    <span class="divider" />
    <span class="at">@</span>
  </div>
</template>
