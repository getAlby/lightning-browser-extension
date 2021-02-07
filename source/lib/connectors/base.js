import utils from "./../utils";
import { decryptData } from "./../crypto";

class Base {
  constructor(connectorConfig, globalSettings) {
    // encrypted config from browser storage
    this.connectorConfig = connectorConfig;
    // placeholder for the unlocked config
    this.config = {};
    this.settings = globalSettings;
  }

  async init() {
    return Promise.resolve();
  }

  unlock(password) {
    this.config = decryptData(
      this.connectorConfig,
      password,
      this.settings.salt
    );
    this.unlocked = true;
  }

  lock() {
    this.config = {};
    this.unlocked = false;
  }

  enable(message) {
    if (this.unlocked && this.settings.isEnabled(message.origin.domain)) {
      return Promise.resolve({ data: { enabled: true } });
    }
    return utils
      .openPrompt(message)
      .then((response) => {
        return response;
      })
      .catch((e) => {
        return { error: e.message };
      });
  }

  sendPayment(message, executor) {
    return executor()
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
