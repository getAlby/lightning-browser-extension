import { parsePaymentRequest } from "invoices";

import state from "../../state";
import utils from "../../../../common/lib/utils";

export default async function weblnPay(message) {
  const { paymentRequest } = message.args;
  const connector = state.getState().getConnector();
  const paymentRequestDetails = parsePaymentRequest({
    request: paymentRequest,
  });

  try {
    const response = await connector.sendPayment({
      paymentRequest,
    });
    utils.publishPaymentNotification(
      message.args.message,
      paymentRequestDetails,
      response
    );

    return response;
  } catch (e) {
    console.log(e.message);
  }
}
