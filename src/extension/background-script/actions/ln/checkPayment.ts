import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";
import { Message } from "~/types";

import state from "../../state";

const checkPayment = async (message: Message) => {
  if (typeof message.args.paymentHash !== "string") {
    return {
      error: i18n.t("errors.missing_payment_hash", commonI18nNamespace),
    };
  }
  const connector = await state.getState().getConnector();

  try {
    const response = await connector.checkPayment({
      paymentHash: message.args.paymentHash,
    });
    return response;
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default checkPayment;
