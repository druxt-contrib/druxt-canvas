<template>
  <div class="cta">
    <h1>{{ headingText }}</h1>
    <p>{{ text }}</p>
    <div class="actions"><slot name="actions" /></div>
  </div>
</template>

<script>
import { DruxtCanvasComponentMixin } from '@druxt-contrib/canvas'

export default {
  mixins: [DruxtCanvasComponentMixin],
  props: {
    headingText: { type: String, default: '' },
    text: { type: String, default: '' },
  },
}
</script>
