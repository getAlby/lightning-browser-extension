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
};

// eslint-disable-next-line no-undef
module.exports = {
  verbose: true,
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", swcConfig],
  },
  transformIgnorePatterns: ["node_modules/(?!(lnmessage))/"],
  moduleNameMapper: {
    "^dexie$": require.resolve("dexie"),
    // needs to align with "tsconfig.json"-paths
    // swc does not provide "pathsToModuleNameMapper" as ts-jest does
    "^~/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/app/components/$1",
    "^@screens/(.*)$": "<rootDir>/src/app/screens/$1",
    // mock media imports - see https://stackoverflow.com/a/54513338/4562693
    "\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/tests/unit/fileMock.js",
  },
  setupFiles: ["jest-webextension-mock", "fake-indexeddb/auto"],
  testEnvironment: "./jest.custom-test-environment.js",
  setupFilesAfterEnv: ["./jest.setup.js"],
  modulePathIgnorePatterns: ["<rootDir>/tests"],
};
