import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";
import { MessageConnectPeer } from "~/types";

import state from "../../state";

const connectPeer = async (message: MessageConnectPeer) => {
  const { pubkey, host } = message.args;

  if (typeof pubkey !== "string" || typeof host !== "string") {
    return {
      error: i18n.t("errors.missing_peer_data", commonI18nNamespace),
    };
  }

  const connector = await state.getState().getConnector();
  const peer = {
    pubkey,
    host,
  };

  let response;
  try {
    response = await connector.connectPeer(peer);
  } catch (e) {
    console.error(e);
    response = {
      error:
        e instanceof Error
          ? e.message
          : i18n.t("errors.something_went_wrong", commonI18nNamespace),
    };
  }
  return response;
};

export default connectPeer;
