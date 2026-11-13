import { mount } from '@vue/test-utils'

import { buildCanvasTree } from '../../src/tree'
import DruxtCanvasComponent from '../../src/components/DruxtCanvasComponent.vue'
import { createVue, fixture, mountAll } from '../helpers'
import {
  DruxtCanvasJsDruxtCard,
  DruxtCanvasSdcMercuryCard,
  DruxtCanvasSdcMercuryHeading,
  DruxtCanvasSdcMercurySection,
} from '../wrappers'

const page2 = buildCanvasTree(
  fixture('canvas-page-2').data.attributes.components
)
const page3 = buildCanvasTree(
  fixture('canvas-page-3').data.attributes.components
)
const find = (tree, id) => tree.find((node) => node.componentId === id)

describe('DruxtCanvasComponent', () => {
  describe('wrapper names', () => {
    test.each([
      [
        'sdc.mercury.heading',
        [
          'DruxtCanvasSdcMercuryHeading',
          'DruxtCanvasSdcMercury',
          'DruxtCanvasSdc',
          'DruxtCanvasDefault',
        ],
      ],
      [
        'js.druxt_card',
        ['DruxtCanvasJsDruxtCard', 'DruxtCanvasJs', 'DruxtCanvasDefault'],
      ],
      [
        'block.system_menu_block.main',
        [
          'DruxtCanvasBlockSystemMenuBlockMain',
          'DruxtCanvasBlockSystemMenuBlock',
          'DruxtCanvasBlock',
          'DruxtCanvasDefault',
        ],
      ],
      [
        'block.views_block.recent_pages-block_recent_pages',
        [
          'DruxtCanvasBlockViewsBlockRecentPagesBlockRecentPages',
          'DruxtCanvasBlockViewsBlock',
          'DruxtCanvasBlock',
          'DruxtCanvasDefault',
        ],
      ],
    ])('%s', (componentId, names) => {
      const item = { uuid: 'u', componentId, props: {}, inputs: {}, slots: {} }
      const wrapper = mount(DruxtCanvasComponent, {
        localVue: createVue(),
        propsData: { item },
      })

      expect(wrapper.vm.getModuleComponents().map((o) => o.name)).toStrictEqual(
        names
      )
      // The component keeps its own name.
      expect(wrapper.vm.$options.name).toBe('DruxtCanvasComponent')
    })

    test('with a langcode, langcode variants come in, ordered by Druxt by the number of parts', () => {
      const item = {
        uuid: 'u',
        componentId: 'js.druxt_card',
        props: {},
        inputs: {},
        slots: {},
      }
      const wrapper = mount(DruxtCanvasComponent, {
        localVue: createVue(),
        propsData: { item, langcode: 'en' },
      })

      expect(wrapper.vm.getModuleComponents().map((o) => o.name)).toStrictEqual(
        [
          'DruxtCanvasJsDruxtCardEn',
          'DruxtCanvasJsEn',
          'DruxtCanvasJsDruxtCard',
          'DruxtCanvasDefaultEn',
          'DruxtCanvasJs',
          'DruxtCanvasDefault',
        ]
      )
    })

    test('resolves the most specific registered wrapper', async () => {
      const localVue = createVue({
        components: {
          DruxtCanvasSdcMercuryHeading,
          DruxtCanvasSdc: { render: (h) => h('span') },
        },
      })
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue,
        propsData: { item: find(page2, 'sdc.mercury.heading') },
      })

      expect(wrapper.vm.component.is).toBe('DruxtCanvasSdcMercuryHeading')
      expect(wrapper.html()).toContain(
        '<h1 data-uuid="9fa5f3f0-1958-4f20-81b5-e5b708cb3f7e">Druxt meets Canvas</h1>'
      )
    })

    test('falls back to DruxtCanvasDefault', async () => {
      const DruxtCanvasDefault = {
        inheritAttrs: false,
        props: ['canvas'],
        render(h) {
          return h('div', { class: 'default' }, [
            this.canvas.componentId,
            ...(this.$scopedSlots.default() || []),
          ])
        },
      }
      const localVue = createVue({
        components: { DruxtCanvasDefault, DruxtCanvasSdcMercuryHeading },
      })
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue,
        propsData: { item: find(page2, 'sdc.mercury.section') },
      })

      expect(wrapper.vm.component.is).toBe('DruxtCanvasDefault')
      // The default slot renders every Canvas slot in turn: two cards fall back too, the heading has its own wrapper.
      const html = wrapper.html()
      expect(html).toContain('sdc.mercury.section')
      expect(html.indexOf('Two cards')).toBeLessThan(
        html.indexOf('sdc.mercury.card')
      )
      expect(wrapper.findAll('.default').length).toBe(3)
    })
  })

  describe('props', () => {
    test('passes the inputs in camelCase, and the instance as canvas', async () => {
      const localVue = createVue({
        components: { DruxtCanvasSdcMercuryHeading },
      })
      const item = find(page2, 'sdc.mercury.heading')
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue,
        propsData: { item },
      })

      expect(wrapper.vm.component.props).toStrictEqual({
        canvas: {
          componentId: 'sdc.mercury.heading',
          componentVersion: '9ba4baa1476e5856',
          inputs: item.inputs,
          label: null,
          slots: [],
          uuid: item.uuid,
        },
        headingText: 'Druxt meets Canvas',
        level: 1,
      })
      // Inputs the wrapper does not declare stay in $attrs, out of the markup.
      expect(wrapper.vm.component.$attrs).toMatchObject({
        textSize: 'heading-responsive-7xl',
        align: 'left',
      })
      expect(wrapper.html()).not.toContain('heading-responsive-7xl')
    })
  })

  describe('slots', () => {
    test('renders Canvas slots as Vue slots, nested', async () => {
      const localVue = createVue({
        components: {
          DruxtCanvasSdcMercuryHeading,
          DruxtCanvasSdcMercurySection,
        },
      })
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue,
        propsData: { item: find(page2, 'sdc.mercury.section') },
      })

      expect(wrapper.find('section header h2').text()).toBe('Two cards')
      // The cards have no wrapper and no slots: Druxt's debug message for
      // each, in order.
      const debug = wrapper.findAll('section .main > div > div > details')
      expect(debug.length).toBe(2)
      expect(debug.at(0).text()).toContain('First card')
      expect(debug.at(1).text()).toContain('Second card')
    })

    test('the default slot is the slots in turn, for a code component', async () => {
      const localVue = createVue({
        components: {
          DruxtCanvasJsDruxtCard,
          DruxtCanvasJsDruxtMenu: { render: (h) => h('nav', 'menu') },
        },
      })
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue,
        propsData: { item: find(page3, 'js.druxt_card') },
      })

      expect(wrapper.find('.druxt-card h3').text()).toBe('A Druxt card')
      expect(wrapper.find('.druxt-card nav').text()).toBe('menu')
    })

    test('a Canvas slot named default is the default slot', () => {
      const item = {
        uuid: 'p',
        componentId: 'sdc.a.b',
        props: {},
        inputs: {},
        slots: {
          default: [
            {
              uuid: 'c1',
              componentId: 'sdc.a.c',
              props: {},
              inputs: {},
              slots: {},
            },
          ],
          other: [
            {
              uuid: 'c2',
              componentId: 'sdc.a.c',
              props: {},
              inputs: {},
              slots: {},
            },
          ],
        },
      }
      const wrapper = mount(DruxtCanvasComponent, {
        localVue: createVue(),
        propsData: { item },
      })
      wrapper.vm.component = { ...wrapper.vm.component, is: 'DruxtCanvasSdcAB' }

      const h = jest.fn((tag, data) => data.key)
      const slots = wrapper.vm.$options.druxt.slots.call(wrapper.vm, h)
      expect(Object.keys(slots)).toStrictEqual(['default', 'other'])
      expect(slots.default()).toStrictEqual(['c1'])

      // Without a wrapper, the default output is every slot in turn.
      wrapper.vm.component = { ...wrapper.vm.component, is: 'DruxtWrapper' }
      const output = wrapper.vm.$options.druxt.slots.call(wrapper.vm, h)
      expect(output.default()).toStrictEqual(['c1', 'c2'])
      expect(output.other()).toStrictEqual(['c2'])
    })
  })

  describe('a component without a wrapper', () => {
    // The section has two Canvas slots: a heading, then two cards. The
    // heading and the cards have wrappers, the section has none.
    const localVue = (isDev) =>
      createVue({
        components: { DruxtCanvasSdcMercuryCard, DruxtCanvasSdcMercuryHeading },
        isDev,
      })

    test.each([
      ['development', true],
      ['production', false],
    ])(
      'renders its default output, its Canvas slots in order, in %s',
      async (_, isDev) => {
        const wrapper = await mountAll(DruxtCanvasComponent, {
          localVue: localVue(isDev),
          propsData: { item: find(page2, 'sdc.mercury.section') },
        })

        expect(wrapper.vm.component.is).toBe('DruxtWrapper')
        expect(wrapper.vm.component.slots).toStrictEqual([
          'header_slot',
          'main_slot',
          'default',
        ])
        // The heading, then the cards, inside the two elements every Druxt
        // module renders around its wrapper, and with no debug message: the
        // section has default output.
        expect(
          wrapper.findAll('h2, article').wrappers.map((node) => node.text())
        ).toStrictEqual(['Two cards', 'First card', 'Second card'])
        expect(wrapper.find('details').exists()).toBe(false)
      }
    )

    test('with no slots, shows the Druxt debug message naming the wrapper options, in development', async () => {
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue: createVue(),
        propsData: { item: find(page2, 'sdc.mercury.button') },
      })

      // The module gives no default slot, so DruxtModule adds its own.
      expect(
        wrapper.vm.$options.druxt.slots.call(wrapper.vm, jest.fn())
      ).toStrictEqual({})
      expect(wrapper.find('details > summary').text()).toBe(
        'Missing default slot'
      )
      expect(
        wrapper.findAll('option').wrappers.map((option) => option.text())
      ).toStrictEqual([
        'DruxtCanvasSdcMercuryButton',
        'DruxtCanvasSdcMercury',
        'DruxtCanvasSdc',
        'DruxtCanvasDefault',
      ])
      expect(wrapper.text()).toContain('"label": "Read the docs"')
    })

    test('with no slots, renders an empty element in production', async () => {
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue: createVue({ isDev: false }),
        propsData: { item: find(page2, 'sdc.mercury.button') },
      })

      expect(wrapper.html()).toBe('<div>\n  <div></div>\n</div>')
    })

    test('renders the pending wrapper element while fetching', () => {
      const localVue = createVue({ isDev: false })
      localVue.prototype.$fetchState = { pending: true }
      const wrapper = mount(DruxtCanvasComponent, {
        localVue,
        propsData: { item: find(page2, 'sdc.mercury.section') },
      })
      expect(wrapper.html()).toBe('<div></div>')
    })
  })
})
