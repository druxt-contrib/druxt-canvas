<!-- vale off -->
<!-- The alt text describes what the banner shows: the @druxt-contrib/canvas mark, name and description. The name-colon-description form trips ColonUsage. -->
<a href="https://druxtjs.org">
  <img src="https://raw.githubusercontent.com/druxt-contrib/druxt-canvas/0.x/.github/banner.svg" alt="@druxt-contrib/canvas: Canvas module for Druxt">
</a>
<!-- vale on -->

# @druxt-contrib/canvas

[![npm](https://img.shields.io/npm/v/@druxt-contrib/canvas)](https://www.npmjs.com/package/@druxt-contrib/canvas)
[![npm@dev](https://img.shields.io/npm/v/@druxt-contrib/canvas/dev)](https://www.npmjs.com/package/@druxt-contrib/canvas/v/dev)
[![CI](https://github.com/druxt-contrib/druxt-canvas/actions/workflows/ci.yml/badge.svg?branch=0.x)](https://github.com/druxt-contrib/druxt-canvas/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/druxt-contrib/druxt-canvas/branch/0.x/graph/badge.svg)](https://codecov.io/gh/druxt-contrib/druxt-canvas)
[![Known Vulnerabilities](https://snyk.io/test/github/druxt-contrib/druxt-canvas/badge.svg?targetFile=package.json)](https://snyk.io/test/github/druxt-contrib/druxt-canvas?targetFile=package.json)
[![Discord](https://img.shields.io/discord/753866667590680587?label=discord&logo=discord&logoColor=white)](https://discord.druxtjs.org)

> Canvas module for Druxt

Renders the pages editors build in
[Drupal Canvas](https://www.drupal.org/project/canvas) in a
[Druxt](https://druxtjs.org) site. Drupal decides what goes on the page. Your
Nuxt components decide how it looks: each Canvas component renders through a
Druxt wrapper component named after it.

## Contents

- [Features](#features)
- [How it works](#how-it-works)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Writing wrapper components](#writing-wrapper-components)
- [Rendering a page yourself](#rendering-a-page-yourself)
- [Limits](#limits)
- [Troubleshooting](#troubleshooting)
- [More documentation](#more-documentation)

## Features

- Renders a Canvas page at its own path through Druxt Router, with no Nuxt
  page of your own. The front page can be one.
- Renders each Canvas component through a Vue wrapper named after its
  component ID, such as `DruxtCanvasSdcMercuryHeading`.
- Passes the component's inputs as props and its Canvas slots as Vue slots.
- Renders Canvas's menu, views and breadcrumb blocks as DruxtMenu, DruxtView
  and DruxtBreadcrumb, with no wrapper of your own.
- Sets the page title and meta tags from the page's `metatag` field.

## How it works

1. DruxtRouter resolves the path to a Canvas page, or you render
   `<DruxtCanvas>` with a page's UUID.
2. DruxtCanvas reads the page from JSON:API and builds its `components` field
   into a tree.
3. Each component instance renders through the most specific wrapper component
   that exists, with its resolved inputs as props.
4. A component with no wrapper renders the content of its slots, so the page
   stays readable while you write wrappers.

## Requirements

- Nuxt 2 with Druxt 0.25.1 or later, Druxt Entity 0.29.1 and Druxt Router
  0.32.1, or Druxt Site 0.15.1, which adds them.
- Node 16.20.1 or a later Node 16 for the build. Druxt's schema build fails on
  newer Node.
- Drupal 11.3 or later on PHP 8.3, with
  [Canvas](https://www.drupal.org/project/canvas) 1.12.0 and the
  [Druxt module](https://www.drupal.org/project/druxt) 1.2.2 or later.
  [Drupal CMS](https://www.drupal.org/drupal-cms) has Canvas already.
- [Metatag](https://www.drupal.org/project/metatag), for the page head.
  Drupal CMS has it already.

**Patch Canvas 1.12.0 before you build.** It answers HTTP 500 to the second
page of any JSON:API collection of configuration entities, so `nuxt build`
against a Drupal CMS site fails with `[fatal] 500: Internal Server Error`.
[Drupal setup](docs/drupal-setup.md#canvas-1120-and-the-druxt-build) has the
patch, for use until a Canvas release fixes it.

## Quick start

1. Set up Drupal as [Drupal setup](docs/drupal-setup.md) describes.

2. Install the module, with Druxt Site:

   ```sh
   npm i @druxt-contrib/canvas druxt-site
   ```

   Or with the Druxt modules it needs, plus Druxt Menu and Druxt Views for
   Canvas's menu and views blocks:

   ```sh
   npm i @druxt-contrib/canvas druxt-entity druxt-router druxt-menu druxt-views
   ```

3. Add it to `nuxt.config.js`:

   ```js
   export default {
     modules: ['druxt-site', '@druxt-contrib/canvas'],
     druxt: {
       baseUrl: 'https://drupal.example.com',
     },
   }
   ```

   Without Druxt Site, list `'druxt-entity'`, `'druxt-router/nuxt'` and any of
   `'druxt-menu'`, `'druxt-views'` and `'druxt-breadcrumb'` in its place.

4. Run `nuxt dev` and open a Canvas page's path. Components with slots show
   their content. A component with no slots, such as a heading, shows Druxt's
   debug message instead, naming the wrapper components it would accept.

5. Write a wrapper for it, as below.

## Writing wrapper components

A Canvas component renders through the first wrapper component that exists,
most specific first. For Mercury's heading, `sdc.mercury.heading`:

1. `DruxtCanvasSdcMercuryHeading`
2. `DruxtCanvasSdcMercury`
3. `DruxtCanvasSdc`
4. `DruxtCanvasDefault`

Its inputs arrive as props in camelCase, so `heading_text` is `headingText`.
`components/druxt/canvas/sdc/mercury/Heading.vue`:

```vue
<template>
  <component :is="`h${level}`">{{ headingText }}</component>
</template>

<script>
import { DruxtCanvasComponentMixin } from '@druxt-contrib/canvas'

export default {
  mixins: [DruxtCanvasComponentMixin],
  props: {
    headingText: { type: String, default: '' },
    level: { type: Number, default: 2 },
  },
}
</script>
```

Each Canvas slot is a Vue slot of the same name. Declare the inputs you use as
props, and add `DruxtCanvasComponentMixin` so the rest stay out of the markup.

An HTML input, one whose schema is `contentMediaType: text/html`, arrives
filtered through Canvas's text format, and a wrapper may render it with
`v-html`. Every other input is the editor's text as typed: never render it
with `v-html`.

[Theming](docs/theming.md) covers the naming rules, page wrappers, the block
mappings and how to name the file.

## Rendering a page yourself

Render a Canvas page anywhere with its UUID, or with a resource you already
have:

```vue
<DruxtCanvas uuid="efff9394-e546-4d64-98e8-295c92367d52" />
<DruxtCanvas :value="resource" />
```

If the Nuxt page that renders it has a `fetch()` of its own, wrap DruxtCanvas
in an element, as below. Otherwise both share one fetch key, and the page
renders on the server, then empties in the browser.

```vue
<template>
  <div>
    <DruxtCanvas uuid="efff9394-e546-4d64-98e8-295c92367d52" />
  </div>
</template>
```

## Limits

This version renders what JSON:API returns to the role your site reads as:
for anonymous visitors, published pages. It does not do:

- **Drafts and preview.** Changes reach the site once an editor publishes them
  in Canvas. See [#4](https://github.com/druxt-contrib/druxt-canvas/issues/4).
- **Content templates**, Canvas trees for a content type's view mode. Nodes
  keep rendering through DruxtEntity.
- **Page variants**, the tree Canvas wraps around a page. Your Nuxt layout
  provides that part of the page.
- **Twig markup.** JSON:API sends a Twig component's inputs, not its markup, so
  each Twig component you use needs a wrapper.
- **Per-component access.** A block hidden from some roles in Drupal still
  reaches every reader through JSON:API. Don't rely on block access to hide
  content.
- **Menu blocks that start below the first level**, and a views block's
  `items_per_page` override. Write a wrapper for those.
- **Lists of objects as an input.** Canvas has none. Use child components in a
  slot instead.

## Troubleshooting

These are the commonest problems. [Troubleshooting](docs/troubleshooting.md)
covers the rest.

- **`nuxt build` stops with `[fatal] 500: Internal Server Error`.** Patch
  Canvas 1.12.0, as [Requirements](#requirements) says.
- **A component renders nothing in production.** It has no slots and no
  wrapper. Open the page in `nuxt dev` to see the wrapper names it accepts.
- **A wrapper isn't used.** Check the name it registered under. Nuxt drops
  folder names that the file name repeats, as [Theming](docs/theming.md#naming-the-file)
  explains.
- **The page renders, then empties in the browser.** Wrap DruxtCanvas in an
  element, as [Rendering a page yourself](#rendering-a-page-yourself) shows.

## More documentation

- [Drupal setup](docs/drupal-setup.md): modules, permissions, OAuth clients
  and the Canvas 1.12.0 patch
- [Theming](docs/theming.md): wrapper names, page wrappers, block mappings
  and HTML inputs
- [Troubleshooting](docs/troubleshooting.md)
- [The example](https://github.com/druxt-contrib/druxt-canvas/tree/0.x/example),
  a Nuxt site and a Drupal site with Canvas
- [Contributing](CONTRIBUTING.md)

## Licence

[MIT](LICENSE), except `example/drupal/`, the example Drupal site, which is
[GPL-2.0-or-later](https://github.com/druxt-contrib/druxt-canvas/blob/0.x/example/drupal/LICENSE.txt)
like Drupal itself.
