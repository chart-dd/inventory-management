import { ref, watch } from 'vue'

const STORAGE_KEY = 'ui.sidebarCollapsed'

// Module-level ref so every component that calls useSidebar() shares the same state.
const collapsed = ref(localStorage.getItem(STORAGE_KEY) === 'true')

watch(collapsed, (value) => {
  localStorage.setItem(STORAGE_KEY, String(value))
})

// Auto-collapse on viewports ≤ 1024px so the content area keeps at least ~960px.
// Using 1024px (inclusive) ensures the exact 1024px breakpoint also gets the icon rail.
// Only forces collapse; it never auto-expands (that would override the user's stored choice).
const mq = window.matchMedia('(max-width: 1024px)')
const applyMq = () => { if (mq.matches) collapsed.value = true }
applyMq()
mq.addEventListener('change', applyMq)

export function useSidebar() {
  const toggle = () => { collapsed.value = !collapsed.value }
  return { collapsed, toggle }
}
