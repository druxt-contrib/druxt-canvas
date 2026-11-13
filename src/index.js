import { join } from 'path'

// @nuxt/components ignores a false isAsync on the directory.
const extendComponent = (component) => ({ ...component, isAsync: false })

/**
 * The wrapper components that map a Canvas block to a Druxt module, each with
 * the component it needs. One is registered only when its component is.
 *
 * @type {object}
 */
export const blockMappings = {
  DruxtCanvasBlockSystemBreadcrumbBlock: 'DruxtBreadcrumb',
  DruxtCanvasBlockSystemMenuBlock: 'DruxtMenu',
  DruxtCanvasBlockViewsBlock: 'DruxtView',
}

/**
 * The Nuxt.js module function.
 *
 * - Registers the DruxtCanvas components.
 * - Registers the Canvas menu, views and breadcrumb block wrappers, each only
 *   when the Druxt module it renders with is installed.
 *
 * The module function should not be used directly, but rather installed via
 * your Nuxt configuration file.
 *
 * @example @lang js
 * // `nuxt.config.js`
 * module.exports = {
 *   buildModules: [
 *     'druxt-entity',
 *     'druxt-router/nuxt',
 *     '@druxt-contrib/canvas'
 *   ],
 *   druxt: {
 *     baseUrl: 'https://drupal.example.com'
 *   }
 * }
 *
 * @type {Function}
 * @exports default
 * @name DruxtCanvasNuxtModule
 * @param {object} moduleOptions - The Nuxt.js module options.
 */
// eslint-disable-next-line no-unused-vars
const DruxtCanvasNuxtModule = function (moduleOptions = {}) {
  // Register the components directory. Level 1 lets a site component of the
  // same name replace one of these.
  this.nuxt.hook('components:dirs', (dirs) => {
    dirs.push({
      path: join(__dirname, 'components'),
      pathPrefix: false,
      level: 1,
      extendComponent,
    })
  })

  // Leave out a block mapping whose Druxt module is not installed, so the
  // block falls back to the site's wrappers, or to Druxt's debug message.
  this.nuxt.hook('components:extend', (components) => {
    const names = new Set(components.map((component) => component.pascalName))
    for (let index = components.length - 1; index >= 0; index--) {
      const needs = blockMappings[components[index].pascalName]
      if (needs && !names.has(needs)) {
        components.splice(index, 1)
      }
    }
  })
}
export default DruxtCanvasNuxtModule

/**
 * Vue.js mixin for DruxtCanvas wrapper components.
 *
 * @type {object}
 * @exports DruxtCanvasComponentMixin
 * @see {@link ./mixin|DruxtCanvasComponentMixin}
 */
export { DruxtCanvasComponentMixin } from './mixin'

/**
 * Builds the component tree of a Canvas page from its `components` field.
 *
 * @type {Function}
 * @exports buildCanvasTree
 * @see {@link ./tree|buildCanvasTree}
 */
export { buildCanvasTree, camelCase, getComponentParts } from './tree'

/**
 * Builds a Nuxt head object from a `metatag` field value.
 *
 * @type {Function}
 * @exports getHead
 * @see {@link ./head|getHead}
 */
export { getHead } from './head'

/**
 * Helpers for the block wrapper components.
 *
 * @see {@link ./blocks|blocks}
 */
export { hasComponent, renderBlock, renderDebug } from './blocks'
