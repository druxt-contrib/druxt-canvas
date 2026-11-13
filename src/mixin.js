/**
 * Provides the Vue.js properties of a DruxtCanvas wrapper component, which
 * renders one Canvas component instance.
 *
 * Declare the instance's inputs you use as props, in camelCase. Inputs you do
 * not declare stay in `$attrs` and are not written into the markup.
 *
 * @mixin
 *
 * @example @lang vue
 * <template>
 *   <component :is="`h${level}`">{{ headingText }}</component>
 * </template>
 *
 * <script>
 * import { DruxtCanvasComponentMixin } from '@druxt-contrib/canvas'
 *
 * export default {
 *   mixins: [DruxtCanvasComponentMixin],
 *   props: {
 *     headingText: { type: String, default: '' },
 *     level: { type: Number, default: 2 },
 *   },
 * }
 * </script>
 */
const DruxtCanvasComponentMixin = {
  inheritAttrs: false,

  /** */
  props: {
    /**
     * The component instance: `uuid`, `componentId`, `componentVersion`,
     * `label`, `inputs` (by their Canvas names) and `slots` (the slot names).
     *
     * @type {object}
     */
    canvas: {
      type: Object,
      default: () => ({}),
    },
  },
}

export { DruxtCanvasComponentMixin }
