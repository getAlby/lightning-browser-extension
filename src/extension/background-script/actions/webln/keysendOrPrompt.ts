import { Message } from "../../../../types";
import {
  checkAllowance,
  sendPaymentWithAllowance,
  payWithPrompt,
} from "./sendPaymentOrPrompt";

const keysendOrPrompt = async (message: Message) => {
  const destination = message.args.destination;
  const amount = message.args.amount;
  if (typeof destination !== "string" || typeof amount !== "string") {
    return {
      error: "Destination or amount missing.",
    };
  }

  if (await checkAllowance(message.origin.host, parseInt(amount))) {
    return sendPaymentWithAllowance(message, true);
  } else {
    return payWithPrompt(message, "keysend");
  }
};

export default keysendOrPrompt;
