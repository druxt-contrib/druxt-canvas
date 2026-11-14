/**
 * Builds a Nuxt head object from a `metatag` field value.
 *
 * Each tag keeps its Drupal attributes, and gets a `hid` from its `name`,
 * `property` or `rel`, so it replaces a tag of the same kind set higher up,
 * such as the canonical link DruxtRouter sets.
 *
 * @param {object[]} metatag - The `metatag` field: `{ tag, attributes }` items.
 *
 * @returns {object} The head object, with `title`, `meta` and `link`.
 */
export const getHead = (metatag) => {
  const head = { meta: [], link: [] }
  for (const item of Array.isArray(metatag) ? metatag : []) {
    const { tag, attributes } = item || {}
    if (!attributes) continue

    if (tag === 'meta' && attributes.name === 'title') {
      head.title = attributes.content
    } else if (tag === 'meta') {
      head.meta.push({
        hid: attributes.name || attributes.property || attributes['http-equiv'],
        ...attributes,
      })
    } else if (tag === 'link') {
      head.link.push({ hid: attributes.rel, ...attributes })
    }
  }
  return head
}
