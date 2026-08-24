import type { PaymentNotificationData } from "~/types";

import db from "../db";

const updateAllowance = async (
  message: "ln.sendPayment.success" | "ln.keysend.success",
  data: PaymentNotificationData
) => {
  if (!data.origin || !data.origin.host) {
    return;
  }

  // Payments authorised against a budget take their amount out of it before
  // they are sent, so there is nothing left to debit here.
  if (data.budgetReserved) {
    return;
  }

  const host = data.origin.host;
  const paymentResponse = data.response;

  if ("error" in paymentResponse) {
    return;
  }

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (!allowance || !allowance.id) {
    return;
  }

  const totalAmt = paymentResponse.data.route?.total_amt;

  // Some connectors settle a payment without reporting a route (LNDHub keysend
  // returns no payment_route). The amount that just left the wallet is then
  // unknown, so there is no honest number to subtract. Stop the allowance from
  // authorising anything else rather than leaving the budget as it was.
  if (typeof totalAmt !== "number" || !Number.isFinite(totalAmt)) {
    console.error(
      `Payment for ${host} settled without a usable route; clearing the remaining budget`
    );
    await db.allowances.update(allowance.id, {
      remainingBudget: 0,
      lastPaymentAt: Date.now(),
    });
    await db.saveToStorage();
    return true;
  }

  const remainingBudget = allowance.remainingBudget || 0; // remainingBudget might be blank
  const newRemaining = Math.max(remainingBudget - totalAmt, 0); // no negative values

  await db.allowances.update(allowance.id, {
    remainingBudget: newRemaining,
    lastPaymentAt: Date.now(),
  });
  await db.saveToStorage();
  return true;
};

export { updateAllowance };
