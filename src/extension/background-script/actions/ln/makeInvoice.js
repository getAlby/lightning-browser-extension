import PubSub from "pubsub-js";
import state from "../../state";

const makeInvoice = async (message, sender) => {
  if (message.args.memo === undefined) {
    message.args.memo = "Alby invoice memo";
  }
  PubSub.publish(`ln.makeInvoice.start`, message);

  const connector = state.getState().getConnector();
  const response = await connector.makeInvoice({
    amount: message.args.amount,
    memo: message.args.memo,
  });

  return response;
};

export default makeInvoice;
