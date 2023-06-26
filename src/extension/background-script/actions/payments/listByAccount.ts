import { ConnectorTransaction } from "~/extension/background-script/connectors/connector.interface";
import state from "~/extension/background-script/state";
import type {
  DbPayment,
  MessagePaymentListByAccount,
  Transaction,
} from "~/types";

import db from "../../db";

// @Todo: renmae, due to fact that "byAccount" will be default

const listByAccount = async (message: MessagePaymentListByAccount) => {
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
      (connectorPayment: ConnectorTransaction) => {
        const dbPayment = dbPayments.find(
          (p: DbPayment) => p.preimage === connectorPayment.payment_preimage
        );
        // @Todo: map transactions correctly

        return {
          ...dbPayment,
          id: "",
          amount: connectorPayment.value + "",
          date: "",
          title: "",
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

export default listByAccount;
