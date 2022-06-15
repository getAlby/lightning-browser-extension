import { MessageBlocklistDelete } from "~/types";

import db from "../../db";

const get = async (
  message: MessageBlocklistDelete
): Promise<{ data: { blocked: boolean } }> => {
  const host = message.args.host;
  const isBlocked = await db.blocklist
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (isBlocked) {
    return { data: { blocked: true } };
  } else {
    return { data: { blocked: false } };
  }
};

export default get;
