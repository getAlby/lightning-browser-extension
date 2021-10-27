import db from "../../db";

const add = async (message, sender) => {
  const host = message.args.host;
  const name = message.args.name;
  const imageURL = message.args.imageURL;
  const totalBudget = message.args.totalBudget;

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (allowance) {
    await db.allowances.update(allowance.id, {
      name: name,
      imageURL: imageURL,
      enabled: true,
      totalBudget: totalBudget,
      remainingBudget: totalBudget,
    });
  } else {
    await db.allowances.add({
      host: host,
      name: name,
      imageURL: imageURL,
      enabled: true,
      totalBudget: totalBudget,
      remainingBudget: totalBudget,
      lastPaymentAt: 0,
    });
  }
  await db.saveToStorage();

  return { data: { allowance } };
};

export default add;
