import db from "~/extension/background-script/db";
import type { MessagePermissionsDisable } from "~/types";

const togglePermissions = async (message: MessagePermissionsDisable) => {
  const { ids } = message.args;

  for (const id of ids) {
    const permission = await db.permissions.get({ id });

    if (!permission) continue;

    await db.permissions.update(id, { enabled: !permission.enabled });
  }
  await db.saveToStorage();

  return { data: true };
};

export default togglePermissions;
