# Sidebar Layout Templates

These are templates to adapt, not to paste blindly. They use the Composition API with `setup()`. Convert them to `<script setup>` if the project uses that style. Replace the `t()` calls with the project's i18n helper, or with plain strings if the app has no i18n.

## 1. `src/composables/useSidebar.js`

```javascript
import { ref, watch } from 'vue'

const STORAGE_KEY = 'ui.sidebarCollapsed'

// Module-level ref: every component that calls useSidebar() shares one state.
const collapsed = ref(localStorage.getItem(STORAGE_KEY) === 'true')

watch(collapsed, (value) => {
  localStorage.setItem(STORAGE_KEY, String(value))
})

// Auto-collapse on narrow viewports so the content area keeps at least ~900px.
// Only forces collapse; it never auto-expands over the user's choice.
const mq = window.matchMedia('(max-width: 1023px)')
const applyMq = () => { if (mq.matches) collapsed.value = true }
applyMq()
mq.addEventListener('change', applyMq)

export function useSidebar() {
  const toggle = () => { collapsed.value = !collapsed.value }
  return { collapsed, toggle }
}
```

## 2. Icons: `src/components/layout/icons.js`

These are Lucide-style 24x24 stroke icons. Each value holds only the inner SVG markup. Render them through `NavIcon` (below) so the stroke attributes live in one place.

```javascript
export const icons = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H6"/>',
  truck: '<path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  trendingUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2Z"/><circle cx="16" cy="14.5" r="1"/>',
  fileChart: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 17v-3M12 17v-6M16 17v-2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4-6.3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
  chevronsLeft: '<path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/>',
  chevronsRight: '<path d="m13 17 5-5-5-5M6 17l5-5-5-5"/>'
}
```

`NavIcon.vue`:

```vue
<template>
  <svg class="nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none"
       stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true" v-html="paths" />
</template>

<script>
import { computed } from 'vue'
import { icons } from './icons'

export default {
  name: 'NavIcon',
  props: { name: { type: String, required: true } },
  setup(props) {
    // v-html is safe here: markup comes only from the static icons map, never user input.
    const paths = computed(() => icons[props.name] || '')
    return { paths }
  }
}
</script>
```

## 3. `src/components/layout/AppSidebar.vue`

```vue
<template>
  <aside :class="['sidebar', { collapsed }]">
    <div class="sidebar-brand">
      <div class="brand-mark" aria-hidden="true">{{ brandInitial }}</div>
      <span v-show="!collapsed" class="brand-name">{{ brandName }}</span>
    </div>

    <nav class="sidebar-nav" aria-label="Main navigation">
      <div v-for="section in sections" :key="section.id" class="nav-section">
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

    <div class="sidebar-footer">
      <button class="collapse-btn" type="button" @click="toggle"
              :aria-label="collapsed ? expandLabel : collapseLabel"
              :title="collapsed ? expandLabel : collapseLabel">
        <NavIcon :name="collapsed ? 'chevronsRight' : 'chevronsLeft'" />
        <span v-show="!collapsed" class="nav-label">{{ collapseLabel }}</span>
      </button>
      <!-- Profile / user menu goes here -->
      <slot name="footer" :collapsed="collapsed" />
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
    // [{ id, label, items: [{ to, label, icon }] }] - labels already translated by the parent
    sections: { type: Array, required: true },
    collapseLabel: { type: String, default: 'Collapse' },
    expandLabel: { type: String, default: 'Expand' }
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
  width: 32px; height: 32px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: var(--radius-md);
  background: var(--gray-900); color: #fff;
  font-weight: var(--weight-semibold);
}
.brand-name { font-weight: var(--weight-semibold); white-space: nowrap; }
.sidebar-nav { flex: 1; overflow-y: auto; padding: var(--space-4) var(--space-3); }
.nav-section + .nav-section { margin-top: var(--space-6); }
.nav-section-label {
  padding: 0 var(--space-3) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-400);
}
.nav-item, .collapse-btn {
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
.nav-item + .nav-item { margin-top: 2px; }
.nav-item:hover, .collapse-btn:hover { background: var(--bg-hover); color: var(--text); }
.nav-item.active { background: var(--accent-subtle); color: var(--accent); }
.collapse-btn { border: 0; background: none; font: inherit; font-size: var(--text-sm); cursor: pointer; }
.nav-icon { flex-shrink: 0; }
.sidebar-footer {
  padding: var(--space-3);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
/* Center icons in the 64px rail */
.collapsed .nav-item, .collapsed .collapse-btn { justify-content: center; padding: 0; }
.collapsed .sidebar-brand { justify-content: center; padding: 0; }
</style>
```

