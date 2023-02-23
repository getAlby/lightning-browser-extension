import type { MessagePaymentListByAccount } from "~/types";

import db from "../../db";

const listByAccount = async (message: MessagePaymentListByAccount) => {
  const { accountId } = message.args;
  const limit = message?.args?.limit || 2121;

  const payments = await db.payments
    .toCollection()
    .and((p) => p.accountId === accountId)
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
