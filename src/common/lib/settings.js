import OptionsSync from "webext-options-sync";
class Settings {
  constructor(args) {
    this.settings = {}; // will be loaded async in `load()`
    this.storage = new OptionsSync({
      storageName: "settings",
      defaults: {
        debug: true,
        enableLsats: true,
        salt: "",
      },
    });
  }

  load() {
    return this.storage.getAll().then((settings) => {
      this.settings = settings;
      return this.setup();
    });
  }

  setup() {
    if (!this.settings.salt || this.settings.salt === "") {
      this.settings.salt = window.crypto
        .getRandomValues(new Uint32Array(4))
        .join("");
      return this.storage.setAll(this.settings);
    } else {
      return Promise.resolve();
    }
  }

  get debug() {
    return this.settings.debug;
  }

  get salt() {
    return this.settings.salt;
  }

  get enableLsats() {
    return this.settings.enableLsats;
  }

  set(options) {
    return this.storage.set(options).then(() => {
      return this.load();
    });
  }

  reset() {
    this.storage.set(this.storage.defaults);
  }
}

export default Settings;
