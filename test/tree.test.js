import {
  buildCanvasTree,
  camelCase,
  getComponentParts,
  getInputs,
  getProps,
} from '../src/tree'
import { fixture } from './helpers'

const pages = {
  'canvas-page-1-home-include': { roots: ['sdc.mercury.cta'], total: 2 },
  'canvas-page-2': {
    roots: [
      'sdc.mercury.heading',
      'sdc.mercury.text',
      'sdc.mercury.section',
      'sdc.mercury.button',
      'block.system_menu_block.main',
      'block.views_block.recent_pages-block_recent_pages',
    ],
    total: 9,
  },
  'canvas-page-3': {
    roots: [
      'sdc.mercury.heading',
      'js.druxt_card',
      'js.druxt_view',
      'js.druxt_entity',
    ],
    total: 5,
  },
  'canvas-page-3-sparse': {
    roots: [
      'sdc.mercury.heading',
      'js.druxt_card',
      'js.druxt_view',
      'js.druxt_entity',
    ],
    total: 5,
  },
}

// Counts the nodes of a tree.
const count = (nodes) =>
  nodes.reduce(
    (sum, node) =>
      sum +
      1 +
      Object.values(node.slots).reduce((s, children) => s + count(children), 0),
    0
  )

describe('buildCanvasTree', () => {
  test.each(Object.entries(pages))(
    '%s builds the whole tree without warnings',
    (name, expected) => {
      const items = fixture(name).data.attributes.components
      const warn = jest.fn()
      const tree = buildCanvasTree(items, { warn })

      expect(warn).not.toHaveBeenCalled()
      expect(tree.map((node) => node.componentId)).toStrictEqual(expected.roots)
      expect(count(tree)).toBe(expected.total)
      expect(count(tree)).toBe(items.length)
    }
  )

  test('nests by parent and slot, in list order', () => {
    const tree = buildCanvasTree(
      fixture('canvas-page-2').data.attributes.components
    )
    const section = tree[2]

    expect(section.componentId).toBe('sdc.mercury.section')
    expect(Object.keys(section.slots)).toStrictEqual([
      'header_slot',
      'main_slot',
    ])
    expect(
      section.slots.header_slot.map((node) => node.props.headingText)
    ).toStrictEqual(['Two cards'])
    expect(
      section.slots.main_slot.map((node) => node.props.headingText)
    ).toStrictEqual(['First card', 'Second card'])
    expect(section.slots.main_slot[0].slots).toStrictEqual({})
  })

  test('gives each node its inputs, camelCase props and metadata', () => {
    const [heading] = buildCanvasTree(
      fixture('canvas-page-2').data.attributes.components
    )

    expect(heading).toStrictEqual({
      uuid: '9fa5f3f0-1958-4f20-81b5-e5b708cb3f7e',
      componentId: 'sdc.mercury.heading',
      componentVersion: '9ba4baa1476e5856',
      label: null,
      inputs: {
        heading_text: 'Druxt meets Canvas',
        level: 1,
        text_size: 'heading-responsive-7xl',
        text_color: 'default',
        align: 'left',
      },
      props: {
        headingText: 'Druxt meets Canvas',
        level: 1,
        textSize: 'heading-responsive-7xl',
        textColor: 'default',
        align: 'left',
      },
      slots: {},
    })
  })

  test('nests a slot of a code component', () => {
    const tree = buildCanvasTree(
      fixture('canvas-page-3').data.attributes.components
    )
    const card = tree[1]

    expect(card.props).toStrictEqual({
      title: 'A Druxt card',
      body: 'Props arrive as data.',
    })
    expect(
      card.slots.content.map((node) => [node.componentId, node.props])
    ).toStrictEqual([['js.druxt_menu', { menu: 'main' }]])
    expect(tree[2].props).toStrictEqual({
      viewId: 'recent_pages',
      displayId: 'block_recent_pages',
    })
  })

  test('nests a slot on the front page', () => {
    const [cta] = buildCanvasTree(
      fixture('canvas-page-1-home-include').data.attributes.components
    )
    expect(cta.slots.actions.map((node) => node.componentId)).toStrictEqual([
      'sdc.mercury.button',
    ])
  })

  test('reads the inputs when the resolved inputs are absent', () => {
    const items = fixture('canvas-page-2').data.attributes.components
    for (const item of items) delete item.inputs_resolved
    const [heading, text] = buildCanvasTree(items)

    expect(heading.props.headingText).toBe('Druxt meets Canvas')
    expect(text.props.text).toBe(
      '<p>A Canvas page rendered by a <strong>Nuxt</strong> frontend.</p>'
    )
  })

  test('leaves out an orphan and an item without a slot, and says why', () => {
    const items = fixture('canvas-page-2').data.attributes.components
    items.push({
      uuid: 'orphan',
      component_id: 'sdc.mercury.text',
      parent_uuid: 'missing',
      slot: 'main_slot',
    })
    items.push({
      uuid: 'no-slot',
      component_id: 'sdc.mercury.text',
      parent_uuid: items[2].uuid,
      slot: null,
    })
    const warn = jest.fn()
    const tree = buildCanvasTree(items, { warn })

    expect(count(tree)).toBe(9)
    expect(
      warn.mock.calls.map(([{ reason, item }]) => [reason, item.uuid])
    ).toEqual([
      ['orphan', 'orphan'],
      ['slot', 'no-slot'],
    ])
  })

  test('leaves out items whose parents form a loop, with their children', () => {
    const items = [
      {
        uuid: 'root',
        component_id: 'sdc.a.root',
        parent_uuid: null,
        slot: null,
      },
      { uuid: 'a', component_id: 'sdc.a.a', parent_uuid: 'b', slot: 's' },
      { uuid: 'b', component_id: 'sdc.a.b', parent_uuid: 'a', slot: 's' },
      { uuid: 'c', component_id: 'sdc.a.c', parent_uuid: 'a', slot: 's' },
      {
        uuid: 'self',
        component_id: 'sdc.a.self',
        parent_uuid: 'self',
        slot: 's',
      },
    ]
    const warn = jest.fn()
    const tree = buildCanvasTree(items, { warn })

    expect(tree.map((node) => node.uuid)).toStrictEqual(['root'])
    expect(
      warn.mock.calls.map(([{ reason, item }]) => [reason, item.uuid])
    ).toEqual([
      ['cycle', 'a'],
      ['cycle', 'b'],
      ['cycle', 'c'],
      ['cycle', 'self'],
    ])
  })

  test('leaves out invalid and repeated items', () => {
    const warn = jest.fn()
    const tree = buildCanvasTree(
      [
        null,
        { uuid: 'x' },
        { component_id: 'sdc.a.b' },
        {
          uuid: 'one',
          component_id: 'sdc.a.first',
          parent_uuid: null,
          slot: null,
        },
        {
          uuid: 'one',
          component_id: 'sdc.a.second',
          parent_uuid: null,
          slot: null,
        },
      ],
      { warn }
    )

    expect(tree.map((node) => node.componentId)).toStrictEqual(['sdc.a.first'])
    expect(warn.mock.calls.map(([{ reason }]) => reason)).toEqual([
      'invalid',
      'invalid',
      'invalid',
      'duplicate',
    ])
  })

  test('accepts anything that is not a list, and no warn callback', () => {
    expect(buildCanvasTree(undefined)).toStrictEqual([])
    expect(buildCanvasTree(null, { warn: 'no' })).toStrictEqual([])
    expect(buildCanvasTree({})).toStrictEqual([])
    expect(
      buildCanvasTree([
        { uuid: 'o', component_id: 'sdc.a.b', parent_uuid: 'gone', slot: 's' },
      ])
    ).toStrictEqual([])
    expect(
      buildCanvasTree([
        null,
        { uuid: 'd', component_id: 'sdc.a.b' },
        { uuid: 'd', component_id: 'sdc.a.b' },
      ])
    ).toHaveLength(1)
  })

  test('does not change its input', () => {
    const items = fixture('canvas-page-2').data.attributes.components
    const copy = JSON.parse(JSON.stringify(items))
    buildCanvasTree(items)
    expect(items).toStrictEqual(copy)
  })
})

