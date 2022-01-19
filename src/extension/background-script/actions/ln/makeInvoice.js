import PubSub from "pubsub-js";
import state from "../../state";
import utils from "../../../../common/lib/utils";

const makeInvoice = async (message, sender) => {
  PubSub.publish(`ln.makeInvoice.start`, message);

  let amount;
  const memo = message.args.memo || message.args.defaultMemo || "Alby invoice";

  if (message.args.amount) {
    amount = parseInt(message.args.amount);

    const connector = await state.getState().getConnector();
    const response = await connector.makeInvoice({
      amount,
      memo,
    });

    return response;
  } else {
    // If amount is not defined yet, let the user generate an invoice with an amount field.
    return await utils.openPrompt({
      ...message,
      type: "makeInvoice",
      args: {
        invoiceAttributes: {
          ...message.args,
        },
      },
    });
  }
};

export default makeInvoice;
