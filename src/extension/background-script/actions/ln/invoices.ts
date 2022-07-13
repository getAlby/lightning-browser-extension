import utils from "~/common/lib/utils";
import type { Invoice } from "~/extension/background-script/connectors/connector.interface";
import state from "~/extension/background-script/state";
import { MessageInvoices } from "~/types";

const invoices = async (message: MessageInvoices) => {
  const connector = await state.getState().getConnector();
  const data = await connector.getInvoices();

  if (data instanceof Error) {
    return { error: data.message };
  } else {
    const invoices: Invoice[] = data.data.invoices.map((invoice: Invoice) => {
      const boostagram = utils.getBoostagramFromInvoice(invoice.custom_records);
      return { ...invoice, boostagram };
    });

    return {
      data: {
        invoices,
      },
    };
  }
};

export default invoices;
