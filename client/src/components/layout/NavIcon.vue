<template>
  <svg
    class="nav-icon"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="paths"
  />
</template>

<script>
import { computed } from 'vue'
import { icons } from './icons'

export default {
  name: 'NavIcon',
  props: {
    name: { type: String, required: true }
  },
  setup(props) {
    // v-html is safe here: markup comes only from the static icons map, never from user input.
    const paths = computed(() => icons[props.name] || '')
    return { paths }
  }
}
</script>
