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
 * Renders Druxt's debug message in place of a block that cannot be rendered.
 *
 * DruxtDebug shows the message in development only, and an empty element in
 * production, as every Druxt module does.
 *
 * It carries the same `data-canvas-uuid` marker as a rendered block, so every
 * component instance on the page can be found by its uuid.
 *
 * @param {Function} h - The Vue createElement function.
 * @param {string} summary - What is wrong.
 * @param {string} [uuid] - The component instance uuid.
 *
 * @returns {object} The DruxtDebug VNode.
 */
export const renderDebug = (h, summary, uuid) =>
  h('DruxtDebug', {
    attrs: uuid ? { 'data-canvas-uuid': uuid } : undefined,
    props: { summary },
  })
