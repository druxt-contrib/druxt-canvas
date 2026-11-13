import { createLocalVue, mount } from '@vue/test-utils'

import { DruxtCanvasComponentMixin } from '../src/mixin'

const component = {
  name: 'DruxtCanvasSdcTestHeading',
  mixins: [DruxtCanvasComponentMixin],
  props: { headingText: { type: String, default: '' } },
  render(h) {
    return h('h2', [this.headingText])
  },
}

describe('DruxtCanvasComponentMixin', () => {
  test('provides the canvas prop, and keeps undeclared inputs out of the markup', () => {
    const wrapper = mount(component, {
      localVue: createLocalVue(),
      propsData: {
        canvas: { uuid: 'u', componentId: 'sdc.test.heading' },
        headingText: 'Hello',
      },
      attrs: { textSize: 'large' },
    })

    expect(wrapper.vm.canvas).toStrictEqual({
      uuid: 'u',
      componentId: 'sdc.test.heading',
    })
    expect(wrapper.vm.$attrs).toStrictEqual({ textSize: 'large' })
    expect(wrapper.html()).toBe('<h2>Hello</h2>')
  })

  test('defaults canvas to an empty object', () => {
    const wrapper = mount(component, { localVue: createLocalVue() })
    expect(wrapper.vm.canvas).toStrictEqual({})
  })
})
