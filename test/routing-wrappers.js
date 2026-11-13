import { DruxtCanvasComponentMixin } from '../src/mixin'

// Wrappers for the Mercury components of the Drupal CMS front page.
export const DruxtCanvasSdcMercuryCta = {
  mixins: [DruxtCanvasComponentMixin],
  props: { headingText: { type: String, default: '' } },
  render(h) {
    return h('div', { class: 'cta' }, [
      h('h1', [this.headingText]),
      h('div', { class: 'actions' }, this.$scopedSlots.actions()),
    ])
  },
}

export const DruxtCanvasSdcMercuryButton = {
  mixins: [DruxtCanvasComponentMixin],
  props: { label: { type: String, default: '' } },
  render(h) {
    return h('a', [this.label])
  },
}
