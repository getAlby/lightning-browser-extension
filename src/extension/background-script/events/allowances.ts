import { getPaymentRequestAmountSats } from "~/common/utils/paymentRequest";
import type { PaymentNotificationData } from "~/types";

import db from "../db";

function usableAmount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

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

  // Some connectors settle a payment without reporting a route (LNDHub keysend
  // returns no payment_route). Fall back to the amount that was authorised, and
  // only when even that is unknown stop the allowance from authorising anything
  // else - leaving the budget untouched would let the next payment reuse it.
  const amountSpent =
    usableAmount(paymentResponse.data.route?.total_amt) ??
    usableAmount(data.details.amount) ??
    usableAmount(
      data.paymentRequestDetails
        ? getPaymentRequestAmountSats(data.paymentRequestDetails)
        : null
    );

  if (amountSpent === null) {
    console.error(
      `Payment for ${host} settled without a usable amount; clearing the remaining budget`
    );
    await db.allowances.update(allowance.id, {
      remainingBudget: 0,
      lastPaymentAt: Date.now(),
    });
    await db.saveToStorage();
    return true;
  }

  const remainingBudget = allowance.remainingBudget || 0; // remainingBudget might be blank
  const newRemaining = Math.max(remainingBudget - amountSpent, 0); // no negative values

  await db.allowances.update(allowance.id, {
    remainingBudget: newRemaining,
    lastPaymentAt: Date.now(),
  });
  await db.saveToStorage();
  return true;
};

export { updateAllowance };
