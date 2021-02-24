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
    return this.settings.salt;
  }

  isEnabled(domain) {
    const url = new URL(domain);
    return url.host in this.hostSettings;
  }

  hasAllowance(message) {
    // TODO: check allowance
    const allowance = this.getAllowance(message);
    return allowance && allowance.budget;
  }

  getAllowance(messageOrDomain) {
    let domain;
    if (typeof messageOrDomain === "string") {
      domain = messageOrDomain;
    } else if (messageOrDomain.origin) {
      domain = messageOrDomain.origin.domain;
    } else {
      return {}; // no domain found - no allowance
    }
    const url = new URL(domain);
    return this.hostSettings[url.host];
  }

  allowHost(domain, allowance) {
    const url = new URL(domain);
    const currentAllowance = this.hostSettings[url.host];
    this.hostSettings[url.host] = { ...currentAllowance, ...allowance };
    this.save();
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
