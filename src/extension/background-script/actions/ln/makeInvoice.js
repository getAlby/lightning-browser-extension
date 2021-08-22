import PubSub from "pubsub-js";
import state from "../../state";

const makeInvoice = async (message, sender) => {
  PubSub.publish(`ln.makeInvoice.start`, message);

  const connector = state.getState().getConnector();
  const response = await connector.makeInvoice({
    amount: message.args.amount,
    memo: message.args.memo,
  });

  console.log(response);
  return response;
};

export default makeInvoice;
