# Theming

How a Canvas page and its components pick the Vue components they render
through.

- [Component wrappers](#component-wrappers)
- [Inputs](#inputs)
- [Slots](#slots)
- [Default output](#default-output)
- [Naming the file](#naming-the-file)
- [Page wrappers](#page-wrappers)
- [Menu, views and breadcrumb blocks](#menu-views-and-breadcrumb-blocks)
- [Canvas pages in a view](#canvas-pages-in-a-view)

## Component wrappers

Every Canvas component instance renders through the first wrapper component
that exists, most specific first, named from its Canvas component ID. For
Mercury's heading, `sdc.mercury.heading`:

1. `DruxtCanvasSdcMercuryHeading`
2. `DruxtCanvasSdcMercury`
3. `DruxtCanvasSdc`
4. `DruxtCanvasDefault`

The pattern is `DruxtCanvas[Source][Provider][Name]`. A code component,
`js.druxt_card`, is `DruxtCanvasJsDruxtCard`. Code components need a Vue
wrapper too, since JSON:API sends their inputs, not their code. The main menu
block, `block.system_menu_block.main`, is `DruxtCanvasBlockSystemMenuBlockMain`.

With a langcode, each name also has a langcode variant, and Druxt orders the
whole list by how many parts a name has. A shorter name with a langcode can
then come before a longer one without. For `js.druxt_card` in English:

1. `DruxtCanvasJsDruxtCardEn`
2. `DruxtCanvasJsEn`
3. `DruxtCanvasJsDruxtCard`
4. `DruxtCanvasDefaultEn`
5. `DruxtCanvasJs`
6. `DruxtCanvasDefault`

So a `DruxtCanvasJsEn` wrapper replaces `DruxtCanvasJsDruxtCard` on English
pages. Name a language wrapper only as broadly as you mean it.

## Inputs

The instance's inputs are the wrapper's props, in camelCase, so `heading_text`
is `headingText`. Declare the inputs you use as props. Add
`DruxtCanvasComponentMixin` so the inputs you don't declare stay out of the
markup, rather than becoming HTML attributes.

The mixin also declares `canvas`, the instance itself: `uuid`, `componentId`,
`componentVersion`, `label`, `inputs` by their Canvas names, and `slots`, the
slot names.

The inputs are the values Canvas resolved, from each item's `inputs_resolved`.
The stored `inputs` are not read.

An HTML input, one whose schema has `contentMediaType: text/html`, passes
through one of Canvas's text formats first:

- `canvas_html_block` allows `<strong> <em> <u> <a href> <p> <br> <ul> <ol> <li>`.
- `canvas_html_inline`, for an inline input, allows `<strong> <em> <u> <a href>`.

A wrapper may render those inputs with `v-html`. Every other input is the
editor's text as typed: render it with `{{ }}` or a bound prop, never with
`v-html`.

Canvas doesn't let anyone change its formats through the admin interface. A
site that changes them with a configuration override or import changes what
reaches `v-html`, and should filter the HTML in the wrapper instead. Drupal's
guide to
[configuring text formats for security](https://www.drupal.org/docs/administering-a-drupal-site/security-in-drupal/configuring-text-formats-aka-input-formats-for-security)
covers the filters.

Canvas sends some inputs in a different type from the one its schema names,
such as a number as a string. Declare a prop with every type it can arrive in,
such as `[Number, String]`, or convert it in a computed property.

## Slots

Each Canvas slot is a Vue slot of the same name. Mercury's section,
`components/druxt/canvas/sdc/mercury/Section.vue`:

```vue
<template>
  <section>
    <header><slot name="header_slot" /></header>
    <div class="columns"><slot name="main_slot" /></div>
  </section>
</template>

<script>
import { DruxtCanvasComponentMixin } from '@druxt-contrib/canvas'

export default {
  mixins: [DruxtCanvasComponentMixin],
}
</script>
```

The `default` slot is the component's default output, unless the Canvas
component has a slot named `default` of its own.

## Default output

Without a wrapper, a Canvas component renders its default output, as every
Druxt module does: the content of its Canvas slots, in order. A page stays
readable while you write its wrappers.

A Canvas component with no slots, such as a heading, has no default output. In
development, Druxt's debug message says so and names the wrapper components it
would accept. Production renders an empty element.

## Naming the file

Nuxt 2 names a component from its folders and its file name, but drops the
folders when the file name starts with a word they contain.
`components/druxt/canvas/js/DruxtCard.vue` registers as `DruxtCard`, not
`DruxtCanvasJsDruxtCard`. For a component whose name starts that way, use the
full name as the file name: `components/DruxtCanvasJsDruxtCard.vue`.

## Page wrappers

A page renders through the first of these that exists:

1. `DruxtCanvas[EntityType][Bundle]`, such as `DruxtCanvasCanvasPageCanvasPage`
2. `DruxtCanvas[EntityType]`, such as `DruxtCanvasCanvasPage`

A page wrapper receives `entity`, the page resource, and `tree`, its component
instances. Its `default` slot renders the components, and each root component
has a slot named by its UUID:

```vue
<template>
  <main>
    <h1>{{ entity.attributes.title }}</h1>
    <slot />
  </main>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    entity: { type: Object, required: true },
    tree: { type: Array, default: () => [] },
  },
}
</script>
```

Without a page wrapper, a page renders its component tree.

## Menu, views and breadcrumb blocks

Canvas places Drupal's menu, views and breadcrumb blocks as components, with
their settings as inputs. With the matching Druxt module installed, they render
with no wrapper of your own:

| Canvas component ID                  | Renders           | Props                                                         |
| ------------------------------------ | ----------------- | ------------------------------------------------------------- |
| `block.system_menu_block.<menu>`     | `DruxtMenu`       | `name` from the ID, `depth` from the block (0 is every level) |
| `block.views_block.<view>-<display>` | `DruxtView`       | `viewId` and `displayId` from the ID                          |
| `block.system_breadcrumb_block`      | `DruxtBreadcrumb` |                                                               |

The block label shows when the block displays it. A more specific wrapper
replaces a mapping, such as `DruxtCanvasBlockSystemMenuBlockMain` for the main
menu, and a site's own wrapper with the same name as a mapping is kept. A
mapping whose Druxt module is not installed is left out of the build.

## Canvas pages in a view

A view or a reference that lists Canvas pages renders each one as its title,
linked to the page (`DruxtEntityCanvasPage`). Only the `full` view mode, which
DruxtRouter uses, renders the Canvas tree (`DruxtEntityCanvasPageFull`). A page
that holds a view listing itself is not rendered inside itself.
