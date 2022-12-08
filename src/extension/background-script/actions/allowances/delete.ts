import db from "~/extension/background-script/db";
import type { MessageAllowanceDelete } from "~/types";

const deleteAllowance = async (message: MessageAllowanceDelete) => {
  const id = message.args.id;

  if (!id) return { error: "id is missing" };
  const dbAllowance = await db.allowances.get({ id });
  await db.allowances.delete(id);

  // delete related permission
  await db.permissions.where({ allowanceId: id }).delete();

  if (dbAllowance) {
    await db.payments.where("host").equalsIgnoreCase(dbAllowance.host).delete();
  }

  await db.saveToStorage();

  return { data: true };
};

export default deleteAllowance;
