import PubSub from "pubsub-js";

import { updateAllowance } from "./allowances";
import {
  lnurlAuthFailedNotification,
  lnurlAuthSuccessNotification,
  paymentFailedNotification,
  paymentSuccessNotification,
} from "./notifications";
import { persistSuccessfullPayment } from "./persistPayments";

const subscribe = () => {
  const paymentTypes = ["sendPayment", "keysend"];

  paymentTypes.forEach((type) => {
    PubSub.subscribe(`ln.${type}.success`, paymentSuccessNotification);
    PubSub.subscribe(`ln.${type}.failed`, paymentFailedNotification);

    PubSub.subscribe(`ln.${type}.success`, persistSuccessfullPayment);
    PubSub.subscribe(`ln.${type}.success`, updateAllowance);
  });

  PubSub.subscribe("lnurl.auth.success", lnurlAuthSuccessNotification);
  PubSub.subscribe("lnurl.auth.failed", lnurlAuthFailedNotification);

  console.info(`Event subscriptions registered`);
};

export { subscribe };
