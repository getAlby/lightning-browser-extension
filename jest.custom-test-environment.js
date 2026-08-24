import { TestEnvironment } from "jest-environment-jsdom";

class CustomEnvironment extends TestEnvironment {
  constructor({ globalConfig, projectConfig }, context) {
    super(
      {
        globalConfig,
        projectConfig: {
          ...projectConfig,
          globals: { ...projectConfig.globals, Uint8Array: Uint8Array },
        },
      },
      context
    );

    // jsdom does not expose fetch, which axios' fetch adapter (used for LNURL
    // requests) relies on. Bridge Node's global fetch into the test realm so
    // those requests run and msw can intercept them.
    for (const name of [
      "fetch",
      "Headers",
      "Request",
      "Response",
      "AbortController",
      "AbortSignal",
    ]) {
      if (this.global[name] === undefined && globalThis[name] !== undefined) {
        this.global[name] = globalThis[name];
      }
    }
  }
}

export default CustomEnvironment;
