import utils from "~/common/lib/utils";
import type { PaymentNotificationData, AuthNotificationData } from "~/types";

const paymentSuccessNotification = (
  message: "ln.sendPayment.success",
  data: PaymentNotificationData
) => {
  function formatAmount(amount: number) {
    return `${amount} sat${amount != 1 ? "s" : ""}`;
  }

  const recipient = data?.origin?.name;
  const paymentResponseData = data.response;

  if ("error" in paymentResponseData) {
    return;
  }

  const route = paymentResponseData?.data.route;
  const { total_amt, total_fees } = route;
  const paymentAmount = total_amt - total_fees;

  let notificationTitle = `✅ Successfully paid ${formatAmount(paymentAmount)}`;

  if (recipient) {
    notificationTitle = `${notificationTitle} to »${recipient}«`;
  }

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

const lnurlAuthSuccessNotification = (
  message: "lnurl.auth.success",
  data: AuthNotificationData
) => {
  // console.log("lnurlAuthSuccessNotification", message, data);

  let title = "✅ Login";

  if (data?.origin?.name) {
    title = `${title} to ${data.origin.name}`;
  }

  return utils.notify({
    title,
    message: `Successfully logged in to ${data.lnurlDetails.domain}`,
  });
};

const lnurlAuthFailedNotification = (
  message: "lnurl.auth.failed",
  data: {
    error: string;
  }
) => {
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
