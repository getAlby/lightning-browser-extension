import PubSub from "pubsub-js";
import db from "../db";

const success = async (message, data) => {
  const host = data.origin.host;
  const paymentResponse = data.response;
  const route = paymentResponse.data.payment_route;
  const { total_amt } = route;

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (!allowance) {
    return;
  }

  const remainingBudget = allowance.remainingBudget || allowance.totalBudget || 0; // remainingBudget might be blank
  const newRemaining = remainingBudget - total_amt;

  await db.allowances.update(allowance.id, {
    remainingBudget: newRemaining,
    lastPaymentAt: Date.now(),
  });
  return true;
};

PubSub.subscribe("ln.sendPayment.success", success);
