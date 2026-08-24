import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import { Message, Sender } from "~/types";

import {
  BudgetReservation,
  persistBudget,
  refundBudget,
  reserveBudget,
} from "../../budget";
import keysend from "../ln/keysend";

const keysendOrPrompt = async (message: Message, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  const destination = message.args.destination;
  const amount = message.args.amount;
  if (
    typeof destination !== "string" ||
    (typeof amount !== "string" && typeof amount !== "number")
  ) {
    return {
      error: "Destination or amount missing.",
    };
  }

  const amountInSats = parseInt(amount as string);
  const reservation = Number.isNaN(amountInSats)
    ? null
    : await reserveBudget(host, amountInSats);

  if (reservation) {
    return keysendWithAllowance(message, reservation);
  } else {
    return keysendWithPrompt(message);
  }
};

async function keysendWithAllowance(
  message: Message,
  reservation: BudgetReservation
) {
  try {
    const response = await keysend(message, { budgetReserved: true });
    if (!response || "error" in response) {
      await refundBudget(reservation);
    }
    await persistBudget();
    return response;
  } catch (e) {
    await refundBudget(reservation);
    await persistBudget();
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

async function keysendWithPrompt(message: Message) {
  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmKeysend",
    });
    return response;
  } catch (e) {
    console.error("Payment cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

export default keysendOrPrompt;
