class Base {
  constructor(config) {
    this.config = config;
  }

  init() {
    return Promise.resolve();
  }
}

export default Base;
