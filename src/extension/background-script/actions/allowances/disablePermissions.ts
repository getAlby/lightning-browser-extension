import db from "~/extension/background-script/db";
import type { MessagePermissionsDisable } from "~/types";

const disablePermissions = async (message: MessagePermissionsDisable) => {
  const { ids } = message.args;

  for (const id of ids) {
    await db.permissions.update(id, { enabled: false });
  }
  await db.saveToStorage();

  return { data: true };
};

export default disablePermissions;
