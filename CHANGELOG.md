# Changelog

## 0.1.0

### Minor Changes

- Added the DruxtCanvas module. It renders Drupal Canvas pages in a Druxt site, from Drupal's JSON:API. ([`cc4fb7c`](https://github.com/druxt-contrib/druxt-canvas/commit/cc4fb7c))

  - Renders a Canvas page at its own path through DruxtRouter, or anywhere by its UUID.
  - Renders each Canvas component through a Vue wrapper named after it, with its inputs as props and its slots as Vue slots.
  - Renders Canvas's menu, views and breadcrumb blocks as DruxtMenu, DruxtView and DruxtBreadcrumb.
  - Sets the page title and meta tags from the page's `metatag` field.
