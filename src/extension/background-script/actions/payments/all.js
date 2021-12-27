import db from "../../db";

const all = async (message, sender) => {
  // TODO load transactions from the node and merge it
  // with the payments data stored locally
  const limit = message.args.limit || 2121; // TODO: add pagination
  let payments = await db.payments
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
