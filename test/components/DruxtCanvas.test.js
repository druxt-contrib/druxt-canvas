import { mount } from '@vue/test-utils'

import DruxtCanvas from '../../src/components/DruxtCanvas.vue'
import DruxtCanvasBlockSystemMenuBlock from '../../src/components/blocks/DruxtCanvasBlockSystemMenuBlock.vue'
import DruxtCanvasBlockViewsBlock from '../../src/components/blocks/DruxtCanvasBlockViewsBlock.vue'
import { createStore, createVue, fixture, mountAll } from '../helpers'

// Lets every pending promise and render settle.
const flush = async (wrapper) => {
  for (let i = 0; i < 6; i++) {
    await new Promise((resolve) => setTimeout(resolve))
    await wrapper.vm.$nextTick()
  }
}
import {
  DruxtCanvasSdcMercuryCard,
  DruxtCanvasSdcMercuryHeading,
  DruxtCanvasSdcMercurySection,
  DruxtMenu,
  DruxtView,
} from '../wrappers'

const page2 = fixture('canvas-page-2')
const uuid = page2.data.id

const components = {
  DruxtCanvasBlockSystemMenuBlock,
  DruxtCanvasBlockViewsBlock,
  DruxtCanvasSdcMercuryCard,
  DruxtCanvasSdcMercuryHeading,
  DruxtCanvasSdcMercurySection,
  DruxtMenu,
  DruxtView,
}

