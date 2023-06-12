import utils from "~/common/lib/utils";
import state from "~/extension/background-script/state";
import type { Invoice, MessageInvoices } from "~/types";

const invoices = async (message: MessageInvoices) => {
  const isSettled = message.args.isSettled;

  const connector = await state.getState().getConnector();
  try {
    const result = await connector.getInvoices();
    const invoices: Invoice[] = result.data.invoices
      .filter((invoice) => (isSettled ? invoice.settled : !invoice.settled))
      .map((invoice) => {
        const boostagram = utils.getBoostagramFromInvoiceCustomRecords(
          invoice.custom_records
        );
        const type = invoice.type;
        if (type !== "received" && type !== "incoming") {
          throw new Error("unexpected invoice type: " + type);
        }
        return { ...invoice, boostagram, type };
      });

    return {
      data: {
        invoices,
      },
    };
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default invoices;
