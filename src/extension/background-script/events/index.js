import { updateAllowance } from "./allowances";
import {
  paymentSuccessNotification,
  paymentFailedNotification,
  lnurlAuthSuccessNotification,
  lnurlAuthFailedNotification,
} from "./notifications";
import { persistSuccessfullPayment } from "./persistPayments";
import PubSub from "pubsub-js";

const subscribe = () => {
  PubSub.subscribe("ln.sendPayment.success", paymentSuccessNotification);
  PubSub.subscribe("ln.sendPayment.failed", paymentFailedNotification);

  PubSub.subscribe("ln.sendPayment.success", persistSuccessfullPayment);
  PubSub.subscribe("ln.sendPayment.success", updateAllowance);
  PubSub.subscribe("ln.keysend.success", persistSuccessfullPayment);
  PubSub.subscribe("ln.keysend.success", updateAllowance);

  PubSub.subscribe("lnurl.auth.success", lnurlAuthSuccessNotification);
  PubSub.subscribe("lnurl.auth.failed", lnurlAuthFailedNotification);

  console.log(`Event subscriptions registered`);
};

export { subscribe };
