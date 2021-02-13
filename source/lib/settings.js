import browser from "webextension-polyfill";

class Settings {
  constructor(args) {
    if (!args) {
      args = {};
    }
    this.settings = args.settings || {};
    this.hostSettings = args.hostSettings || {};
  }

  load() {
    return browser.storage.sync
      .get(["settings", "hostSettings"])
      .then((result) => {
        this.settings = result.settings || {};
        this.hostSettings = result.hostSettings || {};
        return this;
      });
  }

  get debug() {
    return this.settings.debug;
  }

  get salt() {
    return "salt";
  }

  isEnabled(domain) {
    const url = new URL(domain);
    return url.host in this.hostSettings;
  }

  hasAllowance(message) {
    const domain = message.origin && message.origin.domain;
    const url = new URL(domain);
    // TODO: check allowance
    const allowance = this.hostSettings[url.host];
    return allowance && allowance.budget;
  }

  getAllowance(domain) {
    const url = new URL(domain);
    return this.hostSettings[url.host];
  }

  allowHost(domain, allowance) {
    const url = new URL(domain);
    this.hostSettings[url.host] = allowance;
    if (allowance.remember) {
      this.save();
    } else {
      return Promise.resolve();
    }
  }

  storePayment(message, paymentResponse) {
    const url = new URL(message.origin.domain);
    const allowance = this.hostSettings[url.host];
    const { total_fees, total_amt } = paymentResponse.data.payment_route;
    if (allowance && allowance.budget) {
      allowance.budget = allowance.budget - total_amt - total_fees;
      this.hostSettings[url.host] = allowance;
      this.save();
    }
  }

  save() {
    return browser.storage.sync.set({
      settings: this.settings,
      hostSettings: this.hostSettings,
    });
  }
}

export default Settings;
