import db from "~/extension/background-script/db";
import type { MessageAllowanceGet } from "~/types";

const get = async (message: MessageAllowanceGet) => {
  const host = message.args.host;
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (allowance) {
    allowance.usedBudget = allowance.totalBudget - allowance.remainingBudget;
    allowance.percentage = (
      (allowance.usedBudget / allowance.totalBudget) *
      100
    ).toFixed(0);

    allowance.paymentsCount = await db.payments
      .where("host")
      .equalsIgnoreCase(allowance.host)
      .count();
    allowance.payments = await db.payments
      .where("host")
      .equalsIgnoreCase(allowance.host)
      .reverse()
      .toArray();

    return {
      data: allowance,
    };
  } else {
    return { data: { enabled: false } };
  }
};

export default get;
