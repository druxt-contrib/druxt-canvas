import { getHead } from '../src/head'
import { fixture } from './helpers'

describe('getHead', () => {
  test('builds the head from a page metatag field', () => {
    const head = getHead(fixture('canvas-page-2').data.attributes.metatag)

    expect(head.title).toBe('Canvas demo page | Canvas demo')
    expect(head.meta.map((tag) => tag.hid)).toStrictEqual([
      'description',
      'rights',
      'referrer',
      'og:site_name',
      'og:type',
      'og:url',
      'og:title',
      'og:description',
      'twitter:card',
      'twitter:title',
      'twitter:description',
    ])
    expect(head.link).toStrictEqual([
      { hid: 'canonical', rel: 'canonical', href: '/demo' },
      {
        hid: 'shortlink',
        rel: 'shortlink',
        href: 'http://127.0.0.1:8890/jsonapi/canvas_page/canvas_page/efff9394-e546-4d64-98e8-295c92367d52',
      },
    ])
  })

  test('skips what it cannot use', () => {
    expect(
      getHead([
        null,
        { tag: 'meta' },
        { tag: 'script', attributes: { src: 'x' } },
        { tag: 'meta', attributes: { 'http-equiv': 'refresh', content: '5' } },
      ])
    ).toStrictEqual({
      meta: [{ hid: 'refresh', 'http-equiv': 'refresh', content: '5' }],
      link: [],
    })
    expect(getHead(undefined)).toStrictEqual({ meta: [], link: [] })
  })
})
