<template>
  <!-- .app-shell is the root grid: sidebar | .app-body -->
  <div :class="['app-shell', { 'sidebar-collapsed': collapsed }]">
    <AppSidebar
      :brand-name="t('nav.companyName')"
      :brand-subtitle="t('nav.subtitle')"
      :sections="navSections"
      :collapse-label="t('nav.collapse')"
      :expand-label="t('nav.expand')"
    />

    <div class="app-body">
      <AppHeader :title="pageTitle">
        <LanguageSwitcher />
        <ProfileMenu
          @show-profile-details="showProfileDetails = true"
          @show-tasks="showTasks = true"
        />
      </AppHeader>

      <!-- FilterBar sits in its own sticky strip directly below the header -->
      <FilterBar />

      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>

  <!-- Modals live outside the grid so they overlay the full viewport -->
  <ProfileDetailsModal
    :is-open="showProfileDetails"
    @close="showProfileDetails = false"
  />

  <TasksModal
    :is-open="showTasks"
    :tasks="tasks"
    @close="showTasks = false"
    @add-task="addTask"
    @delete-task="deleteTask"
    @toggle-task="toggleTask"
  />
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import { useSidebar } from './composables/useSidebar'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    AppSidebar,
    AppHeader,
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const route = useRoute()
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const { collapsed } = useSidebar()

    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    // Nav sections as a computed so labels re-translate when the locale changes
    const navSections = computed(() => [
      {
        id: 'overview',
        label: t('nav.sections.overview'),
        items: [
          { to: '/', label: t('nav.overview'), icon: 'dashboard' }
        ]
      },
      {
        id: 'operations',
        label: t('nav.sections.operations'),
        items: [
          { to: '/inventory', label: t('nav.inventory'), icon: 'box' },
          { to: '/orders', label: t('nav.orders'), icon: 'cart' },
          { to: '/demand', label: t('nav.demandForecast'), icon: 'trendingUp' }
        ]
      },
      {
        id: 'insights',
        label: t('nav.sections.insights'),
        items: [
          { to: '/spending', label: t('nav.finance'), icon: 'wallet' },
          { to: '/reports', label: t('nav.reports'), icon: 'fileChart' }
        ]
      }
    ])

    // Current page title derived from the nav item matching the active route
    const pageTitle = computed(() => {
      const items = navSections.value.flatMap(s => s.items)
      const match = items.find(i => i.to === '/' ? route.path === '/' : route.path.startsWith(i.to))
      return match ? match.label : ''
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    return {
      t,
      collapsed,
      navSections,
      pageTitle,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
/* =========================================================
   Design tokens
   ========================================================= */
:root {
  /* Spacing: 4px scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Neutral scale (slate) */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;

  /* Accent (single primary color: blue) */
  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --accent-subtle: #eff6ff;

  /* Status */
  --success: #16a34a;
  --success-bg: #f0fdf4;
  --info: #2563eb;
  --info-bg: #eff6ff;
  --warning: #b45309;
  --warning-bg: #fffbeb;
  --danger: #dc2626;
  --danger-bg: #fef2f2;

  /* Surfaces */
  --bg-app: var(--gray-50);
  --bg-surface: #ffffff;
  --bg-sidebar: #ffffff;
  --bg-hover: var(--gray-100);
  --border: var(--gray-200);
  --text: var(--gray-900);
  --text-muted: var(--gray-500);

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 0.9375rem;
  --text-lg: 1.125rem;
  --text-xl: 1.375rem;
  --text-2xl: 1.75rem;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --leading: 1.5;

  /* Shape and effects */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 999px;
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.05);
  --shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
  --focus-ring: 0 0 0 3px rgba(37, 99, 235, 0.35);

  /* Layout */
  --sidebar-width: 248px;
  --sidebar-collapsed: 64px;
  --header-height: 56px;
  --content-max: 1440px;
  --transition-fast: 160ms ease;
}

/* =========================================================
   Base reset
   ========================================================= */
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading);
  color: var(--text);
  background: var(--bg-app);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-sm);
}

