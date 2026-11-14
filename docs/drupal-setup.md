# Drupal setup

What the Drupal site needs before a Druxt site can render its Canvas pages.
Tested with Drupal CMS 2.2.9 (core 11.4.12), Canvas 1.12.0, Druxt 1.2.2 and
Decoupled Router 2.0.7.

- [Modules](#modules)
- [Permissions](#permissions)
- [Resources and fields](#resources-and-fields)
- [The front page](#the-front-page)
- [Check the site](#check-the-site)
- [Canvas 1.12.0 and the Druxt build](#canvas-1120-and-the-druxt-build)

## Modules

1. Install [Canvas](https://www.drupal.org/project/canvas) 1.12.0 or later. It
   needs Drupal 11.3 or later and PHP 8.3 or later.
   [Drupal CMS](https://www.drupal.org/drupal-cms) has it already.
2. Install the [Druxt module](https://www.drupal.org/project/druxt) 1.2.2 or
   later:

   ```sh
   composer require drupal/druxt:^1.2.2
   drush pm:install druxt
   ```

   It brings JSON:API,
   [Decoupled Router](https://www.drupal.org/project/decoupled_router),
   [JSON:API Menu Items](https://www.drupal.org/project/jsonapi_menu_items) and
   [JSON:API Views](https://www.drupal.org/project/jsonapi_views), which the
   menu and views blocks read.

3. For the page title and meta tags, install
   [Metatag](https://www.drupal.org/project/metatag). DruxtCanvas reads its
   `metatag` field. Without it, Canvas pages render with no head of their own.
   Drupal CMS has it already.

With JSON:API enabled, Canvas shows a warning on the status report, and an
error when PHP assertions are on. Keep `zend.assertions = -1` in production, as
Drupal recommends anyway.

Canvas's headless module and Custom Elements are not needed. The module is
tested with both uninstalled.

## Permissions

A Canvas page is read under Canvas's own access, like a node. A published page
needs `access content`, which anonymous visitors have on Drupal CMS.

Give "**access druxt resources**" to the role your site reads as. Druxt builds
from the configuration it opens, such as view displays, fields, menus and
views. It makes that configuration readable, GET only, by every role that
holds it, admin views and block settings included. Grant it to anonymous
visitors only if that is acceptable. Otherwise have the Nuxt site read as a
role of its own.

Anyone with `create canvas_page`, `edit canvas_page` or `delete canvas_page`
can also read unpublished pages, and DruxtCanvas renders whatever JSON:API
returns. If the site reads Drupal as a signed-in user or an OAuth client, such
as through Simple OAuth and DruxtAuth, give that role `access content` and
`access druxt resources` only. Never give it the Canvas editing permissions,
or the site shows unpublished pages, and a generated site bakes them into its
HTML.

## Resources and fields

DruxtCanvas reads `canvas_page--canvas_page` by UUID, with its `title`, `path`,
`metatag` and `components` fields. From `components` it reads each item's
`uuid`, `component_id`, `component_version`, `parent_uuid`, `slot`, `label` and
`inputs_resolved`.

If the site uses JSON:API Extras, keep that resource enabled and those fields
under their own names. JSON:API can stay read-only.

## The front page

To make a Canvas page the front page, set its path as the default front page
under **Configuration > Basic site settings**. Drupal CMS does this for its
home page. Decoupled Router then resolves `/` to the Canvas page.

## Check the site

As an anonymous visitor, or with your client's token:

1. `curl https://drupal.example.com/router/translate-path?path=/your-page-alias`
   answers with the page's `jsonapi.individual` URL.
2. That URL answers with the page, and each item in its `components` has
   `inputs_resolved`.
3. `curl https://drupal.example.com/jsonapi/entity_view_display/entity_view_display`
   answers 200, not 403.
4. The check in [Canvas 1.12.0 and the Druxt build](#canvas-1120-and-the-druxt-build)
   answers 200.

## Canvas 1.12.0 and the Druxt build

Canvas 1.12.0 swaps in its own query for configuration entities, and that query
passes JSON:API's `page[offset]` on as a string under strict types. Any JSON:API
request for a collection of configuration entities with a `page[offset]` then
answers HTTP 500. Druxt Schema reads `entity_view_display` and
`entity_form_display` page by page while `nuxt build` runs, and a Drupal CMS
site has more than one page of them, so the build stops with
`[fatal] 500: Internal Server Error`.

The defect is in Canvas, tracked in
[Canvas issue 3592360](https://git.drupalcode.org/project/canvas/-/work_items/3592360).
Until a release fixes it, patch Canvas with
[Composer Patches](https://github.com/cweagans/composer-patches). Save this as
`patches/canvas-3592360-config-entity-query-offset.patch`:

```diff
--- a/src/CoreBugFix/ConfigEntityQuery.php
+++ b/src/CoreBugFix/ConfigEntityQuery.php
@@ -63,7 +63,7 @@
     $this->initializePager();

     if ($this->range) {
-      $result = array_slice($result, $this->range['start'], $this->range['length'], TRUE);
+      $result = array_slice($result, (int) $this->range['start'], $this->range['length'], TRUE);
     }
     if ($this->count) {
       return count($result);
```

Then add it to `composer.json`, and run `composer install`:

```json
"extra": {
  "patches": {
    "drupal/canvas": {
      "JSON:API config collections fail after the first page (3592360)": "patches/canvas-3592360-config-entity-query-offset.patch"
    }
  }
}
```

To check a site, ask for a later page:

```sh
curl -s -o /dev/null -w '%{http_code}\n' \
  'https://drupal.example.com/jsonapi/entity_view_display/entity_view_display?page[offset]=50'
```

It answers 500 without the fix and 200 with it.
