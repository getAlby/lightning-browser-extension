import state from "~/extension/background-script/state";
import { MessageInvoices } from "~/types";

const invoices = async (message: MessageInvoices) => {
  const connector = await state.getState().getConnector();
  const data = await connector.getInvoices();

  if (data instanceof Error) {
    return { error: data.message };
  } else {
    return {
      data: {
        invoices: data.data.invoices,
      },
    };
  }
};

export default invoices;
