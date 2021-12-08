import PubSub from "pubsub-js";
import state from "../../state";
import utils from "../../../../common/lib/utils";

const makeInvoice = async (message, sender) => {
  PubSub.publish(`ln.makeInvoice.start`, message);

  let amount;
  const memo = message.args.memo || message.args.defaultMemo || "Alby invoice";
  if (message.args.amount) {
    amount = parseInt(message.args.amount);
  } else {
    const response = await utils.openPrompt({
      ...message,
      type: "invoice",
      args: {
        invoiceAttributes: {
          ...message.args,
        },
      },
    });
    amount = parseInt(response.data);
  }

  const connector = state.getState().getConnector();
  const response = await connector.makeInvoice({
    amount,
    memo,
  });

  return response;
};

export default makeInvoice;
