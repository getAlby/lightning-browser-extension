import db from "~/extension/background-script/db";
import type { MessagePermissionsList } from "~/types";

const listPermissions = async (message: MessagePermissionsList) => {
  const { id } = message.args;
  const permissions = await db.permissions
    .toCollection()
    .filter((permission) => permission.allowanceId === id)
    .toArray();

  return {
    data: {
      permissions,
    },
  };
};

export default listPermissions;
