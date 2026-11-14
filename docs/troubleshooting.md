# Troubleshooting

In development, a module that can't render shows Druxt's debug message in its
place. The module's warnings appear in the console, browser or server, after
`[druxt-canvas]`. Production shows and logs neither.

- [The build](#the-build)
- [A page](#a-page)
- [A component](#a-component)
- [Warnings](#warnings)

## The build

### `[fatal] 500: Internal Server Error`

Canvas 1.12.0 answers HTTP 500 to the second page of a JSON:API collection of
configuration entities, which Druxt Schema reads during the build. Patch
Canvas, as [Drupal setup](drupal-setup.md#canvas-1120-and-the-druxt-build)
shows.

### `Cannot find module 'druxt-entity'`, or another Druxt module

Install the Druxt modules `nuxt.config.js` lists, or Druxt Site, which adds
them, as the [Quick start](../README.md#quick-start) shows.

## A page

### A Canvas path shows the site's 404 page

Decoupled Router didn't resolve the path. Check that the page is published, or
readable by the role your site reads as, and that its path alias is the one you
opened. A page without an alias is at `/page/<id>`.

### The page renders nothing

The page could not be loaded: the UUID is wrong, the page is unpublished, or
the role your site reads as can't view it. In development, Druxt's debug
message shows the status, such as `404: Not Found` or `403: Forbidden`. In
production, the page renders an empty element, and the response status
doesn't change. A path DruxtRouter can't resolve gets the router's 404 instead.

### The page renders on the server, then empties in the browser

DruxtCanvas is the root element of a Nuxt page that has a `fetch()` of its own,
so the two share one fetch key. Wrap DruxtCanvas in an element, as
[Rendering a page yourself](../README.md#rendering-a-page-yourself) shows.

### The page has no title or meta tags

Install Metatag on Drupal, as [Drupal setup](drupal-setup.md#modules) says.
DruxtCanvas sets the head only for the current route's page, unless you set
its `metatags` prop.

### An editor's change isn't on the site

Canvas keeps changes as drafts until an editor publishes them in Canvas.
JSON:API, and so the site, sees published changes only. A generated site also
needs a new build.

## A component

### A component renders nothing

It has no Canvas slots and no wrapper component. In development, Druxt's debug
message names the wrapper components it would accept. Write one, as
[Theming](theming.md#component-wrappers) describes.

### A wrapper isn't used

Check the name Nuxt registered it under. Nuxt drops folder names that the file
name repeats, so `components/druxt/canvas/js/DruxtCard.vue` registers as
`DruxtCard`. See [Naming the file](theming.md#naming-the-file).

### A wrapper's props are empty

Check the prop names: inputs arrive in camelCase, so `heading_text` is
`headingText`. Then check that the page's `components` items have
`inputs_resolved`, as [Check the site](drupal-setup.md#check-the-site)
describes.

### Inputs appear as HTML attributes

The wrapper doesn't use `DruxtCanvasComponentMixin`, so the inputs it doesn't
declare as props become attributes of its root element. Add the mixin.

### A menu, views or breadcrumb block renders nothing

Its Druxt module isn't installed, so the mapping is left out of the build.
Install Druxt Menu, Druxt Views or Druxt Breadcrumb, or Druxt Site.

## Warnings

### `[druxt-canvas] Left out component instance <uuid> (<reason>) of <type> <id>.`

The page's `components` field has an item DruxtCanvas can't place, so it is
left out rather than shown somewhere Canvas didn't put it. The reason is one
of:

- `orphan`: its parent isn't on the page.
- `slot`: it has a parent but no slot.
- `cycle`: its parents form a loop.
- `invalid`: it has no UUID or no component ID.
- `duplicate`: an earlier item has the same UUID. The first one is kept.

Report it on the
[issue queue](https://github.com/druxt-contrib/druxt-canvas/issues), with the
page's JSON:API response.

### `[druxt-canvas] Not rendering <type> <id> inside itself.`

A page holds a view or a reference that lists the page itself. DruxtCanvas
renders it once, not inside itself.
