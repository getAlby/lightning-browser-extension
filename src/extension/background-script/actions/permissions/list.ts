import db from "~/extension/background-script/db";
import type { MessagePermissionsList, Permission } from "~/types";

const listByAllowance = async (message: MessagePermissionsList) => {
  const { id, accountId } = message.args;

  if (!accountId) {
    return {
      error: "Missing account id to fetch permissions.",
    };
  }

  const dbPermissions = await db.permissions
    .where({ allowanceId: id, accountId })
    .toArray();

  const permissions: Permission[] = [];

  for (const dbPermission of dbPermissions) {
    if (dbPermission.id) {
      const { id } = dbPermission;
      const tmpPermission: Permission = {
        ...dbPermission,
        id,
      };

      permissions.push(tmpPermission);
    }
  }

  return {
    data: {
      permissions,
    },
  };
};

export default listByAllowance;
