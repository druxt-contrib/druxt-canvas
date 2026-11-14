import { mount } from '@vue/test-utils'

import DruxtCanvasBlockSystemBreadcrumbBlock from '../../src/components/blocks/DruxtCanvasBlockSystemBreadcrumbBlock.vue'
import DruxtCanvasBlockSystemMenuBlock from '../../src/components/blocks/DruxtCanvasBlockSystemMenuBlock.vue'
import DruxtCanvasBlockViewsBlock from '../../src/components/blocks/DruxtCanvasBlockViewsBlock.vue'
import DruxtCanvasComponent from '../../src/components/DruxtCanvasComponent.vue'
import { buildCanvasTree } from '../../src/tree'
import { createVue, fixture, mountAll } from '../helpers'
import { DruxtBreadcrumb, DruxtMenu, DruxtView } from '../wrappers'

const tree = buildCanvasTree(
  fixture('canvas-page-2').data.attributes.components
)
const find = (id) => tree.find((node) => node.componentId === id)
const props = (wrapper, selector) =>
  JSON.parse(wrapper.find(selector).attributes('data-props'))

describe('Canvas block mappings', () => {
  describe('menu block', () => {
    const item = find('block.system_menu_block.main')

    test('renders DruxtMenu through wrapper resolution, with the block settings as props', async () => {
      const localVue = createVue({
        components: { DruxtCanvasBlockSystemMenuBlock, DruxtMenu },
      })
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue,
        propsData: { item, langcode: 'en' },
      })

      expect(wrapper.vm.component.is).toBe('DruxtCanvasBlockSystemMenuBlock')
      expect(props(wrapper, 'nav.DruxtMenu')).toStrictEqual({
        name: 'main',
        depth: 2,
        langcode: 'en',
      })
      expect(
        wrapper.find('[data-canvas-uuid]').attributes('data-canvas-uuid')
      ).toBe(item.uuid)
      // label_display "0": no heading.
      expect(wrapper.find('h2').exists()).toBe(false)
    })

    test('a site wrapper for one menu wins', async () => {
      const DruxtCanvasBlockSystemMenuBlockMain = {
        render: (h) => h('p', 'site menu'),
      }
      const localVue = createVue({
        components: {
          DruxtCanvasBlockSystemMenuBlock,
          DruxtCanvasBlockSystemMenuBlockMain,
          DruxtMenu,
        },
      })
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue,
        propsData: { item },
      })

      expect(wrapper.vm.component.is).toBe(
        'DruxtCanvasBlockSystemMenuBlockMain'
      )
      expect(wrapper.text()).toBe('site menu')
    })

    test('the mapping wins over DruxtCanvasDefault', async () => {
      const DruxtCanvasDefault = { render: (h) => h('p', 'default') }
      const localVue = createVue({
        components: {
          DruxtCanvasBlockSystemMenuBlock,
          DruxtCanvasDefault,
          DruxtMenu,
        },
      })
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue,
        propsData: { item },
      })

      expect(wrapper.vm.component.is).toBe('DruxtCanvasBlockSystemMenuBlock')
    })

    test('shows the label when the block displays it', () => {
      const localVue = createVue({ components: { DruxtMenu } })
      const wrapper = mount(DruxtCanvasBlockSystemMenuBlock, {
        localVue,
        propsData: {
          canvas: { componentId: 'block.system_menu_block.footer', uuid: 'u' },
          label: 'Footer',
          labelDisplay: 'visible',
          depth: 0,
        },
      })

      expect(wrapper.find('h2').text()).toBe('Footer')
      expect(props(wrapper, 'nav.DruxtMenu')).toMatchObject({
        name: 'footer',
        depth: 0,
      })
    })

    test('does not render a block that starts below the first level', () => {
      const canvas = { componentId: 'block.system_menu_block.main', uuid: 'u' }
      let wrapper = mount(DruxtCanvasBlockSystemMenuBlock, {
        localVue: createVue({ components: { DruxtMenu } }),
        propsData: { canvas, level: 2 },
      })
      expect(wrapper.find('nav').exists()).toBe(false)
      expect(wrapper.find('details > summary').text()).toContain(
        'starts at level 2'
      )

      wrapper = mount(DruxtCanvasBlockSystemMenuBlock, {
        localVue: createVue({ components: { DruxtMenu }, isDev: false }),
        propsData: { canvas, level: 2 },
      })
      // DruxtDebug renders an empty element in production.
      expect(wrapper.html()).toBe('<div></div>')
    })

    test('without druxt-menu, says so in development', () => {
      const wrapper = mount(DruxtCanvasBlockSystemMenuBlock, {
        localVue: createVue(),
        propsData: { canvas: { componentId: 'block.system_menu_block.main' } },
      })
      expect(wrapper.find('details > summary').text()).toBe(
        'The Canvas menu block "main" needs druxt-menu.'
      )
    })
  })

  describe('views block', () => {
    const item = find('block.views_block.recent_pages-block_recent_pages')

    test('renders DruxtView through wrapper resolution, with the view and display ids', async () => {
      const localVue = createVue({
        components: { DruxtCanvasBlockViewsBlock, DruxtView },
      })
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue,
        propsData: { item },
      })

      expect(wrapper.vm.component.is).toBe('DruxtCanvasBlockViewsBlock')
      expect(props(wrapper, 'nav.DruxtView')).toMatchObject({
        viewId: 'recent_pages',
        displayId: 'block_recent_pages',
      })
      expect(wrapper.find('h2').exists()).toBe(false)
    })

    test('the views label replaces the label', () => {
      const wrapper = mount(DruxtCanvasBlockViewsBlock, {
        localVue: createVue({ components: { DruxtView } }),
        propsData: {
          canvas: { componentId: 'block.views_block.content_recent-block_1' },
          label: 'Recent',
          viewsLabel: 'Latest',
          labelDisplay: 'visible',
        },
      })

      expect(wrapper.find('h2').text()).toBe('Latest')
      expect(props(wrapper, 'nav.DruxtView')).toMatchObject({
        viewId: 'content_recent',
        displayId: 'block_1',
      })
    })

    test('shows the block label when there is no views label', () => {
      const wrapper = mount(DruxtCanvasBlockViewsBlock, {
        localVue: createVue({ components: { DruxtView } }),
        propsData: {
          canvas: { componentId: 'block.views_block.content_recent-block_1' },
          label: 'Recent',
          labelDisplay: 'visible',
        },
      })
      expect(wrapper.find('h2').text()).toBe('Recent')
    })

    test('shows no heading for a visible label that is empty', () => {
      const wrapper = mount(DruxtCanvasBlockViewsBlock, {
        localVue: createVue({ components: { DruxtView } }),
        propsData: {
          canvas: { componentId: 'block.views_block.content_recent-block_1' },
          labelDisplay: 'visible',
        },
      })
      expect(wrapper.find('h2').exists()).toBe(false)
    })

    test('says so when there is no component id', () => {
      const wrapper = mount(DruxtCanvasBlockViewsBlock, {
        localVue: createVue({ components: { DruxtView } }),
        propsData: { canvas: {} },
      })
      expect(wrapper.text()).toContain('names no view and display')
    })

    test('says so when the component id names no view', () => {
      const wrapper = mount(DruxtCanvasBlockViewsBlock, {
        localVue: createVue({ components: { DruxtView } }),
        propsData: { canvas: { componentId: 'block.views_block.broken' } },
      })
      expect(wrapper.text()).toContain('names no view and display')
    })

    test('without druxt-views, renders an empty element in production', () => {
      const wrapper = mount(DruxtCanvasBlockViewsBlock, {
        localVue: createVue({ isDev: false }),
        propsData: { canvas: { componentId: item.componentId } },
      })
      expect(wrapper.html()).toBe('<div></div>')
    })
  })

  describe('breadcrumb block', () => {
    test('renders DruxtBreadcrumb through wrapper resolution', async () => {
      const item = {
        uuid: 'b',
        componentId: 'block.system_breadcrumb_block',
        inputs: {},
        props: { label: 'Breadcrumbs', labelDisplay: '0' },
        slots: {},
      }
      const localVue = createVue({
        components: { DruxtCanvasBlockSystemBreadcrumbBlock, DruxtBreadcrumb },
      })
      const wrapper = await mountAll(DruxtCanvasComponent, {
        localVue,
        propsData: { item, langcode: 'en' },
      })

      expect(wrapper.vm.component.is).toBe(
        'DruxtCanvasBlockSystemBreadcrumbBlock'
      )
      expect(props(wrapper, 'nav.DruxtBreadcrumb')).toMatchObject({
        langcode: 'en',
      })
    })

    test('without druxt-breadcrumb, says so in development', () => {
      const wrapper = mount(DruxtCanvasBlockSystemBreadcrumbBlock, {
        localVue: createVue(),
        propsData: { canvas: {} },
      })
      expect(wrapper.find('details > summary').text()).toBe(
        'The Canvas breadcrumb block needs druxt-breadcrumb.'
      )
    })
  })
})
