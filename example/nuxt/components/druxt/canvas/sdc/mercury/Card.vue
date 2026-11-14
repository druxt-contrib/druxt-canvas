<template>
  <article class="card">
    <h3>{{ headingText }}</h3>
    <p>{{ text }}</p>
    <NuxtLink v-if="url" :to="url">Read more</NuxtLink>
  </article>
</template>

<script>
import { DruxtCanvasComponentMixin } from '@druxt-contrib/canvas'

export default {
  mixins: [DruxtCanvasComponentMixin],
  props: {
    headingText: { type: String, default: '' },
    text: { type: String, default: '' },
    url: { type: String, default: '' },
  },
}
</script>
