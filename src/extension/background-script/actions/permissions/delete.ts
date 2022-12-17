import type { MessagePermissionDelete } from "~/types";

import db from "../../db";

const deletePermission = async (message: MessagePermissionDelete) => {
  const { host, method } = message.args;

  const deleteCount = await db.permissions
    .where("host")
    .equalsIgnoreCase(host)
    .and((p) => p.method === method)
    .delete();

  await db.saveToStorage();

  return { data: !!deleteCount };
};

export default deletePermission;
