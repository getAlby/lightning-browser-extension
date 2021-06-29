import db from "../../db";

const list = async (message, sender) => {
  // TODO add filter and ordering?
  let allowances = await db.allowances.toArray();

  const allowancePromises = allowances.map(async (allowance) => {
    const totalBudget = allowance.totalBudget || 0;
    const remainingBudget = allowance.remainingBudget || 0;

    if (remainingBudget > 0) {
      allowance.percentage = (
        (allowance.remainingBudget / allowance.totalBudget) *
        100
      ).toFixed(0);

      allowance.usedBudget = allowance.totalBudget - allowance.remainingBudget;
    }
    allowance.paymentsCount = await db.payments
      .where("host")
      .equalsIgnoreCase(allowance.host)
      .count();

    return allowance;
  });

  allowances = await Promise.all(allowancePromises);
  console.log(allowances);
  return {
    data: {
      allowances,
    },
  };
};

export default list;
