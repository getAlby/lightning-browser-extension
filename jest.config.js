/** @type {import('@jest/types').Config.InitialOptions} */

// we need this to avoid conflcits with .scwrc
// - `jsc`-entry isn't recognized
// - `env`-entry is recognized but supporting our build targets breaks tests
const swcConfig = {
  jsc: {
    transform: {
      react: {
        runtime: "automatic",
      },
    },
    target: "es2016",
  },
  env: {
    targets: "",
  },
};

// eslint-disable-next-line no-undef
module.exports = {
  verbose: true,
  transform: {
    "^.+\\.mjs?$": [
      // "dexie" needs this
      "@swc/jest",
      swcConfig,
    ],
    "^.+\\.(t|j)sx?$": ["@swc/jest", swcConfig],
  },
  transformIgnorePatterns: ["node_modules/(?!(@runcitadel))/"],
  moduleNameMapper: {
    // needs to align with "tsconfig.json"-paths
    // swc does not provide "pathsToModuleNameMapper" as ts-jest does
    "^~/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/app/components/$1",
    "^@screens/(.*)$": "<rootDir>/src/app/screens/$1",
  },
  setupFiles: ["jest-webextension-mock", "fake-indexeddb/auto"],
  testEnvironment: "./jest.custom-test-environment.js",
  setupFilesAfterEnv: ["./jest.setup.js"],
  modulePathIgnorePatterns: ["<rootDir>/tests"],
};
