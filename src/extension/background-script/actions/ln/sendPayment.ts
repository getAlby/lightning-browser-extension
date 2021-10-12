import PubSub from "pubsub-js";

import state from "../../state";

export default async function sendPayment(message) {
  PubSub.publish(`ln.sendPayment.start`, message);
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
