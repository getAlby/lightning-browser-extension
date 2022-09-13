import utils from "~/common/lib/utils";
import { getCurrencyRateFromCache } from "~/extension/background-script/actions/cache/getCurrencyRate";
import state from "~/extension/background-script/state";
import type { PaymentNotificationData, AuthNotificationData } from "~/types";

const paymentSuccessNotification = async (
  message: "ln.sendPayment.success",
  data: PaymentNotificationData
) => {
  // console.log("1", data);

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

  //
  const { settings } = state.getState();
  const { currency } = settings;
  console.log({ currency });

  const rate = await getCurrencyRateFromCache(currency);
  console.log({ rate });
  const paymentAmountBtc = Number(paymentAmount) / 100_000_000;
  console.log({ paymentAmountBtc });
  const paymentAmountFiat = Number(paymentAmountBtc) * Number(rate);
  console.log({ paymentAmountFiat });

  const paymentAmountFiatLocale = paymentAmountFiat.toLocaleString("en", {
    style: "currency",
    currency,
  });
  console.log({ paymentAmountFiatLocale });

  let notificationTitle = `✅ Successfully paid ${formatAmount(
    paymentAmount
  )} (${paymentAmountFiatLocale})`;

  if (recipient) {
    notificationTitle = `${notificationTitle} to »${recipient}«`;
  }

  const notificationMessage = `Fee: ${formatAmount(total_fees)}`;
  console.log({ notificationTitle });

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
