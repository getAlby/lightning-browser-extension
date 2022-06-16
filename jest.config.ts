import { pathsToModuleNameMapper } from "ts-jest";

import { compilerOptions } from "./tsconfig.json";

module.exports = {
  verbose: true,
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
    "^.+\\.mjs?$": "babel-jest", // "dexie" needs this
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
