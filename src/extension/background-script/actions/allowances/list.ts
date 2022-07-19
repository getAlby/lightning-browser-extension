import db from "~/extension/background-script/db";
import type { MessageAllowanceList } from "~/types";

const list = async (message: MessageAllowanceList) => {
  const dbAllowances = await db.allowances
    .toCollection()
    .reverse()
    .sortBy("lastPaymentAt");

  const allowancePromises = dbAllowances.map(async (allowance) => {
    allowance.usedBudget = allowance.totalBudget - allowance.remainingBudget;

    allowance.percentage = (
      (allowance.usedBudget / allowance.totalBudget) *
      100
    ).toFixed(0);

    allowance.paymentsCount = await db.payments
      .where("host")
      .equalsIgnoreCase(allowance.host)
      .count();

    const payments = await db.payments
      .where("host")
      .equalsIgnoreCase(allowance.host)
      .reverse()
      .toArray();

    allowance.paymentsAmount = payments
      .map((payment) => {
        if (typeof payment.totalAmount === "string") {
          return parseInt(payment.totalAmount);
        }
        return payment.totalAmount;
      })
      .reduce((previous, current) => previous + current, 0);

    return allowance;
  });

  const allowances = await Promise.all(allowancePromises);

  return {
    data: {
      allowances,
    },
  };
};

export default list;
