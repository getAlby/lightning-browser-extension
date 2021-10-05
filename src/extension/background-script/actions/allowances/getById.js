import db from "../../db";

const getById = async (message, sender) => {
  const { id } = message.args;
  const allowance = await db.allowances.get({ id });

  console.log(allowance);
  if (allowance) {
    allowance.usedBudget =
      parseInt(allowance.totalBudget) - parseInt(allowance.remainingBudget);
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

export default getById;
