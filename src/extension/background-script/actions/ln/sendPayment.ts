import state from "../../state";

export default async function sendPayment(message) {
  const { paymentRequest } = message.args;
  const connector = state.getState().getConnector();

  try {
    const response = await connector.sendPayment({
      paymentRequest,
    });
    return response;
  } catch (e) {
    console.log(e.message);
  }
}
