import db from "../../db";

const deleteAllowance = async (message, sender) => {
  const id = message.args.id;
  await db.allowances.delete(id);
  await db.saveToStorage();
  return { data: true };
};

export default deleteAllowance;
