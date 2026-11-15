/**
 * Converts a snake_case input name to camelCase.
 *
 * Canvas stores input names as the component defines them, which for most
 * components is snake_case: `heading_text` becomes `headingText`.
 *
 * @param {string} key - The input name.
 *
 * @returns {string} The camelCase name.
 */
export const camelCase = (key) =>
  // The character after a separator run is optional, so a run with no letter
  // or digit after it matches as it is, and is kept. A required one would make
  // the match fail and be retried from every separator in the run.
  String(key).replace(/[_-]+([a-zA-Z0-9]?)/g, (run, c) =>
    c ? c.toUpperCase() : run
  )

/**
 * Reads the input values of one component instance.
 *
 * `inputs_resolved` holds the values Canvas resolved for the instance, with
 * markup passed through the component's text format. The stored `inputs` are
 * not read: their markup has not been filtered, and a wrapper may render it.
 *
 * @param {CanvasItem} item - One item of the `components` field.
 *
 * @returns {object} The input values, keyed by their Canvas names.
 */
export const getInputs = (item) =>
  item.inputs_resolved && typeof item.inputs_resolved === 'object'
    ? item.inputs_resolved
    : {}

/**
 * Builds the props of one component instance: its inputs with camelCase keys.
 *
 * @param {object} inputs - The input values, keyed by their Canvas names.
 *
 * @returns {object} The props.
 */
export const getProps = (inputs) =>
  Object.keys(inputs || {}).reduce((props, key) => {
    props[camelCase(key)] = inputs[key]
    return props
  }, {})

/**
 * Builds the component tree of a Canvas page from its flat `components` field.
 *
 * Each item names its parent instance (`parent_uuid`) and the parent's slot it
 * sits in (`slot`); an item without a parent is a root. Order is the order of
 * the list, at every level.
 *
 * Items that cannot be placed are left out and reported through `warn`, never
 * moved to the root, so a page never shows content somewhere Canvas did not
 * put it:
 *
 * - `orphan`: the parent is not in the list.
 * - `slot`: the item has a parent but no slot.
 * - `cycle`: no root reaches the item, because its parents form a loop or an
 *   ancestor was left out.
 * - `invalid`: the item has no uuid or no component id.
 * - `duplicate`: an earlier item has the same uuid; the first one is kept.
 *
 * The function is pure: it neither changes its input nor logs anything.
 *
 * @example @lang js
 * import { buildCanvasTree } from '@druxt-contrib/canvas'
 *
 * const tree = buildCanvasTree(resource.attributes.components, {
 *   warn: ({ reason, item }) => console.warn(reason, item.uuid),
 * })
 *
 * @param {CanvasItem[]} items - The `components` field of a `canvas_page` resource.
 * @param {object} [options] - Options.
 * @param {Function} [options.warn] - Called once for each item left out, with `{ reason, item }`.
 *
 * @returns {CanvasNode[]} The root component instances, with their slots filled.
 */
export const buildCanvasTree = (items, { warn } = {}) => {
  const report = typeof warn === 'function' ? warn : () => {}
  const list = Array.isArray(items) ? items : []

  // One node per valid item; a repeated uuid keeps its first item.
  const nodes = new Map()
  const valid = []
  for (const item of list) {
    if (!item || !item.uuid || !item.component_id) {
      report({ reason: 'invalid', item })
      continue
    }
    if (nodes.has(item.uuid)) {
      report({ reason: 'duplicate', item })
      continue
    }

    const inputs = getInputs(item)
    nodes.set(item.uuid, {
      uuid: item.uuid,
      componentId: item.component_id,
      componentVersion: item.component_version || null,
      label: item.label || null,
      inputs,
      props: getProps(inputs),
      slots: {},
    })
    valid.push(item)
  }

  // Place each node under its parent, in list order.
  const roots = []
  const placed = []
  for (const item of valid) {
    const node = nodes.get(item.uuid)
    if (!item.parent_uuid) {
      roots.push(node)
      continue
    }

    const parent = nodes.get(item.parent_uuid)
    if (!parent) {
      report({ reason: 'orphan', item })
      continue
    }
    if (!item.slot) {
      report({ reason: 'slot', item })
      continue
    }

    // An own property, so a slot named `constructor`, `toString` or
    // `__proto__` is a slot like any other, not what Object provides.
    if (!Object.prototype.hasOwnProperty.call(parent.slots, item.slot)) {
      Object.defineProperty(parent.slots, item.slot, {
        configurable: true,
        enumerable: true,
        value: [],
        writable: true,
      })
    }
    parent.slots[item.slot].push(node)
    placed.push(item)
  }

  // A node whose parents form a loop is placed, but no root reaches it.
  const reached = new Set()
  // Every placed node has one parent, so the walk from the roots is a tree
  // and visits each node once.
  const walk = (node) => {
    reached.add(node.uuid)
    for (const children of Object.values(node.slots)) children.forEach(walk)
  }
  roots.forEach(walk)

  for (const item of placed) {
    if (!reached.has(item.uuid)) report({ reason: 'cycle', item })
  }

  return roots
}

/**
 * Splits a Canvas component id into the parts of its wrapper component name.
 *
 * The id is `<source>.<provider or plugin>.<name>`, so it already reads from
 * the general to the specific, as Druxt's component options do.
 *
 * @example @lang js
 * getComponentParts('sdc.mercury.heading')
 * // ['sdc', 'mercury', 'heading']
 * getComponentParts('block.system_menu_block.main')
 * // ['block', 'system_menu_block', 'main']
 *
 * @param {string} componentId - The Canvas component id.
 *
 * @returns {string[]} The naming parts.
 */
export const getComponentParts = (componentId) =>
  String(componentId || '')
    .split('.')
    .filter((part) => part)

/**
 * One item of a `canvas_page` resource's `components` field, as JSON:API sends it.
 *
 * @typedef {object} CanvasItem
 * @property {string} uuid - The component instance uuid.
 * @property {string} component_id - The Canvas component id, such as `sdc.mercury.heading`.
 * @property {string} [component_version] - The component version hash.
 * @property {string|null} parent_uuid - The parent instance uuid, or null for a root.
 * @property {string|null} slot - The parent's slot, or null for a root.
 * @property {string|object} [inputs] - The stored inputs, as a JSON string.
 * @property {object} [inputs_resolved] - The resolved input values.
 * @property {string|null} [label] - The instance label.
 */

/**
 * One component instance with its slots filled.
 *
 * @typedef {object} CanvasNode
 * @property {string} uuid - The component instance uuid.
 * @property {string} componentId - The Canvas component id.
 * @property {string|null} componentVersion - The component version hash.
 * @property {string|null} label - The instance label.
 * @property {object} inputs - The input values, keyed by their Canvas names.
 * @property {object} props - The input values, keyed in camelCase.
 * @property {Object<string, CanvasNode[]>} slots - The child instances of each slot, in order.
 */
