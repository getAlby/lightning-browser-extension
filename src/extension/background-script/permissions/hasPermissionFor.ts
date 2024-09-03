import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function hasPermissionFor(method: string, host: string) {
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

  await delay(1000);

  const findPermission = await db.permissions.get({
    host,
    method,
    accountId,
  });

  return !!findPermission?.enabled;
}
