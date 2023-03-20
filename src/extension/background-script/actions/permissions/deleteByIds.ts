import db from "~/extension/background-script/db";
import type { MessagePermissionsDelete } from "~/types";

const deleteByIds = async (message: MessagePermissionsDelete) => {
  const { ids, accountId } = message.args;

  if (!accountId) {
    return {
      error: "Missing account id to delete permission(s).",
    };
  }

  await db.permissions
    .where("id")
    .anyOf(ids)
    .and((p) => p.accountId === accountId)
    .delete();
  await db.saveToStorage();

  return { data: true };
};

export default deleteByIds;
