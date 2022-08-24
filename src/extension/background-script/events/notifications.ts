import utils from "~/common/lib/utils";
import type { PaymentNotificationData } from "~/types";

const paymentSuccessNotification = (
  message: "ln.sendPayment.success",
  data: PaymentNotificationData
) => {
  function formatAmount(amount: number) {
    return `${amount} sat${amount != 1 ? "s" : ""}`;
  }

  const recipient = data.origin.name;
  const paymentResponseData = data.response;

  if ("error" in paymentResponseData) {
    return;
  }

  const route = paymentResponseData?.data.route;
  const { total_amt, total_fees } = route;
  const paymentAmount = total_amt - total_fees;

  const notificationTitle = `✅ Successfully paid ${formatAmount(
    paymentAmount
  )} ${recipient && `to »${recipient}«`}`;

  const notificationMessage = `Fee: ${formatAmount(total_fees)}`;

  return utils.notify({
    title: notificationTitle,
    message: notificationMessage,
  });
};

const paymentFailedNotification = (
  message: "ln.sendPayment.failed",
  data: PaymentNotificationData
) => {
  let error;
  const paymentResponseData = data.response;

  if ("error" in paymentResponseData) {
    // general error
    error = paymentResponseData.error;
  } else if (
    // lnd payment error
    paymentResponseData.data.payment_error
  ) {
    error = paymentResponseData.data.payment_error;
  }

  return utils.notify({
    title: `⚠️ Payment failed`,
    message: `Error: ${error}`,
  });
};

const lnurlAuthSuccessNotification = (message: FixMe, data: FixMe) => {
  return utils.notify({
    title: `✅ Login to ${data.origin.name}`,
    message: `Successfully logged into ${data.lnurlDetails.domain}`,
  });
};

const lnurlAuthFailedNotification = (message: FixMe, data: FixMe) => {
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
