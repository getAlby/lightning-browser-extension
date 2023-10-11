import state from "~/extension/background-script/state";
import { MessageSendPayment } from "~/types";

export default async function sendPayment(message: MessageSendPayment) {
  const accountId = await state.getState().currentAccountId;
  if (!accountId) {
    return {
      error: "Select an account.",
    };
  }

  const { paymentRequest } = message.args;
  if (typeof paymentRequest !== "string") {
    return {
      error: "Payment request missing.",
    };
  }

  const connector = await state.getState().getConnector();

  // NOTE: currently there is no way to know if the initial payment
  //   succeeds or not. The payment might not work at all or the http request might time out
  //   before the HODL invoice is paid or times out itself.
  //   any errors thrown by sendPayment will not be caught.
  // NOTE: it is the receiver's responsibility to check if they have received the payment or not
  //   and update the UI or re-prompt the user if they haven't received a payment.
  connector.sendPayment({
    paymentRequest,
  });

  return {
    data: {},
  };
}
