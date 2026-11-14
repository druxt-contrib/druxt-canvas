<template>
  <DruxtCanvas :value="page" metatags />
</template>

<script>
// A Canvas page as Drupal's JSON:API sends it, saved from a Drupal CMS site
// with Canvas. The example backend has no Canvas, so the page is handed to
// DruxtCanvas rather than fetched: everything after the fetch is the module
// at work, in a real Nuxt build.
import resource from '../../../test/fixtures/canvas-page-2.json'

export default {
  data: () => ({ page: resource.data }),
}
</script>
