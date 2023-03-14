import { MessageGetInfo } from "~/types";

import state from "../../state";

const getInfo = async (message: MessageGetInfo) => {
  const connector = await state.getState().getConnector();
  const info = await connector.getInfo();

  return {
    data: {
      version: "Alby",
      supports: ["lightning"],
      methods: connector.supportedMethods,
      node: {
        alias: info.data.alias,
        pubkey: info.data.pubkey,
        color: info.data.color,
      },
    },
  };
};

export default getInfo;
