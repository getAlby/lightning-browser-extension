import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import { Message, Sender } from "~/types";

import { debitBudget } from "../../budget";
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

  if (await debitBudget(host, parseInt(amount as string))) {
    return keysendWithAllowance(message);
  } else {
    return keysendWithPrompt(message);
  }
};

async function keysendWithAllowance(message: Message) {
  try {
    const response = await keysend(message, { budgetReserved: true });
    return response;
  } catch (e) {
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
