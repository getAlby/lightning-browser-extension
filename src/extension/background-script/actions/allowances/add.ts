import type { MessageAllowanceAdd } from "~/types";

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
      lastPaymentAt: "0",
      createdAt: Date.now().toString(),
      lnurlAuth: "false",
      payments: [],
      paymentsAmount: 0,
      paymentsCount: 0,
      percentage: "0",
      tag: "",
      usedBudget: 0,
    });
  }
  await db.saveToStorage();

  return { data: { allowance } };
};

export default add;
