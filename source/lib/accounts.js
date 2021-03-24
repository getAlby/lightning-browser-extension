import browser from "webextension-polyfill";
import utils from "./utils";

class Accounts {
  constructor(args) {
    this.accounts = {}; // will be loaded async in `load()`
    this.currentKey = null;
  }

  load() {
    return browser.storage.sync
      .get(["accounts", "currentKey"])
      .then((result) => {
        this.accounts = result.accounts || {};
        this.currentKey = result.currentKey;
      });
  }

  set(data) {
    return browser.storage.sync.set(data).then(() => {
      this.load();
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
    this.set({ currentKey: accountKey }).then(() => {
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
    return this.set(update);
  }

  removeAccount(accountKey) {
    delete this.accounts[accountKey];
    // clear the current selection if needed
    if (this.currentKey === accountKey) {
      this.currentKey = null;
    }
    return this.set({ accounts: this.acounts, currentKey: this.currentKey });
  }

  reset() {
    return this.set({ accounts: {}, currentKey: null });
  }
}

export default Accounts;
