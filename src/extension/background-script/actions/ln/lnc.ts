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

  const response = await connector.request(
    message.args.method,
    message.args.params
  );

  return response;
}
