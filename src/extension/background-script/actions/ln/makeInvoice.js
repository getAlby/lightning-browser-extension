import PubSub from "pubsub-js";
// import browser from "webextension-polyfill";
import utils from "~/common/lib/utils";

import state from "../../state";

const makeInvoice = async (message, sender) => {
  PubSub.publish(`ln.makeInvoice.start`, message);

  let amount;
  const memo = message.args.memo || message.args.defaultMemo || "Alby invoice";

  if (message.args.amount) {
    console.log("TRY IT - haz amount");

    amount = parseInt(message.args.amount);

    const connector = await state.getState().getConnector();
    // const connector = await browser.storage.sync.get("connector");
    console.log("TRY IT - getConnector?", connector);

    try {
      const response = await connector.makeInvoice({
        amount,
        memo,
      });

      return response;
    } catch (e) {
      return { error: e.message };
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