/* =========================================================
   Shell layout
   ========================================================= */

/* The grid's two columns: sidebar track | content track.
   minmax(0, 1fr) on the content prevents wide tables from overflowing the viewport. */
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
  /* Animating the track size keeps the content edge glued to the sidebar */
  transition: grid-template-columns var(--transition-fast);
}

.app-shell.sidebar-collapsed {
  grid-template-columns: var(--sidebar-collapsed) minmax(0, 1fr);
}

.app-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

/* =========================================================
   Page header (used inside views)
   ========================================================= */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.page-header h2 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--text);
}

.page-header p {
  margin: var(--space-1) 0 0;
  color: var(--text-muted);
  font-size: var(--text-sm);
}

/* =========================================================
   Card
   ========================================================= */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
  margin-bottom: var(--space-5);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border);
}

.card-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text);
}

/* =========================================================
   Stats grid + stat cards
   ========================================================= */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

/* Clean white card: muted label, large semibold value, thin colored left accent per variant */
.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--border); /* overridden by variants below */
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-5);
  transition: box-shadow var(--transition-fast);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
}

.stat-label {
  color: var(--text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.stat-value {
  font-size: 2rem;
  font-weight: var(--weight-semibold);
  color: var(--text);
  letter-spacing: -0.02em;
}

/* Colored left accent border for status variants */
.stat-card.success { border-left-color: var(--success); }
.stat-card.warning { border-left-color: var(--warning); }
.stat-card.danger  { border-left-color: var(--danger); }
.stat-card.info    { border-left-color: var(--info); }

/* Keep value color hint for each variant */
.stat-card.success .stat-value { color: var(--success); }
.stat-card.warning .stat-value { color: var(--warning); }
.stat-card.danger .stat-value  { color: var(--danger); }
.stat-card.info .stat-value    { color: var(--info); }

/* =========================================================
   Badges
   ========================================================= */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}

.badge.success    { background: var(--success-bg); color: var(--success); }
.badge.info       { background: var(--info-bg);    color: var(--info); }
.badge.warning    { background: var(--warning-bg); color: var(--warning); }
.badge.danger     { background: var(--danger-bg);  color: var(--danger); }

/* Trend and priority aliases map to the same palette */
.badge.increasing { background: var(--success-bg); color: var(--success); }
.badge.decreasing { background: var(--danger-bg);  color: var(--danger); }
.badge.stable     { background: var(--info-bg);    color: var(--info); }
.badge.high       { background: var(--danger-bg);  color: var(--danger); }
.badge.medium     { background: var(--warning-bg); color: var(--warning); }
.badge.low        { background: var(--info-bg);    color: var(--info); }

/* =========================================================
   Tables
   ========================================================= */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  background: var(--gray-50);
  border-bottom: 1px solid var(--border);
}

td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
  color: var(--gray-700);
}

tbody tr {
  transition: background-color var(--transition-fast);
}

tbody tr:hover {
  background: var(--gray-50);
}

/* =========================================================
   Form controls (global baseline — FilterBar adds its own)
   ========================================================= */
select,
input[type='text'],
input[type='search'],
input[type='number'] {
  height: 36px;
  padding: 0 var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  font: inherit;
  font-size: var(--text-sm);
  color: var(--text);
}

/* =========================================================
   Buttons
   ========================================================= */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 36px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--bg-surface);
  color: var(--text);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.btn:hover { background: var(--bg-hover); }

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.btn-primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =========================================================
   Loading / error states
   ========================================================= */
.loading {
  text-align: center;
  padding: var(--space-12);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.error {
  background: var(--danger-bg);
  border: 1px solid #fecaca;
  color: var(--danger);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin: var(--space-4) 0;
  font-size: var(--text-sm);
}
</style>
