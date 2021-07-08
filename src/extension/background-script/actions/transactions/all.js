import db from "../../db";

const all = async (message, sender) => {
  // TODO load transactions from the node and merge it
  // with the payments data stored locally
  let transactions = await db.payments
    .toCollection()
    .reverse()
    .sortBy("createdAt");

  return {
    data: {
      transactions,
    },
  };
};

export default all;
