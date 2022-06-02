import PubSub from "pubsub-js";

import state from "../../state";
import checkPayment from "./checkPayment";
import getInfo from "./getInfo";
import keysend from "./keysend";
import makeInvoice from "./makeInvoice";
import sendPayment from "./sendPayment";
import signMessage from "./signMessage";
import verifyMessage from "./verifyMessage";

const connectorCall = (method) => {
  return async (message, sender) => {
    console.log(`Lightning call: ${message.type}`);
    const connector = await state.getState().getConnector();

    if (!connector) {
      // TODO: add unlock prompt
      return Promise.resolve({
        error: "Connector not available. Is the account unlocked?",
      });
    }

    PubSub.publish(`ln.${method}.start`, message);

    return connector[method]({
      args: message.args,
      origin: message.origin,
      type: method,
    });
  };
};

const getBalance = connectorCall("getBalance");
const getTransactions = connectorCall("getTransactions");

export {
  getInfo,
  getBalance,
  getTransactions,
  sendPayment,
  keysend,
  checkPayment,
  signMessage,
  makeInvoice,
  verifyMessage,
};
