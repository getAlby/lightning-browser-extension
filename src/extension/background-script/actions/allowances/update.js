import db from "../../db";

const updateAllowance = async (message, sender) => {
  const id = parseInt(message.args.id);

  console.log(message.args);
  const update = {};
  if (message.args.hasOwnProperty("totalBudget")) {
    update.totalBudget = parseInt(message.args.totalBudget);
    update.remainingBudget = parseInt(message.args.totalBudget);
  }
  if (message.args.hasOwnProperty("enabled")) {
    update.enabled = message.args.enabled;
  }

  const updated = await db.allowances.update(id, update);
  await db.saveToStorage();
  return { data: updated };
};

export default updateAllowance;
