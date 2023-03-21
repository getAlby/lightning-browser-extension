import PubSub from "pubsub-js";
import { Message, MessageSendPayment, PaymentNotificationData } from "~/types";

const pubsub = {
  publishPaymentNotification: (
    type: "sendPayment" | "keysend",
    message: MessageSendPayment | Message, // 'keysend' & 'sendPaymentOrPrompt' still need the Message type
    data: Omit<PaymentNotificationData, "origin">
  ) => {
    let status = "success"; // default. let's hope for success
    if ("error" in data.response) {
      status = "failed";
    }
    PubSub.publish(`ln.${type}.${status}`, {
      accountId: data.accountId,
      response: data.response,
      details: data.details,
      paymentRequestDetails: data.paymentRequestDetails,
      origin: message.origin,
    });
  },
};

export default pubsub;
