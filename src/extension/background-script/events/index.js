import PubSub from "pubsub-js";
import persistSuccessfullPayment from "./persistPayments";
import updateAllowance from "./allowances";
import {
  paymentSuccessNotification,
  paymentFailedNotification,
} from "./notifications";

const subscribe = () => {
  PubSub.subscribe("ln.sendPayment.success", paymentSuccessNotification);
  PubSub.subscribe("ln.sendPayment.failed", paymentFailedNotification);

  PubSub.subscribe("ln.sendPayment.success", persistSuccessfullPayment);
  PubSub.subscribe("ln.sendPayment.success", updateAllowance);
  console.log(`Event subscriptions registered`);
};

export { subscribe };
