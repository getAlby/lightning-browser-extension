import PubSub from "pubsub-js";
import utils from "~/common/lib/utils";
import { MessageMakeInvoice } from "~/types";

import state from "../../state";

const makeInvoice = async (message: MessageMakeInvoice) => {
  PubSub.publish(`ln.makeInvoice.start`, message);

  let amount;
  const memo = message.args.memo || message.args.defaultMemo || "Alby invoice";

  if (message.args.amount) {
    amount = parseInt(message.args.amount);
    const connector = await state.getState().getConnector();

    try {
      const response = await connector.makeInvoice({
        amount,
        memo,
      });

      return response;
    } catch (e) {
      if (e instanceof Error) {
        return { error: e.message };
      }
    }
  } else {
    // If amount is not defined yet, let the user generate an invoice with an amount field.
    return await utils.openPrompt({
      ...message,
      action: "makeInvoice",
      args: {
        invoiceAttributes: {
          ...message.args,
        },
      },
    });
  }
};

export default makeInvoice;
