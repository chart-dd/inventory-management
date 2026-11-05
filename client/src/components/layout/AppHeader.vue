<template>
  <header class="app-header">
    <h1 class="app-header-title">{{ title }}</h1>
    <div class="app-header-actions">
      <!-- Right slot: language switcher, profile menu, etc. -->
      <slot />
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    title: { type: String, default: '' }
  }
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 0 var(--space-6);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}

.app-header-title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  white-space: nowrap;
  color: var(--text);
}

.app-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}
</style>
