import db from "../../db";

const getById = async (message, sender) => {
  const { id } = message.args;
  const allowance = await db.allowances.get({ id });

  console.log(allowance);
  if (allowance) {
    allowance.payments = await db.payments
      .where("host")
      .equalsIgnoreCase(allowance.host)
      .toArray();

    return {
      data: allowance,
    };
  } else {
    return { data: { enabled: false } };
  }
};

export default getById;
