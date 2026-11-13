# Fixtures

JSON:API and Decoupled Router responses from a Drupal CMS 2.2.9 site (core 11.4.12, Canvas 1.12.0, Decoupled Router 2.0.7), read anonymously, with Canvas's headless module and Custom Elements uninstalled. Only the content's wording was changed.

| File                              | Request                                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `canvas-page-1-home-include.json` | `/jsonapi/canvas_page/canvas_page/{uuid}?include=image,owner`, the front page: a CTA with a button in its `actions` slot    |
| `canvas-page-2.json`              | `/jsonapi/canvas_page/canvas_page/{uuid}`: Mercury components, a section with two slots, a menu block and a views block     |
| `canvas-page-3.json`              | `/jsonapi/canvas_page/canvas_page/{uuid}`: code components, one with a component in its slot                                |
| `canvas-page-3-sparse.json`       | The same page with `fields[canvas_page--canvas_page]=title,components,metatag,path`                                         |
| `canvas-pages-collection.json`    | `/jsonapi/canvas_page/canvas_page`                                                                                          |
| `router-front.json`               | `/router/translate-path?path=/`                                                                                             |
| `router-demo-external.json`       | `/router/translate-path?path=/demo-external`                                                                                |
| `router-page-alias-redirect.json` | `/router/translate-path?path=/page/2`                                                                                       |
| `view-display-canvas-page.json`   | `/jsonapi/entity_view_display/entity_view_display?filter[targetEntityType]=canvas_page`: Canvas pages have no view displays |
