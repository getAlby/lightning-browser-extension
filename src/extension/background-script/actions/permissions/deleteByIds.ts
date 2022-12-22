import db from "~/extension/background-script/db";
import type { MessagePermissionsDelete } from "~/types";

const deleteByIds = async (message: MessagePermissionsDelete) => {
  const { ids } = message.args;

  await db.permissions.bulkDelete(ids);
  await db.saveToStorage();

  return { data: true };
};

export default deleteByIds;
