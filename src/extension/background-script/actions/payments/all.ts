import type { MessagePaymentAll } from "~/types";

import db from "../../db";

const all = async (message: MessagePaymentAll) => {
  const limit = message?.args?.limit || 2121;

  const payments = await db.payments
    .toCollection()
    .limit(limit)
    .reverse()
    .sortBy("createdAt");

  return {
    data: {
      payments,
    },
  };
};

export default all;
