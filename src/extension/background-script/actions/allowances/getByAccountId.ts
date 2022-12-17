import { MessageAllowanceCountByAccount } from "../../../../types";
import db from "../../db";

const getByAccountId = async (message: MessageAllowanceCountByAccount) => {
  const { accountId } = message.args;
  let count = 0;
  if (accountId) {
    count = await db.allowances
      .where("accountId")
      .equalsIgnoreCase(accountId)
      .count();
  }

  return { data: { count } };
};

export default getByAccountId;
