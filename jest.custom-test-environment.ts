import BrowserEnvironment from "jest-environment-jsdom";

class CustomEnvironment extends BrowserEnvironment {
  constructor(config) {
    super(
      Object.assign({}, config, {
        globals: Object.assign({}, config.globals, {
          Uint8Array: Uint8Array,
        }),
      })
    );
  }
}

export default CustomEnvironment;
