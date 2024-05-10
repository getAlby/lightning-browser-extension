import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";

export async function isPermissionBlocked(method: string, host: string) {
  if (!host) {
    return false;
  }

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (!allowance?.id) {
    throw new Error("Could not find an allowance for this host");
  }

  const accountId = state.getState().currentAccountId;

  if (!accountId) {
    throw new Error("Account doesn't exist");
  }

  const findPermission = await db.permissions.get({
    host,
    method,
    accountId,
  });

  return !!findPermission?.blocked;
}
