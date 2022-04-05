import { Message } from "../../../../types";

import utils from "../../../../common/lib/utils";

const makeInvoiceOrPrompt = async (message: Message) => {
  return makeInvoiceWithPrompt(message);
};

const makeInvoiceWithPrompt = async (message: Message) => {
  const amount = message.args.amount || message.args.defaultAmount;
  const memo = message.args.memo || message.args.defaultMemo;
  const amountDisabled = parseInt(message.args.amount as string) > 0;
  const memoDisabled = message.args.memo && message.args.memo !== "";
  // If amount is not defined yet, let the user generate an invoice with an amount field.
  try {
    const response = await utils.openPrompt({
      origin: message.origin,
      type: "makeInvoice",
      args: {
        amountDisabled,
        memoDisabled,
        invoiceAttributes: {
          amount,
          memo,
          minimumAmount: message.args.minimumAmount,
          maximumAmount: message.args.maximumAmount,
        },
      },
    });
    return response;
  } catch (e) {
    return { error: e instanceof Error ? e.message : e };
  }
};

export default makeInvoiceOrPrompt;
