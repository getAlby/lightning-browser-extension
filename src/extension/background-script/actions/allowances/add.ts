import type { MessageAllowanceAdd, DbAllowance } from "~/types";

import db from "../../db";

const add = async (message: MessageAllowanceAdd) => {
  const host = message.args.host;
  const name = message.args.name;
  const imageURL = message.args.imageURL;
  const totalBudget = message.args.totalBudget;

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (allowance) {
    if (!allowance.id) return { error: "id is missing" };

    // persist budget-event?

    await db.allowances.update(allowance.id, {
      enabled: true,
      imageURL: imageURL,
      name: name,
      remainingBudget: totalBudget,
      totalBudget: totalBudget,
    });
  } else {
    const dbAllowance: DbAllowance = {
      createdAt: Date.now().toString(),
      enabled: true,
      host: host,
      imageURL: imageURL,
      lastPaymentAt: 0,
      lnurlAuth: false,
      name: name,
      remainingBudget: totalBudget,
      tag: "",
      totalBudget: totalBudget,
    };

    // persist budget-event?

    await db.allowances.add(dbAllowance);
  }
  await db.saveToStorage();

  return { data: { allowance } };
};

export default add;
