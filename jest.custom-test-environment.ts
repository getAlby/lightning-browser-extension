import { TestEnvironment } from "jest-environment-jsdom";

class CustomEnvironment extends TestEnvironment {
  constructor({ globalConfig, projectConfig }, context) {
    super({ globalConfig, projectConfig }, context);
    const config = projectConfig;

    Object.assign({}, config, {
      globals: Object.assign({}, config.globals, {
        Uint8Array: Uint8Array,
      }),
    });
  }
}

export default CustomEnvironment;
