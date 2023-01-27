import type { MessageBlocklistAdd } from "~/types";

import db from "../../db";

const add = async (message: MessageBlocklistAdd) => {
  const { host, name, imageURL } = message.args;

  await db.blocklist.add({
    host,
    name,
    imageURL,
    isBlocked: true,
  });

  await db.saveToStorage();

  return { data: true };
};

export default add;