describe('DruxtCanvas', () => {
  test('fetches the page through the Druxt store and renders its tree', async () => {
    const store = createStore({ resources: { [uuid]: page2 } })
    const wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ components, store }),
      propsData: { uuid },
    })

    expect(store.dispatch).toHaveBeenCalledWith('druxt/getResource', {
      id: uuid,
      prefix: undefined,
      type: 'canvas_page--canvas_page',
    })
    expect(wrapper.vm.entity.id).toBe(uuid)
    expect(wrapper.vm.tree.length).toBe(6)

    // The roots, in order: heading, text (no wrapper), section, button (no wrapper), menu, view.
    const html = wrapper.html()
    const order = [
      '<h1',
      'sdc.mercury.text',
      '<section',
      'sdc.mercury.button',
      'class="DruxtMenu"',
      'class="DruxtView"',
    ]
    const positions = order.map((needle) => html.indexOf(needle))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toStrictEqual(positions)

    // Nested slots.
    expect(wrapper.find('section header h2').text()).toBe('Two cards')
    expect(
      wrapper
        .findAll('section .main article.card')
        .wrappers.map((w) => w.text())
    ).toStrictEqual(['First card', 'Second card'])

    // The page has no page wrapper: its default output is its tree.
    expect(wrapper.vm.component.is).toBe('DruxtWrapper')

    // Components without a wrapper and with no slots: Druxt's debug message
    // in development, naming the wrappers to create.
    expect(
      wrapper
        .findAll('details > div > select > option:first-child')
        .wrappers.map((w) => w.text())
    ).toStrictEqual([
      'DruxtCanvasSdcMercuryText',
      'DruxtCanvasSdcMercuryButton',
    ])

    // The block mappings.
    expect(
      JSON.parse(wrapper.find('nav.DruxtMenu').attributes('data-props'))
    ).toMatchObject({ name: 'main', depth: 2 })
    expect(
      JSON.parse(wrapper.find('nav.DruxtView').attributes('data-props'))
    ).toMatchObject({ viewId: 'recent_pages', displayId: 'block_recent_pages' })
  })

  test('shows no debug message in production', async () => {
    const store = createStore({ resources: { [uuid]: page2 } })
    const wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ components, store, isDev: false }),
      propsData: { uuid },
    })

    expect(wrapper.find('details').exists()).toBe(false)
    expect(wrapper.find('h1').text()).toBe('Druxt meets Canvas')
    expect(wrapper.html()).not.toContain('sdc.mercury.text')
  })

  test('renders the children of a component without a wrapper, in production', async () => {
    // No section wrapper: the section's heading and cards still render.
    const { DruxtCanvasSdcMercurySection, ...others } = components
    expect(DruxtCanvasSdcMercurySection).toBeDefined()
    const wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ components: others, isDev: false }),
      propsData: { value: page2.data },
    })

    expect(wrapper.find('section').exists()).toBe(false)
    expect(
      wrapper.findAll('h2, article.card').wrappers.map((w) => w.text())
    ).toStrictEqual(['Two cards', 'First card', 'Second card'])
  })

  test('accepts an already fetched resource', async () => {
    const store = createStore()
    const wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ components, store }),
      propsData: { value: page2.data },
    })

    expect(store.dispatch).not.toHaveBeenCalled()
    expect(wrapper.find('h1').text()).toBe('Druxt meets Canvas')
  })

  test('renders nothing without a uuid or a resource', async () => {
    const store = createStore()
    const wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ store }),
    })

    expect(store.dispatch).not.toHaveBeenCalled()
    expect(wrapper.vm.tree).toStrictEqual([])
    expect(wrapper.text()).toBe('')
  })

  test('shows the fetch error', async () => {
    const store = createStore()
    const wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ store }),
      propsData: { uuid: 'missing' },
    })

    expect(wrapper.vm.component.is).toBe('DruxtDebug')
    expect(wrapper.text()).toContain('No fixture for missing')
  })

  test('offers page wrappers by entity type and bundle', async () => {
    const DruxtCanvasCanvasPage = {
      props: ['entity', 'tree'],
      render(h) {
        return h('main', [
          h('p', { class: 'title' }, [this.entity.attributes.title]),
          h('p', { class: 'roots' }, [String(this.tree.length)]),
          this.$scopedSlots.default(),
        ])
      },
    }
    const wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({
        components: { ...components, DruxtCanvasCanvasPage },
      }),
      propsData: { value: page2.data },
    })

    expect(wrapper.vm.getModuleComponents().map((o) => o.name)).toStrictEqual([
      'DruxtCanvasCanvasPageCanvasPage',
      'DruxtCanvasCanvasPage',
    ])
    expect(wrapper.find('main .title').text()).toBe('Canvas demo page')
    expect(wrapper.find('main .roots').text()).toBe('6')
    expect(wrapper.find('main h1').text()).toBe('Druxt meets Canvas')
  })

  test('gives one slot per root instance', async () => {
    const wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ components }),
      propsData: { value: page2.data },
    })
    const slots = wrapper.vm.$options.druxt.slots.call(wrapper.vm, jest.fn())

    expect(Object.keys(slots)).toStrictEqual([
      ...wrapper.vm.tree.map((node) => node.uuid),
      'default',
    ])
  })

  test('warns about left out instances in development only', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const value = fixture('canvas-page-2').data
    value.attributes.components.push({
      uuid: 'orphan',
      component_id: 'sdc.a.b',
      parent_uuid: 'gone',
      slot: 's',
    })

    let wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ components }),
      propsData: { value },
    })
    expect(wrapper.vm.tree.length).toBe(6)
    expect(warn).toHaveBeenCalledWith(
      `[druxt-canvas] Left out component instance orphan (orphan) of canvas_page--canvas_page ${uuid}.`
    )

    warn.mockClear()
    wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ components, isDev: false }),
      propsData: { value },
    })
    expect(wrapper.vm.tree.length).toBe(6)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  test('fetches the page in its language', async () => {
    const store = createStore({ resources: { [uuid]: page2 } })
    await mountAll(DruxtCanvas, {
      localVue: createVue({ components, store }),
      propsData: { uuid, langcode: 'es' },
    })
    expect(store.dispatch).toHaveBeenCalledWith('druxt/getResource', {
      id: uuid,
      prefix: 'es',
      type: 'canvas_page--canvas_page',
    })
  })

  test("fetches the page in the route's language without a langcode", async () => {
    const store = createStore({ resources: { [uuid]: page2 } })
    await mountAll(DruxtCanvas, {
      localVue: createVue({ components, store }),
      mocks: { $route: { meta: { langcode: 'es' }, path: '/es/demo' } },
      propsData: { uuid },
    })
    expect(store.dispatch).toHaveBeenCalledWith('druxt/getResource', {
      id: uuid,
      prefix: 'es',
      type: 'canvas_page--canvas_page',
    })
  })

  test('refetches when the uuid changes', async () => {
    const page3 = fixture('canvas-page-3')
    const store = createStore({
      resources: { [uuid]: page2, [page3.data.id]: page3 },
    })
    const wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ components, store }),
      propsData: { uuid },
    })

    await wrapper.setProps({ uuid: page3.data.id })
    await new Promise((resolve) => setTimeout(resolve))
    expect(wrapper.vm.entity.attributes.title).toBe(
      'Canvas external components'
    )

    await wrapper.setProps({ type: 'canvas_page--canvas_page_other' })
    expect(store.dispatch).toHaveBeenLastCalledWith('druxt/getResource', {
      id: page3.data.id,
      prefix: undefined,
      type: 'canvas_page--canvas_page_other',
    })
  })

  test('renders an empty page when the store answers with nothing', async () => {
    const store = createStore()
    store.dispatch.mockResolvedValue(undefined)
    const wrapper = await mountAll(DruxtCanvas, {
      localVue: createVue({ components, store }),
      propsData: { uuid },
    })

    expect(wrapper.vm.entity).toStrictEqual({})
    expect(wrapper.vm.tree).toStrictEqual([])
  })

  describe('a response that arrives late', () => {
    // A store whose first page answers only when the test lets it.
    const slowStore = (resources) => {
      const store = createStore({ resources })
      const answer = store.dispatch.getMockImplementation()
      let release
      const held = new Promise((resolve) => {
        release = resolve
      })
      store.dispatch.mockImplementation(async (action, payload) => {
        if (action === 'druxt/getResource' && payload.id === uuid) await held
        return answer(action, payload)
      })
      return { store, release }
    }

    test('is dropped when the uuid has changed since', async () => {
      const page3 = fixture('canvas-page-3')
      const { store, release } = slowStore({
        [uuid]: page2,
        [page3.data.id]: page3,
      })
      const wrapper = mount(DruxtCanvas, {
        localVue: createVue({ components, store }),
        propsData: { uuid },
      })

      await wrapper.setProps({ uuid: page3.data.id })
      await flush(wrapper)
      release()
      await flush(wrapper)

      expect(wrapper.vm.entity.id).toBe(page3.data.id)
    })

    test('is dropped when the type has changed since', async () => {
      const { store, release } = slowStore({ [uuid]: page2 })
      const wrapper = mount(DruxtCanvas, {
        localVue: createVue({ components, store }),
        propsData: { uuid },
      })

      await wrapper.setProps({ type: 'canvas_page--canvas_page_other' })
      await flush(wrapper)
      release()
      await flush(wrapper)

      const types = store.dispatch.mock.calls
        .filter(([action]) => action === 'druxt/getResource')
        .map(([, payload]) => payload.type)
      expect(types).toContain('canvas_page--canvas_page_other')
      expect(wrapper.vm.entity.id).toBe(uuid)
    })

    test('is dropped when a resource has been given since', async () => {
      const page3 = fixture('canvas-page-3')
      const { store, release } = slowStore({ [uuid]: page2 })
      const wrapper = mount(DruxtCanvas, {
        localVue: createVue({ components, store }),
        propsData: { uuid },
      })

      await wrapper.setProps({ value: page3.data })
      await flush(wrapper)
      release()
      await flush(wrapper)

      expect(wrapper.vm.entity.id).toBe(page3.data.id)
    })
  })

  describe('head', () => {
    const head = (wrapper) => wrapper.vm.$options.head.call(wrapper.vm)

    test('is set from metatag when the page is the current route', () => {
      const store = createStore({
        route: { props: { type: 'canvas_page--canvas_page', uuid } },
      })
      const wrapper = mount(DruxtCanvas, {
        localVue: createVue({ store }),
        propsData: { value: page2.data },
      })

      expect(wrapper.vm.setsHead).toBe(true)
      const result = head(wrapper)
      expect(result.title).toBe('Canvas demo page | Canvas demo')
      expect(result.meta).toContainEqual({
        hid: 'description',
        name: 'description',
        content: 'A Canvas page for the Druxt demo.',
      })
      expect(result.meta).toContainEqual({
        hid: 'og:title',
        property: 'og:title',
        content: 'Canvas demo page',
      })
      expect(result.link).toContainEqual({
        hid: 'canonical',
        rel: 'canonical',
        href: '/demo',
      })
    })

    test('is not set for a page that is not the current route', () => {
      const store = createStore({ route: { props: { uuid: 'another' } } })
      const wrapper = mount(DruxtCanvas, {
        localVue: createVue({ store }),
        propsData: { value: page2.data },
      })

      expect(wrapper.vm.setsHead).toBe(false)
      expect(head(wrapper)).toStrictEqual({})
    })

    test('follows the metatags prop', () => {
      let wrapper = mount(DruxtCanvas, {
        localVue: createVue({ store: { state: {} } }),
        propsData: { value: page2.data, metatags: true },
      })
      expect(head(wrapper).title).toBe('Canvas demo page | Canvas demo')

      const store = createStore({ route: { props: { uuid } } })
      wrapper = mount(DruxtCanvas, {
        localVue: createVue({ store }),
        propsData: { value: page2.data, metatags: false },
      })
      expect(head(wrapper)).toStrictEqual({})
    })

    test('is not set without DruxtRouter in the store', () => {
      const wrapper = mount(DruxtCanvas, {
        localVue: createVue({ store: { state: {} } }),
        propsData: { value: page2.data },
      })
      expect(wrapper.vm.setsHead).toBe(false)
    })

    test('is not set before the page has loaded', () => {
      const wrapper = mount(DruxtCanvas, {
        localVue: createVue({ store: createStore() }),
        propsData: { uuid },
      })
      expect(wrapper.vm.setsHead).toBe(false)
    })
  })

  describe('a page inside itself', () => {
    // A view block that lists the page it sits on, rendering each row as the page.
    const DruxtCanvasBlockViewsBlock = {
      props: ['canvas'],
      render(h) {
        return h('div', { class: 'view' }, [
          h('DruxtCanvas', { props: { value: page2.data } }),
        ])
      },
    }

    test('is not rendered, and says so in development', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const localVue = createVue({
        components: { ...components, DruxtCanvasBlockViewsBlock },
        store: createStore({ route: { props: { uuid } } }),
      })
      const wrapper = await mountAll(DruxtCanvas, {
        localVue,
        propsData: { value: page2.data },
      })

      const nested = wrapper.findAllComponents({ name: 'DruxtCanvas' })
      expect(nested.length).toBe(2)
      expect(nested.at(1).vm.isRecursive).toBe(true)
      expect(nested.at(1).vm.tree).toStrictEqual([])
      expect(nested.at(1).vm.setsHead).toBe(false)
      expect(wrapper.findAll('h1').length).toBe(1)
      expect(warn).toHaveBeenCalledWith(
        `[druxt-canvas] Not rendering canvas_page--canvas_page ${uuid} inside itself.`
      )
      warn.mockRestore()
    })

    test('another page inside a page is rendered', async () => {
      const other = fixture('canvas-page-3').data
      const DruxtCanvasBlockViewsBlockOther = {
        props: ['canvas'],
        render(h) {
          return h('div', [h('DruxtCanvas', { props: { value: other } })])
        },
      }
      const localVue = createVue({
        components: {
          ...components,
          DruxtCanvasBlockViewsBlock: DruxtCanvasBlockViewsBlockOther,
        },
      })
      const wrapper = await mountAll(DruxtCanvas, {
        localVue,
        propsData: { value: page2.data },
      })

      expect(
        wrapper.findAllComponents({ name: 'DruxtCanvas' }).at(1).vm.tree.length
      ).toBe(4)
    })
  })
})
