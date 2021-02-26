import OptionsSync from "webext-options-sync";
import utils from "./utils";

const INITIAL_ALLOWANCE = {
  isEnabled: false,
  budget: 0,
  lastPayment: 0,
  lastPaymentAttempt: 0,
};

class Allowances {
  constructor() {
    this.allowanceStorage = new OptionsSync({
      storageName: "allowances",
    });
  }

  load() {
    return this.allowanceStorage.getAll().then((allowances) => {
      this.allowances = allowances;
    });
  }

  isEnabled(domain) {
    const allowance = this.getAllowance(domain);
    return allowance.isEnabled;
  }

  enable(messageOrDomain) {
    const allowance = this.getAllowance(messageOrDomain);
    allowance.isEnabled = true;
    this.updateAllowance(messageOrDomain, allowance);
  }

  getAllowance(messageOrDomain) {
    const hash = this.getAllowanceKey(messageOrDomain);
    const allowance = this.allowances[hash] || INITIAL_ALLOWANCE;
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
    return this.allowanceStorage.set({ [hash]: null }).then(() => {
      return this.load();
    });
  }

  setAllowance(messageOrDomain, allowance) {
    const hash = this.getAllowanceKey(messageOrDomain);
    const domain = this.getDomain(messageOrDomain);
    const update = { [hash]: { ...INITIAL_ALLOWANCE, domain, ...allowance } };
    // save new allowance and update allowances cache(this.allowances)
    return this.allowanceStorage.set(update).then(() => {
      return this.load();
    });
  }

  hasAllowance(messageOrDomain) {
    const allowance = this.getAllowance(messageOrDomain);
    return allowance.isEnabled && allowance.budget > 0; // TODO: check actual amount from the message
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
    allowance.budget = Math.max(allowance.budget - total_amt - total_fees, 0); // do not save negative values
    allowance.lastPayment = Date.now();
    return this.setAllowance(message, allowance);
  }
}

export default Allowances;
