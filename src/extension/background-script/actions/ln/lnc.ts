import { Message } from "~/types";

import state from "../../state";

export default async function (message: Message) {
  console.info(`LNC call: ${message.args.method}`);
  const connector = await state.getState().getConnector();

  if (!connector) {
    // TODO: add unlock prompt
    return Promise.resolve({
      error: "Connector not available. Is the account unlocked?",
    });
  }

  let response;
  if (connector.requestLNC) {
    response = await connector.requestLNC(
      message.args.method as string,
      message.args.params
    );
  } else {
    response = { error: "Only available with LNC" };
  }

  return response;
}
