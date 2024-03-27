import db from "~/extension/background-script/db";
import state from "~/extension/background-script/state";

export async function addPermissionFor(
  method: string,
  host: string,
  blocked: boolean
) {
  const accountId = state.getState().currentAccountId;
  const allowance = await db.allowances.get({
    host,
  });

  if (!allowance?.id || !accountId) {
    return false;
  }

  const existingPermission = await db.permissions
    .filter(
      (x) =>
        x.accountId === accountId &&
        x.allowanceId === allowance.id &&
        x.host === host &&
        x.method === method
    )
    .first();

  let affectedRows = 0;
  if (!existingPermission) {
    affectedRows = await db.permissions.add({
      createdAt: Date.now().toString(),
      accountId: accountId,
      allowanceId: allowance.id,
      host: host,
      method: method,
      enabled: true,
      blocked: blocked,
    });
  } else {
    affectedRows = await db.permissions.update(existingPermission.id!, {
      enabled: true,
      blocked: blocked,
    });
  }

  return !!affectedRows && (await db.saveToStorage());
}
