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

const lnurlAuthSuccessNotification = (message, data) => {
  return utils.notify({
    title: `Login to ${data.origin.name}`,
    message: `Successfully logged into ${data.lnurlDetails.url.host}`,
  });
};

const lnurlAuthFailedNotification = (message, data) => {
  const reason =
    data.authResponse &&
    data.authResponse.data &&
    data.authResponse.data.reason;
  return utils.notify({
    title: `Login failed`,
    message: `${reason}`,
  });
};

export {
  paymentSuccessNotification,
  paymentFailedNotification,
  lnurlAuthSuccessNotification,
  lnurlAuthFailedNotification
};
