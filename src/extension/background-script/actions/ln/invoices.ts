import utils from "~/common/lib/utils";
import state from "~/extension/background-script/state";
import type { Invoice, MessageInvoices } from "~/types";

const invoices = async (message: MessageInvoices) => {
  const isSettled = message.args.isSettled;
  const limit = message.args.limit;

  const connector = await state.getState().getConnector();
  try {
    const result = await connector.getInvoices();
    let invoices: Invoice[] = result.data.invoices
      .filter((invoice) => (isSettled ? invoice.settled : !invoice.settled))

      .map((invoice: Invoice) => {
        const boostagram = utils.getBoostagramFromInvoiceCustomRecords(
          invoice.custom_records
        );
        return { ...invoice, boostagram };
      });

    if (limit) {
      invoices = invoices.slice(0, limit);
    }

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
