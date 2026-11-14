<template>
  <DruxtCanvas :value="page" metatags />
</template>

<script>
// A Canvas page of code components, saved as pages/index.vue's is.
import resource from '../../../test/fixtures/canvas-page-3.json'

export default {
  data: () => ({ page: resource.data }),
}
</script>
