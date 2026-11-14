<template>
  <DruxtCanvas :uuid="uuid" />
</template>

<script>
// The example backend's Canvas page, fetched by uuid through the Druxt store.
// The druxt_canvas_example recipe saves it with this uuid. It is also at
// /canvas-demo, where DruxtRouter renders it by its path.
export default {
  data: () => ({ uuid: '1e3d2230-6e22-4f9a-83a3-174ec6d69087' }),
}
</script>
