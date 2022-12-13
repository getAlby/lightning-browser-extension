import PubSub from "pubsub-js";
import {
  Message,
  MessageSendPayment,
  OriginData,
  PaymentNotificationData,
} from "~/types";
import { AuditLogEntryType } from "~/types";

const pubsub = {
  publishPaymentNotification: (
    message: MessageSendPayment | Message, // 'keysend' & 'sendPaymentOrPrompt' still need the Message type
    data: Omit<PaymentNotificationData, "origin">
  ) => {
    let status = "success"; // default. let's hope for success
    if ("error" in data.response) {
      status = "failed";
    }
    const paymentData: PaymentNotificationData = {
      response: data.response,
      details: data.details,
      paymentRequestDetails: data.paymentRequestDetails,
      origin: message.origin as OriginData, // should be refactored when removing default 'Message"-type above
      event: AuditLogEntryType.TRANSACTION,
    };
    PubSub.publish(`ln.sendPayment.${status}`, paymentData);
  },
};

export default pubsub;
