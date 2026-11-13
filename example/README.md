# Example application

A Nuxt application that loads the module and renders Canvas pages through the
wrapper components a site would write, so a change to the module shows here as
a site would see it.

## Run it

From the repository root, with Node 16:

```sh
npm install              # the module's dependencies, and the git hooks
npm run build            # the example links the module by path, so build first
npm run example:install  # the example's dependencies
npm run example:dev      # http://localhost:3000
```

`/` renders a Canvas page of Mercury components, a section with two slots, a
menu block and a views block. `/external` renders a page of code components.

Both pages are JSON:API responses saved from a Drupal CMS 2.2.9 site with
Canvas 1.12.0, kept in `test/fixtures`, and handed to `DruxtCanvas` as its
`value`. Everything after the request is the module at work, from building the
component tree to setting the page head.

`/canvas-demo` is a Canvas page on the example backend, which DruxtRouter renders by
its path with no page in the example. `/backend` renders the same page by its
uuid. It holds two code component cards, one in the other's slot, and the main
menu block.

The wrapper components are in `nuxt/components`. The menu and views blocks have
none, and the example installs neither druxt-menu nor druxt-views, so they
render as empty elements. Under `example:dev` each shows Druxt's debug message
naming the wrapper components it would accept.

## Tests against it

`npm run test:e2e` runs Playwright against the example. With no
`PLAYWRIGHT_BASE_URL` it starts the dev server itself. The pipelines generate
the example (`npm run example:generate`) and serve `example/nuxt/dist` with
`npm run serve` instead, which is what a visitor gets.

The checks of the backend's Canvas page, by its path and by its uuid, need the
backend running when the example is generated.

## The backend

`drupal/` is a Drupal 11 site on SQLite with the Druxt module and Canvas, which
`npm run example:setup` provisions without Docker, with PHP 8.3 or later and
Composer on the host. Its view displays fit on one JSON:API page, which keeps
it clear of the Canvas defect the main README describes.

`drupal/.devtools/canvas-page.php` saves its one Canvas page. The core standard
profile has no single-directory component with text inputs, so the page is
built from a code component, rendered by the example's `DruxtCanvasJsDruxtCard`
wrapper.

`cd example/drupal && ddev start && ddev drupal-install` builds the same site
on DDEV's MySQL.

To run the example against your own Canvas site, set `DRUXT_BASE_URL`, add
`druxt-entity` and `druxt-router/nuxt` before `@druxt-contrib/canvas` in
`nuxt/nuxt.config.js`, and open a Canvas page's path. The main README lists
what the Drupal site needs.

## What is in here

| Path                   | Purpose                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| `nuxt/`                | The Nuxt 2 application, with the module as `file:../..`                  |
| `nuxt/components/`     | Wrapper components for Mercury's components and a code component         |
| `nuxt/pages/`          | Saved Canvas pages at `/` and `/external`; the backend's at `/backend`   |
| `nuxt/package.json`    | Pins `consola` 2: webpack 4 cannot parse the version 3 build             |
| `drupal/composer.json` | Drupal 11 with `drupal/druxt` and `drupal/canvas`; the lock is committed |
| `drupal/.devtools/`    | Docker-free provisioning: assemble, provision, start, stop, info         |
