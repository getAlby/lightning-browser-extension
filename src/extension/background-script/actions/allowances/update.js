import db from "../../db";

const updateAllowance = async (message, sender) => {
  const id = message.args.id;

  const update = {};
  if (Object.prototype.hasOwnProperty.call(message.args, "totalBudget")) {
    update.totalBudget = parseInt(message.args.totalBudget);
    update.remainingBudget = parseInt(message.args.totalBudget);
  }
  if (Object.prototype.hasOwnProperty.call(message.args, "enabled")) {
    update.enabled = message.args.enabled;
  }

  const updated = await db.allowances.update(id, update);
  await db.saveToStorage();
  return { data: updated };
};

export default updateAllowance;
