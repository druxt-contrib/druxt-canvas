<template>
  <component :is="`h${level}`" :class="`text-${align}`">{{
    headingText
  }}</component>
</template>

<script>
import { DruxtCanvasComponentMixin } from '@druxt-contrib/canvas'

export default {
  mixins: [DruxtCanvasComponentMixin],
  props: {
    align: { type: String, default: 'left' },
    headingText: { type: String, default: '' },
    level: { type: Number, default: 2 },
  },
}
</script>
