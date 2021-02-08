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

  sendPayment(message, executor) {
    if (!this.unlocked || !this.settings.isEnabled(message.origin.domain)) {
      return Promise.resolve({ error: "Not enabled" });
    }
    let promise;
    if (this.settings.hasAllowance(message.origin.domain)) {
      promise = executor();
    } else {
      promise = utils.openPrompt(message).then((response) => {
        if (response.data.confirmed) {
          this.settings.allowHost(message.origin.domain, response);
        }
        return executor();
      });
    }
    return promise
      .then((response) => {
        utils.notify({
          title: "Paid",
          message: `pre image: ${response.data.payment_preimage}`,
        });
        return response;
      })
      .catch((e) => {
        return { error: e.message };
      });
  }
}

export default Base;
