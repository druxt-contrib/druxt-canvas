<template>
  <div class="druxt-card">
    <h3>{{ title }}</h3>
    <p>{{ body }}</p>
    <slot name="content" />
  </div>
</template>

<script>
import { DruxtCanvasComponentMixin } from '@druxt-contrib/canvas'

export default {
  mixins: [DruxtCanvasComponentMixin],
  props: {
    body: { type: String, default: '' },
    title: { type: String, default: '' },
  },
}
</script>
