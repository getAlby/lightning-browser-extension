import utils from "../../../../common/lib/utils";
import state from "../../state";
import db from "../../db";

const sendPayment = async (message, sender) => {
  const host = message.origin.host;
  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(host)
    .first();

  if (allowance) {
    return sendPaymentWithAllowance(message, allowance);
  } else {
    return sendPaymentWithPrompt(message);
  }
};

async function sendPaymentWithAllowance(message, allowance) {
  const connector = state.getState().getConnector();
  const response = await connector.sendPayment({
    paymentRequest: message.args.paymentRequest,
  });
  return response;
}

async function sendPaymentWithPrompt(message) {
  const connector = state.getState().getConnector();

  const response = await utils.openPrompt(message);
  if (response.data.confirmed) {
    const response = await connector.sendPayment({
      paymentRequest: message.args.paymentRequest,
    });
    return response;
  } else {
    return response;
  }
}

export default sendPayment;
