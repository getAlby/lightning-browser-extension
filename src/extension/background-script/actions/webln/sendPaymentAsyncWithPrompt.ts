import utils from "~/common/lib/utils";
import { MessageSendPayment } from "~/types";

// Async payments cannot be budgeted for (they do not get saved to the extension DB)
// so always require a prompt.
async function sendPaymentAsyncWithPrompt(message: MessageSendPayment) {
  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmPaymentAsync",
    });
    return response;
  } catch (e) {
    console.error("Payment cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
}

export { sendPaymentAsyncWithPrompt };
