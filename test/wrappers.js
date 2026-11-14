import { DruxtCanvasComponentMixin } from '../src/mixin'

/**
 * Wrapper components a site might write, for the tests.
 */
export const DruxtCanvasSdcMercuryHeading = {
  name: 'DruxtCanvasSdcMercuryHeading',
  mixins: [DruxtCanvasComponentMixin],
  props: {
    headingText: { type: String, default: '' },
    level: { type: Number, default: 2 },
  },
  render(h) {
    return h(`h${this.level}`, { attrs: { 'data-uuid': this.canvas.uuid } }, [
      this.headingText,
    ])
  },
}

export const DruxtCanvasSdcMercurySection = {
  name: 'DruxtCanvasSdcMercurySection',
  mixins: [DruxtCanvasComponentMixin],
  render(h) {
    return h('section', [
      h(
        'header',
        this.$scopedSlots.header_slot ? this.$scopedSlots.header_slot() : []
      ),
      h(
        'div',
        { class: 'main' },
        this.$scopedSlots.main_slot ? this.$scopedSlots.main_slot() : []
      ),
    ])
  },
}

export const DruxtCanvasSdcMercuryCard = {
  name: 'DruxtCanvasSdcMercuryCard',
  mixins: [DruxtCanvasComponentMixin],
  props: { headingText: { type: String, default: '' } },
  render(h) {
    return h('article', { class: 'card' }, [this.headingText])
  },
}

export const DruxtCanvasJsDruxtCard = {
  name: 'DruxtCanvasJsDruxtCard',
  mixins: [DruxtCanvasComponentMixin],
  props: { title: { type: String, default: '' } },
  render(h) {
    return h('div', { class: 'druxt-card' }, [
      h('h3', [this.title]),
      ...(this.$scopedSlots.default ? this.$scopedSlots.default() : []),
    ])
  },
}

// Stand-ins for the Druxt modules the block mappings render.
const stub = (name) => ({
  name,
  inheritAttrs: false,
  props: ['name', 'depth', 'langcode', 'viewId', 'displayId'],
  render(h) {
    return h('nav', {
      class: name,
      attrs: { 'data-props': JSON.stringify(this.$props) },
    })
  },
})
export const DruxtMenu = stub('DruxtMenu')
export const DruxtView = stub('DruxtView')
export const DruxtBreadcrumb = stub('DruxtBreadcrumb')
