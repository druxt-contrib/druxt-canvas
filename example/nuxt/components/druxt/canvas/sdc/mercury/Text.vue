<template>
  <!-- The resolved input: Canvas has passed it through the canvas_html_block
       text format, which strips unsafe markup on the example site. A site
       that loosens that format filters the HTML before rendering it. -->
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
