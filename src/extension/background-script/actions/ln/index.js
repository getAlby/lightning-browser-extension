import state from "../../state";

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

    return connector[method]({
      args: message.args,
      origin: message.origin,
      type: method,
    });
  };
};

const getInfo = connectorCall("getInfo");
const getBalance = connectorCall("getBalance");
const getTransactions = connectorCall("getTransactions");

export { getInfo, getBalance, getTransactions };
