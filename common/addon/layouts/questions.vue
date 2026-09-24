<script setup>
// Closing slide: a large centred prompt in the body. Use it without a heading in
// the markdown so the header bar shows only the logos, not the title twice.
defineProps({
  text: { type: String, default: 'Any questions?' },
})
</script>

<template>
  <div class="slidev-layout questions">
    <p class="questions-text">{{ text }}</p>
    <slot />
  </div>
</template>

<style scoped>
.questions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.questions-text {
  margin: 0;
  font-size: 4rem;
  font-weight: 500;
  color: var(--oxrse-bg-colour);
}
</style>
