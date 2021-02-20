import utils from "./../utils";
import { decryptData } from "./../crypto";
import Settings from "../settings";

class Base {
  constructor(connectorConfig) {
    // encrypted config from browser storage
    this.connectorConfig = connectorConfig;
    // placeholder for the unlocked config
    this.config = {};
    this.unlocked = false;
    this.settings = new Settings();
  }

  async init() {
    return this.settings.load();
  }

  unlock(message) {
    try {
      this.config = decryptData(
        this.connectorConfig,
        message.args.password,
        this.settings.salt
      );
      this.unlocked = true;
      return Promise.resolve({ data: { unlocked: this.unlocked } });
    } catch (e) {
      console.log({ action: "unlock", error: e });
      return Promise.resolve({ error: "Failed to decrypt" });
    }
  }

  lock() {
    this.config = {};
    this.unlocked = false;
  }

  isUnlocked(message) {
    return Promise.resolve({ data: { unlocked: this.unlocked } });
  }

  enable(message) {
    if (this.unlocked && this.settings.isEnabled(message.origin.domain)) {
      return Promise.resolve({ data: { enabled: true } });
    }
    return utils
      .openPrompt(message)
      .then((response) => {
        if (response.data.enabled) {
          this.settings.allowHost(message.origin.domain, response.data);
        }
        return response;
      })
      .catch((e) => {
        return { error: e.message };
      });
  }

  getAllowance(message) {
    const allowance = this.settings.getAllowance(message.args.domain);
    return Promise.resolve({ data: allowance });
  }

  setAllowance(message) {
    this.settings.allowHost(message.origin.domain, message.args);
    return Promise.resolve();
  }

  sendPayment(message, executor) {
    let promise;
    if (this.unlocked && this.settings.hasAllowance(message)) {
      promise = executor();
    } else {
      promise = utils.openPrompt(message).then((response) => {
        if (response.data.confirmed) {
          return executor();
        } else {
          return response;
        }
      });
    }
    return promise
      .then((paymentResponse) => {
        // TODO: maybe use better check?
        if (paymentResponse.data && paymentResponse.data.payment_error === "") {
          this.processPayment(message, paymentResponse);
          return paymentResponse;
        } else {
          return {
            error: paymentResponse.data && paymentResponse.data.payment_error,
          };
        }
      })
      .catch((e) => {
        return { error: e.message };
      });
  }

  processPayment(message, paymentResponse) {
    const route = paymentResponse.data.payment_route;
    const { total_amt } = route;
    const recipient = message.origin.name || message.origin.domain;
    this.settings.storePayment(message, paymentResponse);
    utils.notify({
      title: `Paid ${total_amt} Satoshi to ${recipient}`,
      message: `pre image: ${paymentResponse.data.payment_preimage}`,
    });
  }
}

export default Base;
