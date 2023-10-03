import utils from "~/common/lib/utils";
import state from "~/extension/background-script/state";
import type { Invoice, MessageTransactions } from "~/types";

const transactions = async (message: MessageTransactions) => {
  const isSettled = message.args.isSettled;
  const limit = message.args.limit;

  const connector = await state.getState().getConnector();
  try {
    const result = await connector.getTransactions();
    let invoices: Invoice[] = result.data.transactions
      .filter((invoice) => (isSettled ? invoice.settled : !invoice.settled))
      .map((invoice) => {
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

export default transactions;
