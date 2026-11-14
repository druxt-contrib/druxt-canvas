import { mount } from '@vue/test-utils'
import { DruxtRouter as DruxtRouterClass } from 'druxt-router'
import DruxtEntity from 'druxt-entity/dist/components/DruxtEntity.vue'
import DruxtRouterEntity from 'druxt-entity/dist/components/DruxtRouterEntity.vue'
import DruxtRouter from 'druxt-router/dist/components/DruxtRouter.vue'

import DruxtEntityCanvasPage from '../../src/components/DruxtEntityCanvasPage.vue'
import DruxtEntityCanvasPageFull from '../../src/components/DruxtEntityCanvasPageFull.vue'
import { createStore, createVue, fixture, mountAll } from '../helpers'
import {
  DruxtCanvasSdcMercuryButton,
  DruxtCanvasSdcMercuryCta,
} from '../routing-wrappers'

const home = fixture('canvas-page-1-home-include')
const external = fixture('canvas-page-3')

// Resolves a path the way druxt-router does, from a saved Decoupled Router response.
const getRoute = async (response) => {
  const router = new DruxtRouterClass('http://127.0.0.1:8890', {
    druxtClient: { get: async () => ({ status: 200, data: response }) },
  })
  return router.getRoute('/')
}

const NuxtLink = {
  props: ['to'],
  render(h) {
    return h('a', { attrs: { href: this.to } }, this.$slots.default)
  },
}
const components = {
  DruxtCanvasSdcMercuryButton,
  DruxtCanvasSdcMercuryCta,
  DruxtEntity,
  DruxtEntityCanvasPage,
  DruxtEntityCanvasPageFull,
  DruxtRouterEntity,
  NuxtLink,
}

describe('DruxtEntityCanvasPageFull', () => {
  test('DruxtEntity renders a canvas_page resource through it in the full view mode', () => {
    const wrapper = mount(DruxtEntity, {
      localVue: createVue({ components }),
      propsData: { type: 'canvas_page--canvas_page', uuid: 'u', mode: 'full' },
    })
    const names = wrapper.vm.getModuleComponents()

    expect(names.find((o) => o.global).name).toBe('DruxtEntityCanvasPageFull')
    // More specific names stay available to a site.
    expect(names.map((o) => o.name).slice(0, 5)).toStrictEqual([
      'DruxtEntityCanvasPageCanvasPageFullView',
      'DruxtEntityCanvasPageFullView',
      'DruxtEntityCanvasPageCanvasPageFull',
      'DruxtEntityCanvasPageFull',
      'DruxtEntityCanvasPageCanvasPage',
    ])
  })

  test('hands the fetched resource to DruxtCanvas, so it is fetched once', async () => {
    const store = createStore({ resources: { [external.data.id]: external } })
    const wrapper = await mountAll(DruxtEntity, {
      localVue: createVue({ components, store }),
      propsData: {
        type: 'canvas_page--canvas_page',
        uuid: external.data.id,
        mode: 'full',
      },
    })

    expect(wrapper.vm.component.is).toBe('DruxtEntityCanvasPageFull')
    expect(
      store.dispatch.mock.calls.filter(
        ([action]) => action === 'druxt/getResource'
      ).length
    ).toBe(1)
    expect(wrapper.findComponent({ name: 'DruxtCanvas' }).vm.entity.id).toBe(
      external.data.id
    )
    // Four components have no wrapper and no slots: the heading, the menu in
    // the card's slot, the view and the entity. The card renders its slot.
    expect(wrapper.findAll('details[title]').length).toBe(4)
  })

  test.each([
    ['the front page', 'router-front', home, true],
    ['a page by its alias', 'router-demo-external', external, false],
  ])(
    'a DruxtRouter route reaches DruxtCanvas: %s',
    async (_, response, page, isHomePath) => {
      const route = await getRoute(fixture(response))
      expect(route).toMatchObject({
        component: 'druxt-entity',
        isHomePath,
        props: { type: 'canvas_page--canvas_page', uuid: page.data.id },
      })

      const store = createStore({ resources: { [page.data.id]: page }, route })
      const localVue = createVue({
        components: { ...components, DruxtRouter },
        store,
      })
      const wrapper = await mountAll(DruxtRouter, {
        localVue,
        propsData: { value: route },
      })

      expect(wrapper.vm.component.is).toBe('DruxtRouterEntity')
      const canvas = wrapper.findComponent({ name: 'DruxtCanvas' })
      expect(canvas.exists()).toBe(true)
      expect(canvas.vm.setsHead).toBe(true)
      expect(canvas.vm.$options.head.call(canvas.vm).title).toBe(
        page.data.attributes.metatag.find(
          (tag) => tag.attributes.name === 'title'
        ).attributes.content
      )
    }
  )

  test('renders the front page tree with its nested slot', async () => {
    const route = await getRoute(fixture('router-front'))
    const store = createStore({ resources: { [home.data.id]: home }, route })
    const wrapper = await mountAll(DruxtRouter, {
      localVue: createVue({
        components: { ...components, DruxtRouter },
        store,
      }),
      propsData: { value: route },
    })

    expect(wrapper.find('.cta h1').text()).toBe('Your hero content goes here')
    expect(wrapper.find('.cta .actions a').text()).toBe('Call to action')
  })
})

describe('DruxtEntityCanvasPage', () => {
  test.each(['default', 'teaser'])(
    'DruxtEntity renders a canvas_page resource in the %s view mode as a link',
    async (mode) => {
      const store = createStore({ resources: { [external.data.id]: external } })
      const wrapper = await mountAll(DruxtEntity, {
        localVue: createVue({ components, store }),
        propsData: {
          type: 'canvas_page--canvas_page',
          uuid: external.data.id,
          mode,
        },
      })

      expect(wrapper.vm.component.is).toBe('DruxtEntityCanvasPage')
      expect(wrapper.find('article h2 a').attributes('href')).toBe(
        '/demo-external'
      )
      expect(wrapper.find('article h2').text()).toBe(
        'Canvas external components'
      )
      expect(wrapper.findComponent({ name: 'DruxtCanvas' }).exists()).toBe(
        false
      )
    }
  )

  test('links to the Drupal path without an alias, and renders the title alone without either', () => {
    const localVue = createVue({ components })
    let wrapper = mount(DruxtEntityCanvasPage, {
      localVue,
      propsData: {
        entity: {
          id: 'u',
          attributes: {
            title: 'Page',
            drupal_internal__id: 7,
            path: { alias: null },
          },
        },
      },
    })
    expect(wrapper.find('a').attributes('href')).toBe('/page/7')

    wrapper = mount(DruxtEntityCanvasPage, {
      localVue,
      propsData: { entity: { id: 'u' } },
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.html()).toBe(
      '<article data-canvas-page="u">\n  <h2></h2>\n</article>'
    )
  })
})
