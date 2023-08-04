import type { MessagePaymentListByAccount } from "~/types";

import db from "../../db";

const listByAccount = async (message: MessagePaymentListByAccount) => {
  const { accountId } = message.args;
  // TODO: Add pagination instead of limiting to 2121
  const limit = message?.args?.limit || 2121;

  const payments = await db.payments
    .toCollection()
    .filter((p) => p.accountId === accountId)
    .limit(limit)
    .reverse()
    .sortBy("createdAt");

  return {
    data: {
      payments,
    },
  };
};

export default listByAccount;
