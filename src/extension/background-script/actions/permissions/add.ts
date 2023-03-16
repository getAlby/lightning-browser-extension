import type { MessagePermissionAdd } from "~/types";

import db from "../../db";
import state from "../../state";

const addPermission = async (message: MessagePermissionAdd) => {
  const { host, method, enabled, blocked } = message.args;

  const accountId = state.getState().currentAccountId;
  const matchingAllowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (!matchingAllowance?.id) {
    return { error: "No Allowance set for this host" };
  }

  if (!accountId) {
    return { error: "No Account selected" };
  }

  const added = await db.permissions.add({
    createdAt: Date.now().toString(),
    allowanceId: matchingAllowance.id,
    accountId,
    host,
    method,
    enabled,
    blocked,
  });

  await db.saveToStorage();

  return { data: added };
};

export default addPermission;
