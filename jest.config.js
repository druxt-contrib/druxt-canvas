module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,vue}'],
  coverageDirectory: './coverage/',
  // A floor, not a target. These are the measured baseline of this module's
  // own tests, rounded down: raise them as coverage genuinely improves, and
  // never lower them to make a merge request pass. Collecting coverage without
  // a threshold is the shape this replaces, and it enforces nothing while
  // looking like it does.
  //
  // Branches sits below 100 because esbuild's transform emits interop branches
  // in the compiled output that no test can reach, and vue-jest 3 maps each
  // .vue file's compiled branches onto its first lines. Measured, not guessed: run
  // `npm test` and read the table before changing these.
  //
  // 75, from 77: dropping the fallback to Canvas's stored inputs, whose markup
  // is unfiltered, removed branches the tests covered, so the unreachable ones
  // above are a larger share. No reachable branch lost its test.
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 75,
      functions: 100,
      lines: 100,
    },
  },
  coveragePathIgnorePatterns: ['/dist/', '/node_modules/'],
  moduleFileExtensions: ['js', 'json', 'vue'],
  // The components import the package by its own name, because the build
  // copies src/components into dist without the modules beside them. Tests
  // read the source instead.
  moduleNameMapper: {
    '^@druxt-contrib/canvas$': '<rootDir>/src/index.js',
  },
  modulePathIgnorePatterns: ['/example/'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/example/', '/test/e2e/'],
  transform: {
    '^.+\\.(js)$': 'esbuild-jest',
    '^.+\\.(mjs)$': 'esbuild-jest',
    '^.+\\.(vue)$': 'vue-jest',
  },
  // Druxt packages ship .vue files and ES modules as source, so Jest
  // transforms them.
  transformIgnorePatterns: ['/node_modules/(?!(druxt|druxt-[a-z]+)/)'],
}
