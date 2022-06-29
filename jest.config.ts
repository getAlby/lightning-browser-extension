import { pathsToModuleNameMapper } from "ts-jest";

import { compilerOptions } from "./tsconfig.json";

module.exports = {
  verbose: true,
  transform: {
    "^.+\\.mjs?$": [ // "dexie" needs this
      "@swc/jest",
      {
        jsc: {
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
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
        },
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(@runcitadel))/"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  setupFiles: ["jest-webextension-mock", "fake-indexeddb/auto"],
  testEnvironment: "./jest.custom-test-environment.ts",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  modulePathIgnorePatterns: ["<rootDir>/tests"],
};
