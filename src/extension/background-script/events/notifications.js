import utils from "../../../common/lib/utils";

// TODO: add settings check if a notification should be sent

const paymentSuccessNotification = (message, data) => {
  const recipient = data.origin.name;
  const paymentResponse = data.response;
  const route = paymentResponse.data.payment_route;
  const { total_amt } = route;

  return utils.notify({
    title: `Paid ${total_amt} Satoshi to ${recipient}`,
    message: `pre image: ${paymentResponse.data.payment_preimage}`,
  });
};

const paymentFailedNotification = (message, data) => {
  return utils.notify({
    title: `Payment failed`,
    message: `Error: ${data.response.data.payment_error}`,
  });
};

export { paymentSuccessNotification, paymentFailedNotification };
