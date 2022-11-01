import { MessagePermissionGet, DbPermission } from "~/types";

import db from "../../db";

const getPermission = async (
  message: MessagePermissionGet
): Promise<{ data: DbPermission } | { error: string }> => {
  const { host, method } = message.args;

  const permission = await db.permissions
    .where("host")
    .equalsIgnoreCase(host) // or rather get by allowanceID?
    .and((p) => p.method === method)
    .first();

  if (!permission?.id) {
    return { error: "No permission found for this method" };
  }

  return { data: permission };
};

export default getPermission;
