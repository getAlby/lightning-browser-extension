import db from "~/extension/background-script/db";
import type { MessageAllowanceList, Allowance } from "~/types";

const list = async (message: MessageAllowanceList) => {
  const dbAllowances = await db.allowances
    .toCollection()
    .reverse()
    .sortBy("lastPaymentAt");

  const allowancePromises = dbAllowances.map(async (allowance) => {
    const tmpAllowance: Allowance = {
      ...allowance,
      payments: [],
      paymentsAmount: 0,
      paymentsCount: 0,
      percentage: "0",
      usedBudget: 0,
    };

    tmpAllowance.usedBudget =
      tmpAllowance.totalBudget - tmpAllowance.remainingBudget;

    tmpAllowance.percentage = (
      (tmpAllowance.usedBudget / tmpAllowance.totalBudget) *
      100
    ).toFixed(0);

    tmpAllowance.paymentsCount = await db.payments
      .where("host")
      .equalsIgnoreCase(tmpAllowance.host)
      .count();

    const payments = await db.payments
      .where("host")
      .equalsIgnoreCase(tmpAllowance.host)
      .reverse()
      .toArray();

    tmpAllowance.paymentsAmount = payments
      .map((payment) => {
        if (typeof payment.totalAmount === "string") {
          return parseInt(payment.totalAmount);
        }
        return payment.totalAmount;
      })
      .reduce((previous, current) => previous + current, 0);

    return tmpAllowance;
  });

  const allowances: Allowance[] = await Promise.all(allowancePromises);

  return {
    data: {
      allowances,
    },
  };
};

export default list;
