import db from "../../db";

const list = async (message, sender) => {
  // TODO add filter and ordering?
  let blocklist = await db.blocklist
    .toCollection()
    .reverse()
    .sortBy("lastPaymentAt");

  const blocklistPromises = blocklist.map(async (site) => {
    return site;
  });

  blocklist = await Promise.all(blocklistPromises);
  return {
    data: {
      blocklist,
    },
  };
};

export default list;
