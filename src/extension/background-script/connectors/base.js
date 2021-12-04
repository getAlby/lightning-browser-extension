class Base {
  constructor(config) {
    this.config = config;
  }

  init() {
    return Promise.resolve();
  }

  unload() {
    return Promise.resolve();
  }
}

export default Base;
