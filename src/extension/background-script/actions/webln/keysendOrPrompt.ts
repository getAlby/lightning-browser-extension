import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import { Message, Sender } from "~/types";

import {
  BudgetReservation,
  persistBudget,
  releaseBudget,
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
  let response;
  try {
    response = await keysend(message, { budgetReserved: true });
  } catch (e) {
    await releaseBudget(reservation);
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
    return;
  }

  if (!response || "error" in response) {
    await releaseBudget(reservation);
  } else {
    await persistBudget();
  }
  return response;
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
