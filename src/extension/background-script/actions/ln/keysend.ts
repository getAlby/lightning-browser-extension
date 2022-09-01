import PubSub from "pubsub-js";
import utils from "~/common/lib/utils";
import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";
import { Message } from "~/types";

import state from "../../state";

export default async function keysend(message: Message) {
  PubSub.publish(`ln.keysend.start`, message);
  const { destination, amount, customRecords } = message.args;
  if (
    typeof destination !== "string" ||
    (typeof amount !== "string" && typeof amount !== "number")
  ) {
    return {
      error: i18n.t(
        "errors.missing_destination_or_amount",
        commonI18nNamespace
      ),
    };
  }

  const connector = await state.getState().getConnector();

  let response;
  try {
    response = await connector.keysend({
      pubkey: destination,
      amount: parseInt(amount as string),
      customRecords: customRecords as Record<string, string>,
    });
  } catch (e) {
    response = {
      error:
        e instanceof Error
          ? e.message
          : i18n.t("errors.something_went_wrong", commonI18nNamespace),
    };
  }
  utils.publishPaymentNotification(message, {
    response,
    details: {
      destination: destination,
    },
  });
  return response;
}
