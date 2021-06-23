import db from "../../db";

const get = async (message, sender) => {
  const host = message.args.host;
  console.log(host);
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  console.log(allowance);
  if (allowance) {
    return {
      data: {
        name: allowance.name,
        host: allowance.host,
        enabled: allowance.enabled,
        totalBudget: allowance.totalBudget,
        remainingBudget: allowance.remainingBudget,
        createdAt: allowance.createdAt,
      },
    };
  } else {
    return { data: { enabled: false } };
  }
};

export default get;
