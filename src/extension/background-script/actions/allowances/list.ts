import db from "~/extension/background-script/db";
import type { MessageAllowanceList, Allowance } from "~/types";

const list = async (message: MessageAllowanceList) => {
  const { accountId } = message.args || {};
  let allowanceQuery;
  if (accountId) {
    allowanceQuery = db.allowances
      .where("accountId")
      .equalsIgnoreCase(accountId);
  } else {
    allowanceQuery = await db.allowances.toCollection();
  }

  const dbAllowances = await allowanceQuery.reverse().sortBy("lastPaymentAt");

  const allowances: Allowance[] = [];

  for (const dbAllowance of dbAllowances) {
    if (dbAllowance.id) {
      const { id } = dbAllowance;
      const tmpAllowance: Allowance = {
        ...dbAllowance,
        id,
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

      allowances.push(tmpAllowance);
    }
  }

  return {
    data: {
      allowances,
    },
  };
};

export default list;
