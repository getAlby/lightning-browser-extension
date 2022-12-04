import browser from "webextension-polyfill";
import { getFormattedFiat } from "~/common/utils/currencyConvert";
import { getCurrencyRateWithCache } from "~/extension/background-script/actions/cache/getCurrencyRate";
import state from "~/extension/background-script/state";
import i18n from "~/i18n/i18nConfig";
import type { PaymentNotificationData, AuthNotificationData } from "~/types";

const notify = (options: { title: string; message: string }) => {
  const settings = state.getState().settings;
  if (!settings.browserNotifications) return;

  const notification: browser.Notifications.CreateNotificationOptions = {
    type: "basic",
    iconUrl: "assets/icons/alby_icon_yellow_48x48.png",
    ...options,
  };

  return browser.notifications.create(notification);
};

const paymentSuccessNotification = async (
  message: "ln.sendPayment.success",
  data: PaymentNotificationData
) => {
  function formatAmount(amount: number) {
    return `${amount} ${i18n.t("common:sats", { count: amount })}`;
  }

  const recipient = data?.origin?.name;
  const paymentResponseData = data.response;
  let paymentAmountFiatLocale;

  if ("error" in paymentResponseData) {
    return;
  }

  const route = paymentResponseData?.data.route;
  const { total_amt, total_fees } = route;
  const paymentAmount = total_amt - total_fees;

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

  let notificationMessage = `Amount: ${formatAmount(paymentAmount)}`;

  if (showFiat) {
    notificationMessage = `${notificationMessage} (${paymentAmountFiatLocale})`;
  }

  notificationMessage = `${notificationMessage}\nFee: ${formatAmount(
    total_fees
  )}`;

  return notify({
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
  notify,
  paymentSuccessNotification,
  paymentFailedNotification,
  lnurlAuthSuccessNotification,
  lnurlAuthFailedNotification,
};
