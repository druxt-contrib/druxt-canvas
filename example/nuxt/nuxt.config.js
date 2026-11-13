import fs from 'fs'
import path from 'path'

// The Drupal backend this example talks to.
//
// DRUXT_BASE_URL first, so CI can point the example at whatever backend it
// has without editing a tracked file. Then the BASE_URL that
// example/drupal/.devtools/start writes to example/.env, so the Docker-free
// backend is found without copying a URL between terminals. The DDEV host is
// the last resort, and is one of the development domains the private-host
// lint allows.
function readDotenvBaseUrl() {
  try {
    const contents = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8')
    const match = contents.match(/^\s*BASE_URL\s*=\s*(.*?)\s*$/m)
    return match ? match[1].replace(/^(['"])(.*)\1$/, '$2') : null
  } catch {
    return null
  }
}

const baseUrl =
  process.env.DRUXT_BASE_URL ||
  readDotenvBaseUrl() ||
  'http://druxt-canvas.ddev.site'

export default {
  // druxt-entity and druxt-router route a Canvas page's path to it:
  // /canvas-demo is a page on the backend, with no page here.
  buildModules: [
    'druxt',
    'druxt-entity',
    'druxt-router/nuxt',
    '@druxt-contrib/canvas',
  ],
  druxt: { baseUrl },
  // The pages are the example's routes, plus the backend's Canvas page. A
  // Canvas page links to paths on the Drupal site, which this example does
  // not serve.
  generate: { crawler: false, routes: ['/canvas-demo'] },
}
