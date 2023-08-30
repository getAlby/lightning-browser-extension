import db from "~/extension/background-script/db";
import type { Allowance, MessageAllowanceGet, Payment } from "~/types";

const get = async (message: MessageAllowanceGet) => {
  const host = message.args.host;
  const dbAllowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (dbAllowance && dbAllowance.id) {
    const { id } = dbAllowance;
    const allowance: Allowance = {
      ...dbAllowance,
      id,
      payments: [],
      paymentsAmount: 0,
      paymentsCount: 0,
      percentage: 0,
      usedBudget: 0,
    };

    allowance.usedBudget =
      dbAllowance.totalBudget - dbAllowance.remainingBudget;

    allowance.percentage = dbAllowance.totalBudget
      ? (allowance.usedBudget / dbAllowance.totalBudget) * 100
      : 0;

    allowance.paymentsCount = await db.payments
      .where("host")
      .equalsIgnoreCase(dbAllowance.host)
      .count();

    const dbPayments = await db.payments
      .where("host")
      .equalsIgnoreCase(dbAllowance.host)
      .reverse()
      .toArray();

    allowance.payments = dbPayments.reduce<Payment[]>((acc, dbPayment) => {
      if (!dbPayment?.id) return acc;
      const { id } = dbPayment;
      acc.push({ ...dbPayment, id });
      return acc;
    }, []);

    allowance.paymentsAmount = allowance.payments
      .map((payment) => {
        if (typeof payment.totalAmount === "string") {
          return parseInt(payment.totalAmount);
        }
        return payment.totalAmount;
      })
      .reduce((previous, current) => previous + current, 0);

    return {
      data: allowance,
    };
  } else {
    return { data: { enabled: false } };
  }
};

export default get;
