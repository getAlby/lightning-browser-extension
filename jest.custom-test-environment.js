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
    // These must come from the same realm: axios composes an AbortSignal for
    // timeouts/cancellation and Node's Request rejects a jsdom one, so the
    // abort primitives are replaced rather than only filled in when missing.
    for (const name of ["fetch", "Headers", "Request", "Response"]) {
      if (this.global[name] === undefined && globalThis[name] !== undefined) {
        this.global[name] = globalThis[name];
      }
    }
    for (const name of ["AbortController", "AbortSignal"]) {
      if (globalThis[name] !== undefined) {
        this.global[name] = globalThis[name];
      }
    }
  }
}

export default CustomEnvironment;
