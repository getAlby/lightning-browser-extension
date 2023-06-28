import { ConnectorTransaction } from "~/extension/background-script/connectors/connector.interface";
import state from "~/extension/background-script/state";
import type { DbPayment, MessagePaymentList, Transaction } from "~/types";

import db from "../../db";

const list = async (message: MessagePaymentList) => {
  const accountId = state.getState().currentAccountId;

  // TODO: Add pagination instead of limiting to 2121
  const limit = message?.args?.limit || 2121;

  const connector = await state.getState().getConnector();

  // get IndexDB payments
  const dbPayments = await db.payments
    .toCollection()
    .filter((p) => p.accountId === accountId)
    .limit(limit)
    .reverse()
    .sortBy("createdAt");

  try {
    const result = await connector.getTransactions();

    // map IndexDB payment data onto ConnectorTransaction
    const transactions: Transaction[] = result.data.transactions.map(
      (transaction: ConnectorTransaction) => {
        const dbPayment = dbPayments.find(
          (p: DbPayment) => p.preimage === transaction.preimage
        );

        // @Todo: map transactions correctly
        // @Todo: how to we use/map "title" and "description" and "memo"

        // @Todo: this comes from convertPaymentToTransaction function - remove there if this is right
        const title = dbPayment ? dbPayment.name || dbPayment.description : "";
        return {
          ...(dbPayment ? dbPayment : {}),
          id: dbPayment?.id || "",
          amount: transaction.value + "",
          totalFees: transaction.fee,
          description: transaction.memo,
          // @Todo: can we use converPaymentToTransaction's date: dayjs(+payment.createdAt).fromNow(), here?
          date: "",
          title,
        } as Transaction;
      }
    );

    return {
      data: {
        // @Todo: adapt property name
        payments: transactions,
      },
    };
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default list;
