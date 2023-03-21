import PubSub from "pubsub-js";

import { updateAllowance } from "./allowances";
import {
  lnurlAuthFailedNotification,
  lnurlAuthSuccessNotification,
  paymentFailedNotification,
  paymentSuccessNotification,
} from "./notifications";
import { persistSuccessfulPayment } from "./persistPayments";

const subscribe = () => {
  const paymentTypes = ["sendPayment", "keysend"];

  paymentTypes.forEach((type) => {
    // @ts-expect-error typed as ln.sendPayment.success | ln.keysend.success
    PubSub.subscribe(`ln.${type}.success`, paymentSuccessNotification);
    // @ts-expect-error typed as ln.sendPayment.success | ln.keysend.success
    PubSub.subscribe(`ln.${type}.failed`, paymentFailedNotification);

    // @ts-expect-error typed as ln.sendPayment.success | ln.keysend.success
    PubSub.subscribe(`ln.${type}.success`, persistSuccessfulPayment);
    // @ts-expect-error typed as ln.sendPayment.success | ln.keysend.success
    PubSub.subscribe(`ln.${type}.success`, updateAllowance);
  });

  // @ts-expect-error typed as lnurl.auth.success
  PubSub.subscribe("lnurl.auth.success", lnurlAuthSuccessNotification);
  // @ts-expect-error typed as lnurl.auth.failed
  PubSub.subscribe("lnurl.auth.failed", lnurlAuthFailedNotification);

  console.info(`Event subscriptions registered`);
};

export { subscribe };
