import utils from "~/common/lib/utils";
import { ConnectorTransaction } from "~/extension/background-script/connectors/connector.interface";
import state from "~/extension/background-script/state";
import { MessageGetTransactions } from "~/types";

const getTransactions = async (message: MessageGetTransactions) => {
  const limit = message.args.limit;

  const connector = await state.getState().getConnector();
  try {
    const result = await connector.getTransactions();

    let transactions: ConnectorTransaction[] = result.data.transactions
      .filter((transaction) => transaction.settled)
      .map((transaction) => {
        const boostagram = utils.getBoostagramFromInvoiceCustomRecords(
          transaction.custom_records
        );
        return {
          ...transaction,
          boostagram,
          paymentHash: transaction.payment_hash,
        };
      });

    if (limit) {
      transactions = transactions.slice(0, limit);
    }

    return {
      data: {
        transactions,
      },
    };
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default getTransactions;
