<template>
  <a :class="`button button--${variant}`" :href="href || undefined">{{
    label
  }}</a>
</template>

<script>
import { DruxtCanvasComponentMixin } from '@druxt-contrib/canvas'

export default {
  mixins: [DruxtCanvasComponentMixin],
  props: {
    href: { type: String, default: '' },
    label: { type: String, default: '' },
    variant: { type: String, default: 'primary' },
  },
}
</script>
