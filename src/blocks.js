/**
 * Whether a Druxt module component can be rendered: it is registered, so its
 * Druxt module is installed.
 *
 * @param {object} vm - The component ViewModel.
 * @param {string} name - The component name.
 *
 * @returns {boolean} Whether the component is registered.
 */
export const hasComponent = (vm, name) =>
  !!((vm.$options || {}).components || {})[name]

/**
 * Renders a block, with its label as a heading when the block shows it.
 *
 * @param {Function} h - The Vue createElement function.
 * @param {object} options - Options.
 * @param {string} options.label - The block label.
 * @param {string} options.labelDisplay - Canvas's `label_display` input: `visible` shows the label.
 * @param {object} options.content - The block content VNode.
 * @param {string} options.uuid - The component instance uuid.
 *
 * @returns {object} The block VNode.
 */
export const renderBlock = (h, { label, labelDisplay, content, uuid }) =>
  h(
    'div',
    {
      attrs: { 'data-canvas-uuid': uuid },
    },
    [
      labelDisplay === 'visible' && label ? h('h2', [label]) : null,
      content,
    ].filter((o) => o)
  )

/**
 * Renders a development notice in place of a block that cannot be rendered.
 *
 * @param {object} vm - The component ViewModel.
 * @param {Function} h - The Vue createElement function.
 * @param {string} message - What is wrong.
 *
 * @returns {object} The notice VNode in development, an empty VNode otherwise.
 */
export const renderNotice = (vm, h, message) => {
  if (!((vm.$nuxt || {}).context || {}).isDev) return h()
  return h(
    'div',
    {
      class: 'druxt-canvas-missing',
      attrs: { 'data-canvas-component': (vm.canvas || {}).componentId },
    },
    [h('p', [message])]
  )
}
