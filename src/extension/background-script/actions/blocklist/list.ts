import { MessageBlocklistList } from "~/types";

import db from "../../db";

const list = async (message: MessageBlocklistList) => {
  const blocklist = await db.blocklist.toArray();

  return {
    data: {
      blocklist,
    },
  };
};

export default list;
