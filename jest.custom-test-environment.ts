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
  }
}

export default CustomEnvironment;
