import utils from "~/common/lib/utils";

// TODO: add settings check if a notification should be sent
// TODO: switch to TS

const paymentSuccessNotification = (message, data) => {
  const recipient = data.origin.name;
  const paymentResponse = data.response;
  const route = paymentResponse.data.route;
  const { total_amt, total_fees } = route;
  const paymentAmount = total_amt - total_fees;

  function formatAmount(amount) {
    return `${amount} sat${amount != 1 ? "s" : ""}`;
  }

  return utils.notify({
    title: `✅ Successfully paid ${formatAmount(
      paymentAmount
    )} to »${recipient}«`,
    message: `Fee: ${formatAmount(total_fees)}`,
  });
};

const paymentFailedNotification = (message, data) => {
  let error;
  // general error
  if (data.response.error) {
    error = data.response.error;
    // lnd payment error. TODO: improve and unify error handling
  } else if (data.response.data && data.response.data.payment_error) {
    error = data.response.data.payment_error;
  }
  return utils.notify({
    title: `⚠️ Payment failed`,
    message: `Error: ${error}`,
  });
};

const lnurlAuthSuccessNotification = (message, data) => {
  return utils.notify({
    title: `✅ Login to ${data.origin.name}`,
    message: `Successfully logged into ${data.lnurlDetails.domain}`,
  });
};

const lnurlAuthFailedNotification = (message, data) => {
  return utils.notify({
    title: `⚠️ Login failed`,
    message: `${data.error}`,
  });
};

export {
  paymentSuccessNotification,
  paymentFailedNotification,
  lnurlAuthSuccessNotification,
  lnurlAuthFailedNotification,
};
