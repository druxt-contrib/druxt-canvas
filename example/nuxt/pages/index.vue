<template>
  <DruxtCanvas :value="page" metatags />
</template>

<script>
// A Canvas page as Drupal's JSON:API sends it, saved from a Drupal CMS site
// with Canvas, and handed to DruxtCanvas rather than fetched, so it needs no
// backend: everything after the fetch is the module at work, in a real Nuxt
// build. /backend fetches a page from the example backend instead.
import resource from '../../../test/fixtures/canvas-page-2.json'

export default {
  data: () => ({ page: resource.data }),
}
</script>
