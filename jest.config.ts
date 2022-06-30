module.exports = {
  verbose: true,
  transform: {
    "^.+\\.mjs?$": [
      // "dexie" needs this
      "@swc/jest",
      {
        jsc: {
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
        target: "es2016",
      },
    ],
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          transform: {
            react: {
              runtime: "automatic",
            },
          },
          target: "es2016",
        },
      },
    ],
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
  testEnvironment: "./jest.custom-test-environment.ts",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  modulePathIgnorePatterns: ["<rootDir>/tests"],
};
