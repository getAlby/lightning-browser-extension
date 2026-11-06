import { parseSatoshis } from "~/common/utils/helpers";

import utils from "../../../../common/lib/utils";
import { Message } from "../../../../types";

const makeInvoiceOrPrompt = async (message: Message) => {
  // TODO: support to remember the prompt decision and allow auto-create invoices
  return makeInvoiceWithPrompt(message);
};

const makeInvoiceWithPrompt = async (message: Message) => {
  const amountEditable = !message.args.amount;
  let amount = message.args.amount || message.args.defaultAmount;
  // A fixed amount is shown read-only in the prompt and used as-is for the
  // invoice, so it has to be a plain whole number of sats.
  if (!amountEditable) {
    amount = parseSatoshis(message.args.amount);
    if (!amount) {
      return { error: "Invalid amount." };
    }
  }
  const memo = message.args.memo || message.args.defaultMemo;
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
