import browser from "webextension-polyfill";
import utils from "./utils";

const ALLOWANCE_DEFAULTS = {
  enabled: false,
  budget: 0,
  spent: 0,
  lastPayment: 0,
  lastPaymentAttempt: 0,
  notifications: true,
  maxSatoshisPerPayment: 1000,
  minSecondsIntervalPerPayment: 30,
};

class Allowances {
  constructor() {
    this.allowances = {}; // will be loaded async in `load()`
  }

  load() {
    return browser.storage.sync.get(["allowances"]).then((result) => {
      this.allowances = result.allowances || {};
    });
  }

  set(data) {
    return browser.storage.sync.set(data).then(() => {
      this.load();
    });
  }

  isEnabled(domain) {
    const allowance = this.getAllowance(domain);
    return allowance.enabled;
  }

  enable(messageOrDomain) {
    const allowance = this.getAllowance(messageOrDomain);
    allowance.enabled = true;
    this.updateAllowance(messageOrDomain, allowance);
  }

  getAllowance(messageOrDomain) {
    const hash = this.getAllowanceKey(messageOrDomain);
    const allowance = this.allowances[hash] || ALLOWANCE_DEFAULTS;
    allowance.budgetLeft = allowance.budget - allowance.spent;
    return allowance;
  }

  getAllowanceKey(messageOrDomain) {
    const domain = this.getDomain(messageOrDomain);
    const url = new URL(domain);
    return utils.getHash(url.host);
  }

  getDomain(messageOrDomain) {
    if (typeof messageOrDomain === "string") {
      return messageOrDomain;
    } else if (messageOrDomain.domain) {
      return messageOrDomain.domain;
    } else if (messageOrDomain.origin && messageOrDomain.origin.domain) {
      return messageOrDomain.origin.domain;
    } else {
      return null;
    }
  }

  removeAllowance(messageOrDomain) {
    const hash = this.getAllowanceKey(messageOrDomain);
    delete this.allowances[hash];
    return this.set({ allowances: this.allowances });
  }

  setAllowance(messageOrDomain, allowance) {
    const hash = this.getAllowanceKey(messageOrDomain);
    const domain = this.getDomain(messageOrDomain);
    this.allowances[hash] = { ...ALLOWANCE_DEFAULTS, domain, ...allowance };
    // save new allowance and update allowances cache(this.allowances)
    return this.set({ allowances: this.allowances });
  }

  hasAllowance(messageOrDomain) {
    const allowance = this.getAllowance(messageOrDomain);
    return (
      allowance.enabled &&
      Date.now() >
        allowance.lastPaymentAttempt +
          allowance.minSecondsIntervalPerPayment * 1000 &&
      allowance.spent < allowance.budget
    ); // (+ amount from message); // TODO: check actual amount from the message
  }

  updateAllowance(messageOrDomain, allowance) {
    const currentAllowance = this.getAllowance(messageOrDomain);
    return this.setAllowance(messageOrDomain, {
      ...currentAllowance,
      ...allowance,
    });
  }

  storePaymentAttempt(message) {
    const allowance = this.getAllowance(message);
    allowance.lastPaymentAttempt = Date.now();
    return this.setAllowance(message, allowance);
  }

  storePayment(message, paymentResponse) {
    const allowance = this.getAllowance(message);
    const { total_fees, total_amt } = paymentResponse.data.payment_route;
    allowance.spent =
      parseInt(allowance.spent) + parseInt(total_amt) + parseInt(total_fees); //TODO: review proper calculation
    allowance.lastPayment = Date.now();
    return this.setAllowance(message, allowance);
  }

  reset() {
    this.set({ allowances: {} });
  }
}

export default Allowances;
