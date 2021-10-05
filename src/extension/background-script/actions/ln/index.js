import PubSub from "pubsub-js";
import state from "../../state";
import sendPayment from "./sendPayment";
import signMessage from "./signMessage";
import getInfo from "./getInfo";
import makeInvoice from "./makeInvoice";
import verifyMessage from "./verifyMessage";

const connectorCall = (method) => {
  return (message, sender) => {
    console.log(`Lightning call: ${message.type}`);
    const connector = state.getState().getConnector();

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
  signMessage,
  makeInvoice,
  verifyMessage,
};
