<?php

/**
 * @file
 * The example's Canvas page, run by provision through `drush php:script`.
 *
 * The standard profile has no SDC with text inputs, so the page is built from
 * a code component, `js.druxt_card`, which the example renders through
 * nuxt/components/DruxtCanvasJsDruxtCard.vue. One card sits in the other's
 * slot, and the main menu block follows them. The uuids are fixed, because
 * the example and its tests name the page by them.
 */

declare(strict_types=1);

use Drupal\canvas\Entity\Component;
use Drupal\canvas\Entity\JavaScriptComponent;

if (!JavaScriptComponent::load('druxt_card')) {
  // The source is a stub: Drupal never renders this page, the example does.
  $source = 'export default function DruxtCard() { return null }';
  JavaScriptComponent::create([
    'machineName' => 'druxt_card',
    'name' => 'Druxt card',
    'status' => TRUE,
    'required' => [],
    'props' => [
      'title' => ['type' => 'string', 'title' => 'Title', 'examples' => ['Card title']],
      'body' => ['type' => 'string', 'title' => 'Body', 'examples' => ['Card body']],
    ],
    'slots' => ['content' => ['title' => 'Content']],
    'dataDependencies' => [],
    'js' => ['original' => $source, 'compiled' => $source],
    'css' => ['original' => '', 'compiled' => ''],
  ])->save();
}

$outer = '0c1ff9e5-0b9e-4c55-8e0a-6d5e4f3b2a10';
$tree = [
  [
    'uuid' => $outer,
    'component_id' => 'js.druxt_card',
    'inputs' => ['title' => 'From the backend', 'body' => 'A Canvas page saved on the example backend.'],
  ],
  [
    'uuid' => '5b7d0c3e-2f4a-4e8b-9c1d-7a6b5c4d3e21',
    'component_id' => 'js.druxt_card',
    'parent_uuid' => $outer,
    'slot' => 'content',
    'inputs' => ['title' => 'A nested card', 'body' => "In the outer card's content slot."],
  ],
  [
    'uuid' => '9e8d7c6b-5a49-4c38-8b27-1a0f9e8d7c32',
    'component_id' => 'block.system_menu_block.main',
    'inputs' => ['label' => 'Main navigation', 'label_display' => '0', 'level' => 1, 'depth' => 1, 'expand_all_items' => FALSE],
  ],
];
foreach ($tree as &$item) {
  $item['component_version'] = Component::load($item['component_id'])->getActiveVersion();
}
unset($item);

$page = \Drupal::entityTypeManager()->getStorage('canvas_page')->create([
  'uuid' => '1e3d2230-6e22-4f9a-83a3-174ec6d69087',
  'title' => 'Canvas on the backend',
  'description' => 'A Canvas page from the example backend.',
  'status' => TRUE,
  'path' => ['alias' => '/canvas'],
  'components' => $tree,
]);
$violations = $page->validate();
foreach ($violations as $violation) {
  fwrite(STDERR, sprintf("%s: %s\n", $violation->getPropertyPath(), strip_tags((string) $violation->getMessage())));
}
if (count($violations)) {
  exit(1);
}
$page->save();
echo 'Canvas page ' . $page->uuid() . ' at /canvas' . PHP_EOL;
