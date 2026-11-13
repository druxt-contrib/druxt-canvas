const { test, expect } = require('@playwright/test')

/**
 * End-to-end checks against the generated example application.
 *
 * The unit tests render the components with test doubles for Nuxt. These
 * read what a real Nuxt build of the module produces: the components it
 * registers, the block mappings it leaves out at build time, the site's own
 * wrapper components and the page head.
 *
 * The example backend has no Canvas, so the example renders Canvas pages that
 * were saved from a Drupal CMS site with Canvas (test/fixtures). The checks
 * that need Canvas on the backend are listed at the end, skipped.
 */

test.describe('a saved Canvas page', () => {
  test('is served', async ({ page }) => {
    const response = await page.goto('/')
    expect(response.status()).toBe(200)
  })

  test('renders its tree through the site wrappers, in order', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toHaveText('Druxt meets Canvas')
    await expect(page.locator('.text')).toContainText(
      'A Canvas page rendered by a Nuxt frontend.'
    )
    await expect(page.locator('section header h2')).toHaveText('Two cards')
    await expect(page.locator('section .columns article h3')).toHaveText([
      'First card',
      'Second card',
    ])
    await expect(page.locator('a.button')).toHaveText('Read the docs')
  })

  test('sets the head from its metatag field', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle('Canvas demo page | Canvas demo')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      '/demo'
    )
  })

  test('renders blocks whose Druxt module is not installed as empty elements', async ({
    page,
  }) => {
    await page.goto('/')

    // The page holds a menu block and a views block, and the example installs
    // neither druxt-menu nor druxt-views. Each block renders an empty element
    // in production, with no debug message, and the rest of the page renders.
    await expect(page.locator('nav')).toHaveCount(0)
    await expect(page.locator('details')).toHaveCount(0)
    await expect(page.locator('a.button')).toHaveText('Read the docs')
  })

  test('renders a code component through a wrapper named in full', async ({
    page,
  }) => {
    await page.goto('/external')

    // components/DruxtCanvasJsDruxtCard.vue: in a folder named after its
    // parts, Nuxt 2 would register it under a shorter name.
    await expect(page.locator('.druxt-card h3')).toHaveText('A Druxt card')
    await expect(page.locator('.druxt-card p')).toHaveText(
      'Props arrive as data.'
    )
  })

  test('matches the committed baseline @visual', async ({ page }) => {
    await page.goto('/')
    // Fonts and images settle after load; without this the first render is
    // captured mid-layout and every run differs from every other.
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('home.png', { fullPage: true })
  })
})

test.describe('a Canvas page from the backend', () => {
  // These need Drupal Canvas on the example backend, which runs Drupal core
  // with the standard profile and no Canvas. See example/README.md.
  test.skip(
    true,
    'The example backend does not have Drupal Canvas installed. See example/README.md.'
  )

  test('renders by its path, through DruxtRouter and DruxtEntity', () => {})

  test('renders by uuid, fetched through the Druxt store', () => {})
})