## 4. `src/components/layout/AppHeader.vue`

```vue
<template>
  <header class="app-header">
    <h1 class="app-header-title">{{ title }}</h1>
    <div class="app-header-actions">
      <!-- Global filters, language switcher, notifications, profile (if not in sidebar) -->
      <slot />
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: { title: { type: String, default: '' } }
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
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.app-header-title { margin: 0; font-size: var(--text-base); font-weight: var(--weight-semibold); white-space: nowrap; }
.app-header-actions { display: flex; align-items: center; gap: var(--space-3); min-width: 0; }
</style>
```

If a global filter bar is too wide for the header, put it in a full-width strip directly below the header (inside `.app-main`, above `<router-view>`) instead of squeezing it.

## 5. Root shell (`App.vue`)

```vue
<template>
  <div :class="['app-shell', { 'sidebar-collapsed': collapsed }]">
    <AppSidebar
      :brand-name="t('nav.companyName')"
      :sections="navSections"
      :collapse-label="t('nav.collapse')"
      :expand-label="t('nav.expand')"
    >
      <template #footer="{ collapsed }">
        <ProfileMenu :compact="collapsed" />
      </template>
    </AppSidebar>

    <div class="app-body">
      <AppHeader :title="pageTitle">
        <FilterBar />
        <LanguageSwitcher />
      </AppHeader>
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebar } from './composables/useSidebar'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'

export default {
  name: 'App',
  components: { AppSidebar, AppHeader /*, existing widgets */ },
  setup() {
    const route = useRoute()
    const { collapsed } = useSidebar()
    const { t } = useI18n() // project-specific

    // computed() so labels re-translate when the locale changes
    const navSections = computed(() => [
      { id: 'overview', label: t('nav.sections.overview'), items: [
        { to: '/', label: t('nav.overview'), icon: 'dashboard' }
      ]},
      { id: 'operations', label: t('nav.sections.operations'), items: [
        { to: '/inventory', label: t('nav.inventory'), icon: 'box' },
        { to: '/orders', label: t('nav.orders'), icon: 'cart' }
      ]}
      // ...
    ])

    const pageTitle = computed(() => {
      const items = navSections.value.flatMap(s => s.items)
      const match = items.find(i => i.to === route.path)
      return match ? match.label : ''
    })

    return { collapsed, navSections, pageTitle, t }
  }
}
</script>

<style>
/* Global (unscoped): tokens from design-tokens.css go above this */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
  /* Animating the track size keeps the content edge glued to the sidebar while collapsing */
  transition: grid-template-columns var(--transition-fast);
}
.app-shell.sidebar-collapsed { grid-template-columns: var(--sidebar-collapsed) minmax(0, 1fr); }
.app-body { display: flex; flex-direction: column; min-width: 0; }
.app-main {
  flex: 1;
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}
</style>
```

`minmax(0, 1fr)` matters: without it, wide tables push the grid wider than the viewport.

## 6. Migration notes
- **Old top nav:** remove the `<header class="top-nav">` (or equivalent) markup and every selector that only served it, such as `.top-nav`, `.nav-tabs`, `.nav-container` and `::after` underline indicators. Use grep to confirm no references remain.
- **Widgets:** move them as-is. Keep their props, emits, `v-model`s and any modal they open, because modals usually stay at the root of `App.vue`, outside the grid.
- **Profile menu in the sidebar:** if its dropdown opens downward, change it to open upward (`bottom: 100%`). When collapsed, show only the avatar.
- **Page titles:** if views already render their own large `<h2>`, keep it as the page header. The AppHeader title is a smaller breadcrumb-style label, so having both is fine.
- **Fixed offsets:** look for `margin-top`/`padding-top` values that compensated for the old fixed top nav, and remove them.
- **z-index:** the header uses 20. Modals and dropdowns should be above it (for example 50+).
