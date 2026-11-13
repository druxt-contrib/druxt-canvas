import { join } from 'path'

import DruxtCanvasNuxtModule, * as exported from '../src'

const component = (pascalName) => ({ pascalName })

describe('DruxtCanvasNuxtModule', () => {
  let hooks
  let mock

  beforeEach(() => {
    hooks = {}
    mock = {
      nuxt: {
        hook: jest.fn((name, fn) => {
          hooks[name] = fn
        }),
      },
      options: {},
    }
    DruxtCanvasNuxtModule.call(mock)
  })

  test('registers the components directory, below the site in priority', () => {
    const dirs = []
    hooks['components:dirs'](dirs)

    expect(dirs).toHaveLength(1)
    expect(dirs[0]).toMatchObject({
      path: join(__dirname, '../src/components'),
      pathPrefix: false,
      level: 1,
    })
    expect(
      dirs[0].extendComponent({ pascalName: 'DruxtCanvas', isAsync: null })
    ).toStrictEqual({ pascalName: 'DruxtCanvas', isAsync: false })
  })

  test('keeps a block mapping only when its Druxt module is installed', () => {
    const components = [
      'DruxtCanvas',
      'DruxtCanvasComponent',
      'DruxtCanvasBlockSystemBreadcrumbBlock',
      'DruxtCanvasBlockSystemMenuBlock',
      'DruxtCanvasBlockViewsBlock',
      'DruxtMenu',
    ].map(component)
    hooks['components:extend'](components)

    expect(components.map((c) => c.pascalName)).toStrictEqual([
      'DruxtCanvas',
      'DruxtCanvasComponent',
      'DruxtCanvasBlockSystemMenuBlock',
      'DruxtMenu',
    ])
  })

  test('keeps every block mapping when every Druxt module is installed', () => {
    const names = [
      'DruxtCanvasBlockSystemBreadcrumbBlock',
      'DruxtCanvasBlockSystemMenuBlock',
      'DruxtCanvasBlockViewsBlock',
      'DruxtBreadcrumb',
      'DruxtMenu',
      'DruxtView',
    ]
    const components = names.map(component)
    hooks['components:extend'](components)

    expect(components.map((c) => c.pascalName)).toStrictEqual(names)
  })

  test('exports', () => {
    expect(Object.keys(exported).sort()).toStrictEqual([
      'DruxtCanvasComponentMixin',
      'blockMappings',
      'buildCanvasTree',
      'camelCase',
      'default',
      'getComponentParts',
      'getHead',
      'hasComponent',
      'renderBlock',
      'renderNotice',
    ])
  })
  test('every export resolves', () => {
    for (const key of Object.keys(exported)) {
      expect(exported[key]).toBeDefined()
    }
  })
})
