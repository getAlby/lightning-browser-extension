import PubSub from "pubsub-js";
import utils from "../../../common/lib/utils";

// TODO: add settings check if a notification should be sent

const success = (message, data) => {
  const recipient = data.origin.name;
  const paymentResponse = data.response;
  const route = paymentResponse.data.payment_route;
  const { total_amt } = route;

  return utils.notify({
    title: `Paid ${total_amt} Satoshi to ${recipient}`,
    message: `pre image: ${paymentResponse.data.payment_preimage}`,
  });
};

const failed = (message, data) => {
  return utils.notify({
    title: `Payment failed`,
    message: `Error: ${data.response.data.payment_error}`,
  });
};

PubSub.subscribe("ln.sendPayment.success", success);
PubSub.subscribe("ln.sendPayment.failed", failed);
