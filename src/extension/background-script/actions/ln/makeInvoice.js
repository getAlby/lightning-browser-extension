import PubSub from "pubsub-js";
import state from "../../state";

const makeInvoice = async (message, sender) => {
  if (message.args.memo === undefined) {
    message.args.memo = "Alby invoice memo";
  }
  PubSub.publish(`ln.makeInvoice.start`, message);

  const amount = parseInt(message.args.amount);
  const memo = message.args.memo;

  const connector = state.getState().getConnector();
  const response = await connector.makeInvoice({
    amount,
    memo,
  });

  return response;
};

export default makeInvoice;
