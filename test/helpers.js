import { createLocalVue, mount } from '@vue/test-utils'

import DruxtDebug from 'druxt/dist/components/DruxtDebug.vue'
import DruxtDevelTemplate from 'druxt/dist/components/DruxtDevelTemplate.vue'
import DruxtWrapper from 'druxt/dist/components/DruxtWrapper.vue'

import DruxtCanvas from '../src/components/DruxtCanvas.vue'
import DruxtCanvasComponent from '../src/components/DruxtCanvasComponent.vue'

/**
 * Waits for pending promises and timers.
 *
 * @returns {Promise} Resolves on the next macrotask.
 */
export const flushPromises = () => new Promise((resolve) => setTimeout(resolve))

/**
 * Reads a saved JSON:API response.
 *
 * @param {string} name - The fixture file name, without `.json`.
 * @returns {object} The parsed response.
 */
export const fixture = (name) =>
  JSON.parse(JSON.stringify(require(`./fixtures/${name}.json`)))

/**
 * Creates a local Vue with the Druxt and DruxtCanvas components, and stands in
 * for Nuxt: `$nuxt`, `$fetchState`, and a `fetch` hook run on creation, one
 * at a time.
 *
 * @param {object} [options] - Options.
 * @param {boolean} [options.isDev] - Whether Nuxt runs in development.
 * @param {object} [options.components] - More global components, by name.
 * @param {object} [options.store] - The `$store` mock.
 * @returns {object} The local Vue.
 */
export const createVue = ({ isDev = true, components = {}, store } = {}) => {
  const localVue = createLocalVue()
  const all = {
    DruxtCanvas,
    DruxtCanvasComponent,
    DruxtDebug,
    DruxtDevelTemplate,
    DruxtWrapper,
    ...components,
  }
  for (const [name, component] of Object.entries(all)) {
    localVue.component(name, component)
  }

  localVue.prototype.$nuxt = { context: { isDev } }
  localVue.prototype.$fetchState = { pending: false }
  localVue.prototype.$route = { meta: {}, path: '/', fullPath: '/', query: {} }
  localVue.prototype.$store = store || createStore()
  localVue.prototype.$druxt = { settings: {} }
  localVue.mixin({
    created() {
      if (this.$options.fetch) {
        // As Nuxt 2.15.8 does: one fetch at a time, so a `$fetch()` while one
        // runs is answered with that one, and a failure ends it.
        let running
        this.$fetch = () => {
          running =
            running ||
            Promise.resolve(this.$options.fetch.call(this))
              .catch(() => {})
              .then(() => {
                running = undefined
              })
          return running
        }
        this.$fetch()
      }
    },
  })

  return localVue
}

/**
 * Creates a `$store` mock that answers `druxt/getResource` from fixtures.
 *
 * @param {object} [options] - Options.
 * @param {object} [options.resources] - Responses by uuid.
 * @param {object} [options.route] - The active DruxtRouter route.
 * @returns {object} The store mock.
 */
export const createStore = ({ resources = {}, route = {} } = {}) => ({
  app: { context: {} },
  commit: jest.fn(),
  dispatch: jest.fn(async (action, payload) => {
    if (action === 'druxt/getResource') {
      if (!resources[payload.id])
        throw new Error(`No fixture for ${payload.id}`)
      return JSON.parse(JSON.stringify(resources[payload.id]))
    }
    if (action === 'druxtSchema/get') return false
    return undefined
  }),
  state: { druxtRouter: { route } },
})

/**
 * Mounts a component and waits for every fetch in its tree.
 *
 * @param {object} component - The component.
 * @param {object} options - Mount options.
 * @returns {Promise<object>} The wrapper.
 */
export const mountAll = async (component, options) => {
  const wrapper = mount(component, options)
  // Each level of the tree fetches after its parent has rendered it.
  for (let i = 0; i < 12; i++) {
    await flushPromises()
    await wrapper.vm.$nextTick()
  }
  return wrapper
}
