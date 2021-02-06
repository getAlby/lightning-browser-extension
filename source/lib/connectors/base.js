import memoizee from "memoizee";
import utils from "./../utils";

class Base {
  constructor(connectorConfig, globalSettings) {
    this.config = connectorConfig;
    this.settings = globalSettings;
  }

  async init() {
    return Promise.resolve();
  }

  enable(message) {
    if (this.settings.isEnabled(message.origin.domain)) {
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
