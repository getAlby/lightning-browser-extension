import { Message } from "~/types";

import state from "../../state";

const request = async (message: Message) => {
  const connector = await state.getState().getConnector();
  let response;
  try {
    if (!connector.requestMethod) {
      throw new Error(
        `${message.args.method} is not supported by your account`
      );
    }
    response = await connector.requestMethod(
      message.args.method as string,
      message.args.params
    );
  } catch (e) {
    console.error(e);
    response = {
      error: e instanceof Error ? e.message : "Something went wrong",
    };
  }
  return response;
};

export default request;
