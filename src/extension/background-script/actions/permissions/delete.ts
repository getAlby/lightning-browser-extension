import type { MessagePermissionDelete } from "~/types";

import db from "../../db";

const deletePermission = async (message: MessagePermissionDelete) => {
  const { host, method } = message.args;

  const matchingAllowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (!matchingAllowance?.id) {
    return { error: "No Allowance set for this host" };
  }

  // remove request method from allowance permissions
  const formerPermissions = matchingAllowance.permissions || []; // fallback needed for migration
  const removedPermission = formerPermissions.filter((p) => p !== method);

  await db.allowances.update(matchingAllowance.id, {
    permissions: removedPermission,
  });

  // delete permission
  const deleteCount = await db.permissions
    .where("host")
    .equalsIgnoreCase(host)
    .and((p) => p.method === method)
    .delete();

  await db.saveToStorage();

  return { data: !!deleteCount };
};

export default deletePermission;
