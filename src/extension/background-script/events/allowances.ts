import { getPaymentRequestAmountSats } from "~/common/utils/paymentRequest";
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

  // debit the same amount the allowance check was made against, so a connector
  // that rounds `route.total_amt` differently cannot leave the budget untouched.
  // keysends carry no invoice, so fall back to what the connector reports.
  const amountInSats =
    (data.paymentRequestDetails &&
      getPaymentRequestAmountSats(data.paymentRequestDetails)) ??
    paymentResponse.data.route.total_amt;

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (!allowance || !allowance.id) {
    return;
  }

  const remainingBudget = allowance.remainingBudget || 0; // remainingBudget might be blank
  const newRemaining = Math.max(remainingBudget - amountInSats, 0); // no negative values

  await db.allowances.update(allowance.id, {
    remainingBudget: newRemaining,
    lastPaymentAt: Date.now(),
  });
  await db.saveToStorage();
  return true;
};

export { updateAllowance };
