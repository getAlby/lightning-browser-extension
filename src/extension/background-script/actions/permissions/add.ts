import type { MessagePermissionAdd } from "~/types";

import db from "../../db";

const addPermission = async (message: MessagePermissionAdd) => {
  const { host, method, enabled, blocked } = message.args;

  const matchingAllowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (!matchingAllowance?.id) {
    return { error: "No Allowance set for this host" };
  }

  // check if permissions exist or add fallback, needed for migrations
  const formerPermissions = matchingAllowance.permissions || [];
  const newPermissions = [...formerPermissions, method];
  const uniquePermissions = [...new Set(newPermissions)]; // remove dublicates

  // add new request method to allowance permissions
  await db.allowances.update(matchingAllowance.id, {
    permissions: uniquePermissions,
  });

  const added = await db.permissions.add({
    createdAt: Date.now().toString(),
    allowanceId: matchingAllowance.id,
    host,
    method,
    enabled,
    blocked,
  });

  await db.saveToStorage();

  return { data: added };
};

export default addPermission;
