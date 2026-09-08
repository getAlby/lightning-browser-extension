import lightningPayReq from "bolt11-signet";
import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import { Message, Sender } from "~/types";

import db from "../../db";
import sendPayment from "../ln/sendPayment";

const sendPaymentOrPrompt = async (message: Message, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const paymentRequest = message.args.paymentRequest;
  if (typeof paymentRequest !== "string") {
    return {
      error: "Payment request missing.",
    };
  }

  const paymentRequestDetails = lightningPayReq.decode(paymentRequest);
  if (await checkAllowance(host, paymentRequestDetails.satoshis || 0)) {
    return sendPaymentWithAllowance(message);
  } else {
    return payWithPrompt(message);
  }
};

// Checks the budget and takes the amount out of it in a single transaction,
// before the payment is sent. The amount is not put back if the payment fails.
// Concurrent payments would otherwise all read the same budget and each spend
// it.
async function checkAllowance(host: string, amount: number) {
  if (!Number.isFinite(amount) || amount < 0) return false;

  const debited = await db.transaction("rw", db.allowances, async () => {
    const allowance = await db.allowances
      .where("host")
      .equalsIgnoreCase(host)
      .first();

    if (!allowance?.id || !(allowance.remainingBudget > amount)) {
      // check that the budget is higher than the amount. amount can be 0
      return false;
    }

    await db.allowances.update(allowance.id, {
      remainingBudget: allowance.remainingBudget - amount,
      lastPaymentAt: Date.now(),
    });
    return true;
  });

  if (debited) await db.saveToStorage();
  return debited;
}

async function sendPaymentWithAllowance(message: Message) {
  try {
    const response = await sendPayment(message);
    return response;
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

async function payWithPrompt(message: Message) {
  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmPayment",
    });
    return response;
  } catch (e) {
    console.error("Payment cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

export { checkAllowance, payWithPrompt, sendPaymentOrPrompt };
