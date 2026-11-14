<template>
  <section class="section">
    <header><slot name="header_slot" /></header>
    <div class="columns"><slot name="main_slot" /></div>
  </section>
</template>

<script>
import { DruxtCanvasComponentMixin } from '@druxt-contrib/canvas'

export default {
  mixins: [DruxtCanvasComponentMixin],
}
</script>
