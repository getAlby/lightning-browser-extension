import lightningPayReq from "bolt11";
import PubSub from "pubsub-js";
import utils from "~/common/lib/utils";
import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";
import { Message } from "~/types";

import state from "../../state";

export default async function sendPayment(message: Message) {
  PubSub.publish(`ln.sendPayment.start`, message);
  const { paymentRequest } = message.args;
  if (typeof paymentRequest !== "string") {
    return {
      error: i18n.t("errors.missing_payment_request", commonI18nNamespace),
    };
  }

  const paymentRequestDetails = lightningPayReq.decode(paymentRequest);
  const connector = await state.getState().getConnector();

  let response;
  try {
    response = await connector.sendPayment({
      paymentRequest,
    });
  } catch (e) {
    let message;
    if (typeof e === "string") {
      message = e;
    } else if (e instanceof Error) {
      message = e.message;
    } else {
      message = i18n.t("errors.something_went_wrong", commonI18nNamespace);
    }
    response = {
      error: message,
    };
  }
  utils.publishPaymentNotification(message, {
    paymentRequestDetails,
    response,
    details: {
      description: paymentRequestDetails.tagsObject.description,
      destination: paymentRequestDetails.payeeNodeKey,
    },
  });
  return response;
}
