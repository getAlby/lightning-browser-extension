import OptionsSync from "webext-options-sync";
import browser from "webextension-polyfill";
import utils from "./utils";

class Accounts {
  constructor(args) {
    this.accounts = {}; // will be loaded async in `load()`
    this.storage = new OptionsSync({
      storageName: "accounts",
      defaults: {
        currentKey: null,
        accounts: {},
      },
    });
  }

  load() {
    return this.storage.getAll().then((result) => {
      this.accounts = result.accounts;
      this.currentKey = result.currentKey;
    });
  }

  get current() {
    if (!this.currentKey) {
      return null;
    }
    return this.accounts[this.currentKey];
  }

  getAccount(accountKey) {
    return this.accounts[accountKey];
  }

  setCurrent(accountKey) {
    this.set({ currentKey: key }).then(() => {
      return this.load();
    });
  }

  // TODO: add some validation?
  setAccount(account, makeCurrent = false) {
    const key = utils.getHash(account.name);
    this.accounts[key] = { ...this.getAccount(key), ...account };
    const update = { accounts: this.accounts };
    if (makeCurrent) {
      update.currentKey = key;
    }
    return this.storage.set(update).then(() => {
      return this.load();
    });
  }

  removeAccount(accountKey) {
    delete this.accounts[accountKey];
    // clear the current selection if needed
    if (this.currentKey === accountKey) {
      this.currentKey = null;
    }
    return this.storage
      .set({ accounts: this.acounts, currentKey: this.currentKey })
      .then(() => {
        return this.load();
      });
  }

  reset() {
    return this.storage.set({ accounts: {}, currentKey: null }).then(() => {
      return this.load();
    });
  }
}

export default Accounts;
