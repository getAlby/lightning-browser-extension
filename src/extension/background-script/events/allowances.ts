import type { PaymentNotificationData } from "~/types";

import db from "../db";

const updateAllowance = async (
  message: "ln.sendPayment.success" | "ln.keysend.success",
  data: PaymentNotificationData
) => {
  if (!data.origin || !data.origin.host) {
    return;
  }

  const host = data.origin.host;
  const paymentResponse = data.response;

  if ("error" in paymentResponse) {
    return;
  }

  const route = paymentResponse.data.route;
  const { total_amt } = route;

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (!allowance || !allowance.id) {
    return;
  }

  const remainingBudget = allowance.remainingBudget || 0; // remainingBudget might be blank
  const newRemaining = Math.max(remainingBudget - total_amt, 0); // no negative values

  await db.allowances.update(allowance.id, {
    remainingBudget: newRemaining,
    lastPaymentAt: Date.now(),
  });
  await db.saveToStorage();
  return true;
};

export { updateAllowance };
