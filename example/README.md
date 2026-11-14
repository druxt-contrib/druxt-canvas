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

`/` and `/external` need nothing else. `/canvas-demo` and `/backend` read the
example backend, so set it up first with `npm run example:setup`, as
[The backend](#the-backend) describes.

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
`PLAYWRIGHT_BASE_URL` it generates the example (`npm run example:generate`)
and serves `example/nuxt/dist` with `npm run serve`, as the pipelines do, so
the tests see the production build. Some checks hold only there: under
`example:dev` the uninstalled blocks show Druxt's debug message.

Generating reads the backend, so start it first (`npm run example:setup`).

## The backend

`drupal/` is a Drupal 11 site on SQLite with the Druxt module and Canvas, which
`npm run example:setup` provisions without Docker, with PHP 8.3 or later and
Composer on the host. Its view displays fit on one JSON:API page, which keeps
it clear of the Canvas 1.12.0 defect that
[Drupal setup](../docs/drupal-setup.md#canvas-1120-and-the-druxt-build)
describes.

The `drupal/recipes/druxt_canvas_example` recipe sets the site up: the Druxt
module and its permission for anonymous visitors, Canvas, and one Canvas page, as default content. The
core standard profile has no single-directory component with text inputs, so
the page is built from a code component, in the recipe's `config/`, rendered by
the example's `DruxtCanvasJsDruxtCard` wrapper.

`cd example/drupal && ddev start && ddev drupal-install` builds the same site
on DDEV's MySQL.

To run the example against your own Canvas site, set `DRUXT_BASE_URL` and open
a Canvas page's path. [Drupal setup](../docs/drupal-setup.md) lists what the
Drupal site needs.

`drupal/` is a Drupal site, so it is licensed GPL-2.0-or-later, like Drupal,
not MIT like the rest of the repository. See `drupal/LICENSE.txt`.

## What is in here

| Path                   | Purpose                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| `nuxt/`                | The Nuxt 2 application, with the module as `file:../..`                  |
| `nuxt/components/`     | Wrapper components for Mercury's components and a code component         |
| `nuxt/pages/`          | Saved Canvas pages at `/` and `/external`; the backend's at `/backend`   |
| `nuxt/package.json`    | Pins `consola` 2: webpack 4 cannot parse the version 3 build             |
| `drupal/composer.json` | Drupal 11 with `drupal/druxt` and `drupal/canvas`; the lock is committed |
| `drupal/recipes/`      | The recipe the backend is provisioned with                               |
| `drupal/.devtools/`    | Docker-free provisioning: assemble, provision, start, stop, info         |
