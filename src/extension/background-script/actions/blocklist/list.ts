import { Blocklist } from "../../../../types";
import db from "../../db";

const list = async () => {
  let blocklist = await db.blocklist
    .toCollection()
    .reverse()
    .sortBy("createdAt");

  const blocklistPromises = blocklist.map(async (site: Blocklist) => {
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
