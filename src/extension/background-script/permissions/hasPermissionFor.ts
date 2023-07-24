import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";

export async function hasPermissionFor(method: string, host: string) {
  if (!host) {
    return false;
  }

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (!allowance?.id) {
    return Promise.reject(
      new Error("Could not find an allowance for this host")
    );
  }

  const accountId = state.getState().currentAccountId;

  if (!accountId) {
    return Promise.reject(new Error("Account doesn't exist"));
  }

  const findPermission = await db.permissions.get({
    host,
    method,
    accountId,
  });

  return !!findPermission?.enabled;
}
