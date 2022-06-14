import utils from "../../../../common/lib/utils";
import { Message } from "../../../../types";

const makeInvoiceOrPrompt = async (message: Message) => {
  // TODO: support to remember the prompt decision and allow auto-create invoices
  return makeInvoiceWithPrompt(message);
};

const makeInvoiceWithPrompt = async (message: Message) => {
  const amount = message.args.amount || message.args.defaultAmount;
  const memo = message.args.memo || message.args.defaultMemo;
  const amountEditable = !message.args.amount;
  const memoEditable = !message.args.memo || message.args.memo === "";
  // If amount is not defined yet, let the user generate an invoice with an amount field.
  try {
    const response = await utils.openPrompt({
      origin: message.origin,
      action: "makeInvoice",
      args: {
        amountEditable,
        memoEditable,
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
