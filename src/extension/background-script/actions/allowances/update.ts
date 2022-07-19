import db from "~/extension/background-script/db";
import type { MessageAllowanceUpdate } from "~/types";

const updateAllowance = async (message: MessageAllowanceUpdate) => {
  const id = message.args.id;

  const update: {
    totalBudget?: number;
    remainingBudget?: number;
    enabled?: boolean;
  } = {};
  if (Object.prototype.hasOwnProperty.call(message.args, "totalBudget")) {
    update.totalBudget = message.args.totalBudget;
    update.remainingBudget = message.args.totalBudget;
  }
  if (Object.prototype.hasOwnProperty.call(message.args, "enabled")) {
    update.enabled = message.args.enabled;
  }

  const updated = await db.allowances.update(id, update);
  await db.saveToStorage();
  return { data: updated };
};

export default updateAllowance;
