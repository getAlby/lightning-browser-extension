interface Config {
  adminkey?: string;
  login?: string;
  macaroon?: string;
  password?: string;
  url?: string;
}

class Base {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  init() {
    return Promise.resolve();
  }
}

export default Base;
