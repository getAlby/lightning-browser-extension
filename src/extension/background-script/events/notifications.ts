import {
  getFormattedFiat,
  getFormattedSats,
} from "~/common/utils/currencyConvert";
import { getCurrencyRateWithCache } from "~/extension/background-script/actions/cache/getCurrencyRate";
import state from "~/extension/background-script/state";
import type { AuthNotificationData, PaymentNotificationData } from "~/types";

import { notify } from "./helpers";

const paymentSuccessNotification = async (
  message: "ln.sendPayment.success" | "ln.keysend.success",
  data: PaymentNotificationData
) => {
  const recipient = data?.origin?.name;
  const paymentResponseData = data.response;
  let paymentAmountFiatLocale;

  if ("error" in paymentResponseData) {
    return;
  }

  const route = paymentResponseData?.data.route;
  const { total_amt, total_fees } = route;
  const paymentAmount = total_amt;

  const { settings } = state.getState();
  const { showFiat, currency, locale } = settings;

  if (showFiat) {
    const rate = await getCurrencyRateWithCache(currency);

    paymentAmountFiatLocale = getFormattedFiat({
      amount: paymentAmount,
      rate,
      currency,
      locale,
    });
  }

  let notificationTitle = "✅ Successfully paid";

  if (recipient) {
    notificationTitle = `${notificationTitle} to »${recipient}«`;
  }

  let notificationMessage = `Amount: ${getFormattedSats({
    amount: paymentAmount,
    locale,
  })}`;

  if (showFiat) {
    notificationMessage = `${notificationMessage} (${paymentAmountFiatLocale})`;
  }

  notificationMessage = `${notificationMessage}\nFee: ${getFormattedSats({
    amount: total_fees,
    locale,
  })}`;

  return notify({
    title: notificationTitle,
    message: notificationMessage,
  });
};

const paymentFailedNotification = (
  message: "ln.sendPayment.failed" | "ln.keysend.failed",
  data: PaymentNotificationData
) => {
  let error;
  const paymentResponseData = data.response;

  if ("error" in paymentResponseData) {
    // general error
    error = paymentResponseData.error;
  }

  return notify({
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

  return notify({
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
  return notify({
    title: `⚠️ Login failed`,
    message: `${data.error}`,
  });
};

export {
  lnurlAuthFailedNotification,
  lnurlAuthSuccessNotification,
  paymentFailedNotification,
  paymentSuccessNotification,
};
