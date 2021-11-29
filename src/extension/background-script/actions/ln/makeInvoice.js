import PubSub from "pubsub-js";
import state from "../../state";

const makeInvoice = async (message, sender) => {
  const memo = memo.args.memo || memo.args.defaultMemo || "Alby invoice memo";
  message.args.memo = memo;
  PubSub.publish(`ln.makeInvoice.start`, message);

  const amount = parseInt(message.args.amount);

  const connector = state.getState().getConnector();
  const response = await connector.makeInvoice({
    amount,
    memo,
  });

  return response;
};

export default makeInvoice;