describe('getInputs', () => {
  test('prefers the resolved inputs', () => {
    expect(
      getInputs({ inputs: '{"a":1}', inputs_resolved: { a: 2 } })
    ).toStrictEqual({ a: 2 })
  })

  test('parses the stored inputs', () => {
    expect(getInputs({ inputs: '{"a":1}' })).toStrictEqual({ a: 1 })
    expect(getInputs({ inputs: { a: 3 } })).toStrictEqual({ a: 3 })
  })

  test('answers an empty object for anything else', () => {
    expect(getInputs({ inputs: 'not json' })).toStrictEqual({})
    expect(getInputs({ inputs: '"a string"' })).toStrictEqual({})
    expect(getInputs({ inputs: null })).toStrictEqual({})
    expect(getInputs({})).toStrictEqual({})
  })
})

describe('getProps', () => {
  test('camelCases the keys, and only the keys', () => {
    expect(
      getProps({ view_id: 'a', nested: { display_id: 'b' } })
    ).toStrictEqual({ viewId: 'a', nested: { display_id: 'b' } })
    expect(getProps(undefined)).toStrictEqual({})
  })
})

describe('camelCase', () => {
  test.each([
    ['heading_text', 'headingText'],
    ['is_text_centered', 'isTextCentered'],
    ['level', 'level'],
    ['label-display', 'labelDisplay'],
    ['margin_block_start', 'marginBlockStart'],
  ])('%s is %s', (input, output) => {
    expect(camelCase(input)).toBe(output)
  })
})

describe('getComponentParts', () => {
  test.each([
    ['sdc.mercury.heading', ['sdc', 'mercury', 'heading']],
    ['js.druxt_card', ['js', 'druxt_card']],
    ['block.system_menu_block.main', ['block', 'system_menu_block', 'main']],
    [
      'block.views_block.recent_pages-block_recent_pages',
      ['block', 'views_block', 'recent_pages-block_recent_pages'],
    ],
    [undefined, []],
  ])('%s', (input, output) => {
    expect(getComponentParts(input)).toStrictEqual(output)
  })
})
