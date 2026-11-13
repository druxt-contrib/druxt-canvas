<template>
  <!-- Canvas has filtered the text through its text format. -->
  <div class="text" v-html="text" />
</template>

<script>
import { DruxtCanvasComponentMixin } from '@druxt-contrib/canvas'

export default {
  mixins: [DruxtCanvasComponentMixin],
  props: {
    text: { type: String, default: '' },
  },
}
</script>
