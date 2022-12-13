import PubSub from "pubsub-js";
import utils from "~/common/lib/utils";
import type { MessageMakeInvoice, AuditLogEntryInvoiceDetails } from "~/types";
import { AuditLogEntryType } from "~/types";

import state from "../../state";

const makeInvoice = async (message: MessageMakeInvoice) => {
  PubSub.publish("ln.makeInvoice.start", message);

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

      const eventData: AuditLogEntryInvoiceDetails = {
        paymentRequest: response.data.paymentRequest,
        rHash: response.data.rHash,
        event: AuditLogEntryType.INVOICE,
      };

      PubSub.publish("makeInvoice.success", eventData);

      return response;
    } catch (e) {
      if (e instanceof Error) {
        return { error: e.message };
      }
      return { error: e };
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
