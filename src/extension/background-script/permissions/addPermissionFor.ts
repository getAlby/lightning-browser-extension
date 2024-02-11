import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";

export async function addPermissionFor(
  method: string,
  host: string,
  metadata?: object
) {
  const accountId = state.getState().currentAccountId;
  const allowance = await db.allowances.get({
    host,
  });

  if (!allowance?.id || !accountId) {
    return false;
  }
  const permissionIsAdded = await db.permissions.add({
    createdAt: Date.now().toString(),
    accountId: accountId,
    allowanceId: allowance.id,
    host: host,
    method: method,
    enabled: true,
    blocked: false,
    metadata: metadata ? metadata : undefined,
  });

  return !!permissionIsAdded && (await db.saveToStorage());
}
