import PubSub from "pubsub-js";
import state from "../../state";

const makeInvoice = async (message, sender) => {
  PubSub.publish(`ln.makeInvoice.start`, message);

  const amount = parseInt(message.args.amount);
  const memo = message.args.memo || message.args.defaultMemo || "Alby invoice";

  const connector = state.getState().getConnector();
  const response = await connector.makeInvoice({
    amount,
    memo,
  });

  return response;
};

export default makeInvoice;
