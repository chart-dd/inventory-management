<template>
  <aside :class="['sidebar', { collapsed }]">
    <!-- Brand area: 32px dark mark + name + subtitle when expanded -->
    <div class="sidebar-brand">
      <div class="brand-mark" aria-hidden="true">{{ brandInitial }}</div>
      <div v-show="!collapsed" class="brand-text">
        <span class="brand-name">{{ brandName }}</span>
        <span class="brand-subtitle">{{ brandSubtitle }}</span>
      </div>
    </div>

    <nav class="sidebar-nav" aria-label="Main navigation">
      <div v-for="section in sections" :key="section.id" class="nav-section">
        <!-- Section label hidden when collapsed because there's no room for text -->
        <div v-show="!collapsed" class="nav-section-label">{{ section.label }}</div>
        <router-link
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          :class="['nav-item', { active: isActive(item.to) }]"
          :title="collapsed ? item.label : undefined"
          :aria-label="collapsed ? item.label : undefined"
        >
          <NavIcon :name="item.icon" />
          <span v-show="!collapsed" class="nav-label">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Footer: collapse toggle only -->
    <div class="sidebar-footer">
      <button
        class="collapse-btn"
        type="button"
        @click="toggle"
        :aria-label="collapsed ? expandLabel : collapseLabel"
        :title="collapsed ? expandLabel : collapseLabel"
      >
        <NavIcon :name="collapsed ? 'chevronsRight' : 'chevronsLeft'" />
        <span v-show="!collapsed" class="nav-label">{{ collapseLabel }}</span>
      </button>
    </div>
  </aside>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebar } from '../../composables/useSidebar'
import NavIcon from './NavIcon.vue'

export default {
  name: 'AppSidebar',
  components: { NavIcon },
  props: {
    brandName: { type: String, required: true },
    brandSubtitle: { type: String, default: '' },
    // [{ id, label, items: [{ to, label, icon }] }] - labels already translated by the parent
    sections: { type: Array, required: true },
    collapseLabel: { type: String, default: 'Collapse' },
    expandLabel: { type: String, default: 'Expand sidebar' }
  },
  setup(props) {
    const route = useRoute()
    const { collapsed, toggle } = useSidebar()

    const brandInitial = computed(() => props.brandName.charAt(0).toUpperCase())

    // Exact match for '/', prefix match for nested routes (e.g. /orders/123 highlights /orders).
    const isActive = (to) => to === '/' ? route.path === '/' : route.path.startsWith(to)

    return { collapsed, toggle, brandInitial, isActive }
  }
}
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  overflow: hidden;
  /* Width is driven by the parent grid track; overflow:hidden clips text during collapse animation */
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: var(--header-height);
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.brand-mark {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: var(--gray-900);
  color: #fff;
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
}

.brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.brand-name {
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  white-space: nowrap;
  color: var(--text);
}

.brand-subtitle {
  font-size: var(--text-xs);
  color: var(--text-muted);
  white-space: nowrap;
  margin-top: 1px;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-3);
}

.nav-section + .nav-section {
  margin-top: var(--space-6);
}

.nav-section-label {
  padding: 0 var(--space-3) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-400);
}

.nav-item,
.collapse-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  height: 36px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  color: var(--gray-600);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.nav-item + .nav-item {
  margin-top: 2px;
}

.nav-item:hover,
.collapse-btn:hover {
  background: var(--bg-hover);
  color: var(--text);
}

/* Active pill: blue accent background */
.nav-item.active {
  background: var(--accent-subtle);
  color: var(--accent);
}

.nav-item:focus-visible,
.collapse-btn:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.collapse-btn {
  border: 0;
  background: none;
  font: inherit;
  font-size: var(--text-sm);
  cursor: pointer;
}

.nav-icon {
  flex-shrink: 0;
}

.sidebar-footer {
  padding: var(--space-3);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* When collapsed: center icons in the 64px rail */
.collapsed .nav-item,
.collapsed .collapse-btn {
  justify-content: center;
  padding: 0;
}

.collapsed .sidebar-brand {
  justify-content: center;
  padding: 0;
}
</style>
